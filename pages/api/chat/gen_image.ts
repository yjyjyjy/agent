import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { en } from "@supabase/auth-ui-react";

import axios from "axios";
import { redis } from 'lib/redis'
import { v4 as uuid } from 'uuid'

const redis_prefix = process.env.REDIS_PREFIX

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (req.method === 'POST') {
    const channel_id = req.body.channel_id
    const messages = req.body.messages
    const human_prefix = req.body.human_prefix
    const human_input = req.body.human_input

    try {
      console.log('gen image req', req?.body);
      const response = await axios.post(process.env.MID_LAYER_API_ENDPOINT+'/gen_image', 
      {
        channel_id: channel_id,
        human_prefix: human_prefix,
        human_input: human_input
      }, {
        timeout: 60000 // 60 seconds
      });
      if (response.data.statusCode === 200 && response.data.url != '') {
        // save image to db
        await redis.hset(
          `chat:${channel_id}`, {'messages': [
              ...messages,
              {
                id: uuid(),
                content: response.data.url,
                role: 'image_link'
              }
            ]})
      }
      if (response.data.statusCode != 200 ) {
        console.log('📸 gen image error', response.data);
        return res.status(500).json({ message: response.data.message })
      }
      return res.status(200).json({ message: 'success', url: response.data.statusCode==200? response.data.url : ""})
    } catch (error) {
      console.log('📸 gen image error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}