import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { redis } from 'lib/redis'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  // how many messages and tokens are spent on this character
  if (req.method === 'POST') {
    const charId = req.body.charId
    try {
      const charData = await redis.hgetall(`character:${charId}`)
      if (!charData) {
        return res.status(404).json({ message: 'Not found' })
      }
      return res.status(200).json(charData)
    } catch (error) {
      return []
    }
  }
}