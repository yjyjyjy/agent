import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js';
import type { Database } from 'types_db';

import axios from "axios";
import { redis } from 'lib/redis'
const redis_prefix = process.env.REDIS_PREFIX

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
      const char_id = req?.body.char_id
      if (!char_id) {
        let { data: lastChat, error } = await supabaseAdmin
          .from('channels')
          .select('channel_id').eq('user_id', userId)
          .order('last_chat_at', { ascending: false })
          .limit(1)
          .single()
        console.log('lastChat', lastChat)
        // check if char_id in user_records
        return res.status(200).json({
          message: 'success',
          channel_id: lastChat? lastChat.channel_id : null
        })

      } else {
        let { data: user_records, error } = await supabaseAdmin
          .from('channels')
          .select('channel_id, char_id')
          .eq('user_id', userId);
        // check if char_id in user_records
        const isCharIdInSessions = user_records?.find((item) => item.char_id === char_id)
        return res.status(200).json({
          message: 'success',
          chatExist: isCharIdInSessions ? true : false,
          channel_id: isCharIdInSessions ? isCharIdInSessions.channel_id : null
        })
      }

    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}