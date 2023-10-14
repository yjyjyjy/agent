import { getPaidGrantBalance } from '@/utils/backendUtils'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { redis } from 'lib/redis'
import { v4 as uuid } from 'uuid'

export default async function handler(req, res) {
  console.log('here')
  const supabase = createPagesServerClient({ req, res })
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: { session } } = await supabase.auth.getSession()
  const adminId = session?.user?.id
  if (adminId !== '41e7e23e-0407-4c8e-bf65-be908dff67d3') { //
    return res.status(402).json({ message: 'Not Authorized' })
  }
  let { userId, amount } = req.body
  amount = parseInt(amount)
  if (req.method === 'POST') {
    try {
      const id = `earned:${uuid()}`
      const { data, error } = await supabaseAdmin.from('token_transaction').upsert([
        { id, userId, eventType: 'earned', amount, expiresAt: new Date('2050-01-01'), createdAt: new Date() },
      ])
      if (error) { console.log(error); throw error }
      let tokenBal = await redis.get(`tokenBal:${userId}`)
      // @ts-ignore
      tokenBal.push({ id, amount, type: 'earned', expiresAt: new Date('2050-01-01').getTime() })
      await redis.set(`tokenBal:${userId}`, tokenBal)
      // await getPaidGrantBalance({ userId, setRedis: true })
      return res.status(200).json({ message: 'OK' })
    } catch (error) {
      console.error('🤯:LoggingError:', JSON.stringify(error))
      res
        .status(500)
        .json({ error: { statusCode: 500, message: error.message } });
    }
  }
}