import { redis } from "@/lib/redis";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

import axios from "axios";
import { v4 as uuid } from 'uuid'

export default async function handler(req, res) {
  // const supabase = createPagesServerClient({ req, res })
  // const { data: { session } } = await supabase.auth.getSession()
  // const userId = session?.user?.id
  // if (!userId) {
  //   return res.status(402).json({ message: 'Unauthorized' })
  // }
  if (req.method === 'POST') {
    const channel_id = req.body.channel_id
    const messages = req.body.messages
    try {
      await redis.hset(
        `chat:${channel_id}`, {
        'messages': messages
      })
      // console.log('writeChat.done', messages)
      return res.status(200).json({
        message: 'success'
      })
    } catch (error) {
      console.log('🤯 write_message Error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}