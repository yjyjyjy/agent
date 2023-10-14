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
    if (req.method === 'POST') {
        const id = req.body.id
        const uid = await redis.hget<string>(`chat:${id}`, 'userId')
        if (uid !== userId) {
            return {
              error: 'Unauthorized'
            }
          }

        try {
            await redis.del(`chat:${id}`)
            await redis.zrem(`user:chat:${userId}`, `chat:${id}`)
            revalidatePath('/')

            return true
        } catch (error) {
            return null
        }
    }
}