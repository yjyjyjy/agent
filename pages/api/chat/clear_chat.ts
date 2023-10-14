import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { useUser } from '@/utils/useUser';
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    // const supabase = createPagesServerClient({ req, res })
    // const { data: { session } } = await supabase.auth.getSession()
    // const userId = session?.user?.id
    // if (!userId) {
    //     return res.status(402).json({ message: 'Unauthorized' })
    // }
    if (req.method === 'POST') {
			const channel_id = req.body.channel_id
			
			await redis.del(`olivia:message_store:${channel_id}`)
			await redis.set(`olivia:cache:${channel_id}`, '')
			await redis.set(`olivia:compressed_memory_cache:${channel_id}`, '')
			
			return res.status(200).json({ message: 'Chat cleared' })
    }
}