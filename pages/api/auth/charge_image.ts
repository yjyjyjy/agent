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
    try {
      const userId = session.user.id
      let tokenBal = await redis.get(`tokenBal:${userId}`)
      const freeCost = 1
      const cost = 10
      let charged = false
      console.log('img beforeCharge.tokenBal', tokenBal)

      for (let grant of tokenBal) {
        if (grant.id === 'free_image' && grant.amount >= freeCost) {  
          grant.amount -= freeCost;
          grant.lastSpentAt = Date.now();
          charged = true;
          break;
        }        
        if (grant.type !== 'free' && grant.amount >= cost) {
          grant.amount -= cost;
          grant.lastSpentAt = Date.now();
          charged = true;
          break;      
        }
      }

      if (charged) {
        console.log('img afterCharge.tokenBal', tokenBal)
        await redis.set(`tokenBal:${userId}`, tokenBal)
      }
      return res.status(200).json({message : 'success'});
    } catch (error) {
      console.log('img afterCharge.error', error)
      return res.status(500).json({message : 'error'});
    }
  }
}