import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { en } from "@supabase/auth-ui-react";

import axios from "axios";

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (req.method === 'POST') {
    try {
      // console.log('post req here', req?.body);
      const response = await axios.post(process.env.OPENAI_MOD_API, req?.body, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`
        }  
      });
      // console.log('mod res', response.data.results[0].categories.sexual);
      return res.status(200).json({ message: 'success', filter: response.status == 200? response.data.results[0].categories.sexual : false})
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}