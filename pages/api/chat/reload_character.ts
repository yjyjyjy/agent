import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

import axios from "axios";
import { redis } from 'lib/redis'
const redis_prefix = process.env.REDIS_PREFIX

export default async function handler(req, res) {
  // const supabase = createPagesServerClient({ req, res })
  // const { data: { session } } = await supabase.auth.getSession()
  // const userId = session?.user?.id
  // if (!userId) {
  //   return res.status(402).json({ message: 'Unauthorized' })
  // }
  if (req.method === 'POST') {
    // reload character
    try {
      const channel_id = req?.body.channel_id
      // update mid layer
      const { data, status } = await axios.post(process.env.MID_LAYER_API_ENDPOINT + '/load_story',
        {
          channel_id: channel_id,
          story_id: req?.body.char_id,
          human_prefix: req?.body.human_prefix
        }
      );
      // done
      return res.status(200).json({ message: 'success' })
    } catch (error) {
      console.log('load character error', error)
      return res.status(500).json({ message: error.message })
    }
  }
}