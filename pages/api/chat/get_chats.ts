import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { useUser } from '@/utils/useUser';
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    const supabase = createPagesServerClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
        return res.status(402).json({ message: 'Unauthorized' })
    }
    if (req.method === 'GET') {
        console.log('get chats')
        try {
            const pipeline = redis.pipeline()
            const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
                rev: true
            })

            for (const chat of chats) {
                pipeline.hgetall(chat)
            }

            const results = await pipeline.exec()
            // console.log('getChats.results', results)

            // if no chats, return with top 3 characters ranked by message count
            // if (results.length === 0) {
            //     // if no chats, return with top 3 characters ranked by message count
            //     const topCharacters = await redis.zrange('character_rank', 0, 2, {
            //         rev: true
            //     })
            //     // cast topCharacters into list of Chat type
            //     topCharacters.forEach((char, index) => {
            //         topCharacters[index] = {
            //             charId: char,
            //         } as Chat
            //     })
            //     console.log('topCharacters', topCharacters)
            //     return res.status(200).json(topCharacters as Chat[])
            // }

            return res.status(200).json(results as Chat[])
        } catch (error) {
            return []
        }
    }
}