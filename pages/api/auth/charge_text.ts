// 1. When a discord user doesn't have a tokenBal, discord call this webhook.
// 2. An UUID is created and matched to a tokenBal in Redis. Return the UUID and token amount.
// 3. Maintain a lookup table between the temp UUID mapping to discordID
// 4. when that user register with discord, if the same discord ID is detected, copy the current tokenBal, set a new tokenBal using the new real userId, delete the old TokenBal in Redis.

import { getTokenBalanceBackend } from '@/utils/backendUtils'
import { redis } from 'lib/redis';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'


export const chargeToken = async (userId: string, cost: number) => {
  let tokenBal = await redis.get(`tokenBal:${userId}`)
  let charged = false
  let chargedFrom = ''

  for (let grant of tokenBal) {
    if (grant.type === 'free' && grant.amount >= cost) {
      grant.amount -= cost;
      grant.lastSpentAt = Date.now();
      charged = true;
      chargedFrom = 'free';
      break;
    }
    if (grant.type !== 'free' && grant.amount >= cost) {
      grant.amount -= cost;
      grant.lastSpentAt = Date.now();
      charged = true;
      chargedFrom = grant.type;
      break;
    }
  }

  if (charged) {
    await redis.set(`tokenBal:${userId}`, tokenBal) // update
    const tb = await getTokenBalanceBackend(userId); // get update
    return { tokenBalance: tb, chargedFrom: chargedFrom };
  }
  // not enough token balance, return empty tokenBal
  const tb = await getTokenBalanceBackend(userId);
  return {
    tokenBalance: tb, // return as it is
    chargedFrom: 'free'
  }
}




export default async function handler(req, res) {

  if (req.method === 'POST') {
    // assume there's an ID override
    let userId = req.body.ip
    if (!userId) { // if no ID override, get the user ID from session
      const supabase = createPagesServerClient({ req, res })
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      userId = session.user.id
    }
    const cost = req.body.cost;
    const { tokenBalance, chargedFrom } = await chargeToken(userId, cost);
    return res.status(200).json({ tokenBalance, chargedFrom });
  }

}