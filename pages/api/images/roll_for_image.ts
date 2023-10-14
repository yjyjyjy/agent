import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { distance, closest } from 'fastest-levenshtein'
import { db } from "../../../firebase/config";
import { collection, query, where, doc, getDocs } from "@firebase/firestore";

export default async function handler(req, res) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // if (!userId) {
  //   return res.status(402).json({ message: 'Unauthorized' })
  // }
  if (req.method === 'POST') {
    const { char_id, channel_id, human_input, image_tier } = req.body
    try {
      console.log('🪵roll_for_image: ', req.body)
      // get user visited images first
      // const { data: channelItems, error: fetchChannelDataError } = await supabaseAdmin
      //   .from('channels')
      //   .select('viewed_images')
      //   .eq("channel_id", channel_id)
      // const viewedImages = channelItems[0].viewed_images ? channelItems[0].viewed_images : [];
      // getting the viewed images from firebase
      let viewedImages = [];
      if (userId) { // only logged in user can have viewed images
        const viewedImagesQuery = await getDocs(query(collection(doc(collection(db, "bookmarks"), userId), "posts"), where("channel_id", "==", channel_id)));
        viewedImages = viewedImagesQuery.docs.map(doc => doc.data().uuid);
        console.log('viewedImages', viewedImages);
      }

      console.log('🪵roll_for_image: viewedImages', viewedImages)

      const { data: imageItems, error: fetchCharDataError } = await supabaseAdmin
        .from('creator_content')
        .select('id, image_url, description, tier')
        .eq("character_id", char_id)

      // console.log('imageItems', imageItems);
      console.log('🪵roll_for_image: imageItems', imageItems)

      // split content with description or without
      const withDescription = imageItems.filter(item => item.description && !viewedImages.includes(item.id) && item.tier === image_tier)
      const withoutDescription = imageItems.filter(item => !item.description && !viewedImages.includes(item.id) && item.tier === image_tier)

      if (withDescription.length === 0 && withoutDescription.length === 0 && imageItems.length > 0) {
        // just random pick, and override
        const randomPick = imageItems[Math.floor(Math.random() * imageItems.length)];
        return res.status(200).json({ message: 'success', url: randomPick.image_url, imgId: randomPick.id, blur: false });
      }

      console.log('withDescription', withDescription);
      console.log('withoutDescription', withoutDescription);
      if (withDescription.length > 0) {
        // find best match use similarity
        // collect all descriptions and convert to string
        const descriptions = withDescription.map(item => item.description);
        const bestMatchDescription = closest(human_input, descriptions)
        const bestMatch = withDescription.filter(item => item.description === bestMatchDescription)[0];
        return res.status(200).json({
          message: 'success',
          url: bestMatch.image_url,
          imgId: bestMatch.id,
        });
      }

      if (withoutDescription.length > 0) {
        // do a random pick
        const randomPick = withoutDescription[Math.floor(Math.random() * withoutDescription.length)];
        return res.status(200).json({ message: 'success', url: randomPick.image_url, imgId: randomPick.id });
      }
      return res.status(204).json({ message: 'no image left', url: null })
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}