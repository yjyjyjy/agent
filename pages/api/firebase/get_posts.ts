import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { db } from "../../../firebase/config";
import { query, collection, doc, where, endBefore, limit, orderBy, addDoc, getDocs, startAfter } from "@firebase/firestore";


const bufferToHex = (buffer) => {
  let hexArray = Array.from(new Uint8Array(buffer), byte =>
    ('00' + byte.toString(16)).slice(-2)
  );
  return hexArray.join('');
}
const EXPIRATION = 60 * 60; // 1 hour


export const generateSignedURL = async ({
  url: urlString,
}: {
  url: string;
}) => {
  const url = new URL(urlString);
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(process.env.CLOUDFLARE_IMAGE_KEY);
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Attach the expiration value to the `url`
  const expiry = Math.floor(Date.now() / 1000) + EXPIRATION;
  url.searchParams.set("exp", expiry.toString());
  // `url` now looks like
  // https://imagedelivery.net/cheeW4oKsx5ljh8e8BoL2A/bc27a117-9509-446b-8c69-c81bfeac0a01/mobile?exp=1631289275

  const stringToSign = url.pathname + "?" + url.searchParams.toString();
  // e.g. /cheeW4oKsx5ljh8e8BoL2A/bc27a117-9509-446b-8c69-c81bfeac0a01/mobile?exp=1631289275
  // Generate the signature
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(stringToSign));
  const sig = bufferToHex(new Uint8Array(mac).buffer);

  // And attach it to the `url`
  url.searchParams.set("sig", sig);

  return url.toString();
};


export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (req.method === 'POST') {
    const charId = req.body.char_id;
    const lastPostTime = req.body.timestamp;
    const limitNum = req.body.limit ? req.body.limit : 10;
    console.log(`🔥⛺️📖 get_posts.query ${charId} -> start before ${new Date(lastPostTime?.seconds * 1000).toLocaleString()}, limit ${limitNum}`);
    const postQuery = lastPostTime ?
      await getDocs(query(collection(doc(collection(db, "posts"), charId), "posts"), orderBy("timestamp", "desc"), startAfter(new Date(lastPostTime?.seconds * 1000)), limit(limitNum)))
      :
      await getDocs(query(collection(doc(collection(db, "posts"), charId), "posts"), orderBy("timestamp", "desc"), limit(limitNum)));

    if (!userId) {
      // return default page as it is, replace image field with cover 
      return res.status(200).json({
        posts: postQuery.docs.map(
          doc => {
            const data = doc.data();
            if (data.status === 'pending') {
              // skip pending posts, continue to next
              return null;
            }
            return {
              ...data,
              postId: doc.id,
              bag: data.price != 0 ? data.image : undefined, // hide it : free
              image: data.price != 0 ? data.cover : data.image, // cover : image
              imageCount: data.image? data.image.length : 0
            }
          }
        )
      })
    }

    // get user paid images 
    const paidPostQuery = await getDocs(query(collection(doc(collection(db, "paid"), userId), charId)));
    const paidPostIds = paidPostQuery.docs.map(doc => doc.data().postId);
    // iterate through posts and check if it is paid, if not paid, replace image field with cover
    const posts = await Promise.all(postQuery.docs.map(
      async doc => {
        if (paidPostIds.includes(doc.id)) {
          // image is encrypted, we need to get the signed url
          let data = doc.data();
          // check if image is a list or single image
          if (Array.isArray(data.image)) {
            const signedUrlList = await Promise.all(data.image.map(async (image) => {
              return await generateSignedURL({
                url: image.replace('https:/imagedelivery.net', 'https://imagedelivery.net'),
              });
            }));
            return {
              ...data,
              postId: doc.id,
              image: signedUrlList
            }
          } else {
            // else it is a single image
            const signedUrl = await generateSignedURL({
              url: data.image.replace('https:/imagedelivery.net', 'https://imagedelivery.net'),
            });
            return {
              ...data,
              postId: doc.id,
              image: signedUrl
            }
          }
        } else {
          const data = doc.data();
          return {
            ...data,
            postId: doc.id,
            bag: data.price != 0 ? data.image : undefined,
            image: data.price != 0 ? data.cover : data.image, // cover : image
            imageCount: data.image? data.image.length : 0

          }
        }
      }
    ))
    return res.status(200).json({ posts: posts});
  }
}