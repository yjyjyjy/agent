


import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js';
import type { Database } from 'types_db';
import { redis } from 'lib/redis'

export default async function handler(req, res) {

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const userId = user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const channel_id = req?.body.channel_id
      const char_id = req?.body.char_id

      // check if this channel exists or not
      const uid = await redis.hget<string>(`chat:${channel_id}`, 'userId')
      if (!uid) {
        return res.status(200).json({message: 'channel not found'})
      }

      const { data, error } = await supabaseAdmin
        .from('channels')
        .upsert({
          user_id: userId,
          char_id: char_id,
          last_chat_at: new Date().toISOString(),
          channel_id: channel_id
        }, { onConflict: 'channel_id', ignoreDuplicates: false })
      
      if (error) {
        console.log('error', error)
      }
      // check if char_id in user_records
      return res.status(200).json({
        message: 'success'
      })
    } catch (error) {
      console.log('error', error)
      return res.status(500).json({ message: error.message })
    }
  }
}