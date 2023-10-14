import { redis } from "@/lib/redis";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { getTokenBalanceBackend } from '@/utils/backendUtils'

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
    const char_id = req.body.char_id
    const messages = req.body.messages
    const userId = req.body.user_id
    const human_prefix = req.body.human_prefix
    const human_input = req.body.human_input

    // check for token first 💀
    const tokenBalance = await getTokenBalanceBackend(userId);
    if (tokenBalance.freeTextToken <= 0 && tokenBalance.paidToken <= 0) {
      // not enough token, reject
      return res.status(402).json({ message: 'Not enough token' })
    }

    try {
      const { data, status } = await axios.post(process.env.MID_LAYER_API_ENDPOINT + '/chat',
        {
          channel_id: channel_id,
          human_prefix: human_prefix,
          human_input: human_input
        },
        {
          timeout: 60000 // 60 seconds
        }
      );
      console.log('response', status, data)

      if (data.statusCode === 200) {
        const reply = data.response
        const lewd = data.lewd
        const image_request = data.image
        const lewd_text = data.lewd_text != '' ? data.lewd_text : null

        return res.status(200).json({
          message: 'success',
          botMsg: lewd_text ? lewd_text : reply,
          sell_image: image_request,
          image_tier: data.lewd_tier,
          sell_text: lewd_text,
          pitch: data.pitch_response ? data.pitch_response : null,
          pitch_image: data.pitch_attachments ? data.pitch_attachments : null,
        })
      }
      return res.status(500).json({ message: 'api error' })
    } catch (error) {
      console.log('🤯 send_message Error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}