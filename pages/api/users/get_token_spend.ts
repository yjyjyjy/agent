import { getUserDetailsBackend, getTokenBalanceBackend } from '@/utils/backendUtils'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { redis } from 'lib/redis'

export default async function handler(req, res) {
  const channel_id = req.body.channel_id

  if (req.method === 'POST') {
    redis.hget(`olivia:config:${channel_id}`, 'token_spend').then((tokenSpend) => {
      return res.status(200).json({ tokenSpend: tokenSpend })
    }
    ).catch((error) => {
      console.log('getChannelTokenSpend.error', error)
      return res.status(500).json({ error: error, tokenSpend: 0 })
    }
    )
  }
}