import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { useUser } from '@/utils/useUser';
import { redis } from 'lib/redis'
import { channel } from "diagnostics_channel"

export default async function handler(req, res) {

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const supabase = createPagesServerClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
        return res.status(402).json({ message: 'Unauthorized' })
    }
    if (req.method === 'POST') {
      const id = req.body.channel_id
      try {
        const uid = await redis.hget<string>(`chat:${id}`, 'userId')
        if (uid !== session?.user?.id) {
          return res.status(500).json({ message: 'Unauthorized' })
        }

        await redis.del(`chat:${id}`)
        await redis.zrem(`user:chat:${uid}`, `chat:${id}`)

        const { error: deleteErr } = await supabaseAdmin.from('channels').delete().eq('channel_id', id)
        if (deleteErr) {
          console.log('deleteErr', deleteErr) 
        }
        return res.status(200).json({ message: 'Channel cleared' })
      } catch (error) {
        console.log('deleteChannel.error', error)
        return res.status(500).json({ message: error })
      }
    }
}