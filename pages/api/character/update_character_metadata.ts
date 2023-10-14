import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    const supabase = createPagesServerClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
        return res.status(402).json({ message: 'Unauthorized' })
    }
    if (req.method === 'POST') {
        const char_id = req.body.char_id
        const channel_id = req.body.channel_id
        const cost = req.body.cost
        const type = req.body.type
        const pipeline = redis.pipeline()

        try {
            // update character hits, and token spend on
            if (type === 'text') {
                await pipeline.hincrby(`character:${char_id}`, 'message_count', 1)
                await pipeline.hincrby(`character:${char_id}`, 'token_spend_message', cost)
            } else if (type === 'image') {
                await pipeline.hincrby(`character:${char_id}`, 'image_count', 1)
                await pipeline.hincrby(`character:${char_id}`, 'token_spend_image', cost)
            }
            // update token spend on both character and channel
            await pipeline.hincrby(`character:${char_id}`, 'token_spend', cost)
            const tokenSpend = await pipeline.hincrby(`olivia:config:${channel_id}`, 'token_spend', cost)
            // update character rank based on message_count using sorted set
            await pipeline.zincrby('character_rank', 1, char_id)

            // execute pipeline
            await pipeline.exec()
            return res.status(200).json({ message: 'success', tokenSpend: tokenSpend })
        } catch (error) {
            console.log('writeCharMeta.error', error)
            return res.status(500).json({ error: error })
        }
    }
}