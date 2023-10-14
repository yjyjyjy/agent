import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { db } from "../../../firebase/config";
import { query, collection, doc, where, endBefore, deleteDoc, limit, orderBy, addDoc, getDocs, startAfter } from "@firebase/firestore";
import {checkIfCreator} from "../creator/checkIfCreator";

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (req.method === 'POST') {
    const charId = req.body.charId;
    const postToDel = req.body.postId;

    if (!userId) {
      return res.status(402).json({ message: 'Unauthorized' })
    }

    if (!await checkIfCreator(userId, charId)) {
      return res.status(402).json({ message: 'Unauthorized' })
    }

    const collectionRef = collection(db, "posts", charId, "posts");
    const dd = await deleteDoc(doc(collectionRef, postToDel));

    console.log(`🔥⛺️␡ del_post.del ${postToDel} -> ${charId}`);
    
    return res.status(200).json({ message: 'success' });
  }
}