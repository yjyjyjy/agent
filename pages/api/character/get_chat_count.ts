// import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    // const supabase = createPagesServerClient({ req, res })
    // const { data: { session } } = await supabase.auth.getSession()
    // const userId = session?.user?.id
    // if (!userId) {
    //     return res.status(402).json({ message: 'Unauthorized' })
    // }
    if (req.method === 'POST') {
        const char_id = req.body.char_id
        try {
            const chatCount = await redis.hget(`character:${char_id}`, 'message_count')
            return res.status(200).json({ message_count: chatCount? chatCount : 0 })
        } catch (error) {
            console.log('getChatCount.error', error)
            return res.status(500).json({ message_count: 0 })
        }
    }
}