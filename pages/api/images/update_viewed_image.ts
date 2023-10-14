import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { db } from "../../../firebase/config";
import { collection, addDoc } from "@firebase/firestore";

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(200).json({ message: 'Unauthorized user, we dont cache views' })
  }
  if (req.method === 'POST') {
    const imageUuid = req.body.imgId;
    const imageUrl = req.body.url;
    const channel_id = req.body.channel_id;
    const charName = req.body.charName;

    try {
      // const { data: channelItems, error: fetchChannelDataError } = await supabaseAdmin
      //   .from('channels')
      //   .select('viewed_images')
      //   .eq("channel_id", channel_id)
      // const viewedImages = channelItems[0].viewed_images ? channelItems[0].viewed_images : [];
      // const { data: updateChannelItems, error: updateChannelDataError } = await supabaseAdmin
      //   .from('channels')
      //   .update({ viewed_images: [...viewedImages, imageUuid] })
      //   .eq("channel_id", channel_id)

      const collectionRef = collection(db, "bookmarks", userId, "posts");
      addDoc(collectionRef, {
        caption: `from chat with ${charName}`,
        image: imageUrl,
        timestamp: new Date(),
        uuid: imageUuid,
        channel_id: channel_id,
        character_name: charName
      })
      return res.status(200).json({
        message: 'success'
      });
    } catch (error) {
      console.log('update_viewed_image.error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}