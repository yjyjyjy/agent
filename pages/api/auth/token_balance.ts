// 1. When a discord user doesn't have a tokenBal, discord call this webhook.
// 2. An UUID is created and matched to a tokenBal in Redis. Return the UUID and token amount.
// 3. Maintain a lookup table between the temp UUID mapping to discordID
// 4. when that user register with discord, if the same discord ID is detected, copy the current tokenBal, set a new tokenBal using the new real userId, delete the old TokenBal in Redis.

import { createClient } from '@supabase/supabase-js';
import { getTokenBalanceBackend, guardWebhook } from '@/utils/backendUtils'
import { v4 as uuid } from 'uuid'
import { redis } from 'lib/redis';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {

  if (req.method === 'GET') {
    const supabase = createPagesServerClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const userId = session.user.id
    console.log(`🪵:{GET}/api/a1_request/anyToken:userId:${userId}`)
    const response = await getTokenBalanceBackend(userId);
    // console.log('getTokenBalanceBackend',response);
    return res.status(200).json(response)
  }

  if (req.method === 'POST') {
    const userId = req?.body?.id;
    const response = await getTokenBalanceBackend(userId);
    return res.status(200).json(response)
  }
}