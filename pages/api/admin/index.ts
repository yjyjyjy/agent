import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (userId !== '41e7e23e-0407-4c8e-bf65-be908dff67d3') { // prowessyang@gmail.com
    return res.status(402).json({ message: 'Not Authorized' })
  }
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (req.method === 'POST') {
    try {
      let { data: requests } = await supabaseAdmin.from('image')
        .select('id')
        // .eq('userId', userId)
        .is('feedOk', null)
        .eq('model', 'Waifu')
        .or('deleted.eq.false,deleted.is.null')
        .order('createdAt', { ascending: false })
        .limit(300)
      console.log(requests)

      for (let request of requests) {
        console.log(request.id)
        axios.post(`https://a1moderatorv2-ake5r4huta-ue.a.run.app`, { id: request.id })
      }
      return res.status(200).json({ message: 'OK' })
    } catch (error) {
      console.error('🤯:LoggingError:', JSON.stringify(error))
      res
        .status(500)
        .json({ error: { statusCode: 500, message: error.message } });
    }
  }
}
