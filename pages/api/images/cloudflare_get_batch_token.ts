import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import axios from "axios";

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (req.method === 'GET') {
    try {
      const response = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v1/batch_token`, {}, {
          headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`
          } 
      });
      console.log('get batch token cf res=', response.data);
      return res.status(200).json({ message: 'success', batchToken : response.data.result.token})
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}