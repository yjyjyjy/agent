import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import axios from 'axios';
import FormData from 'form-data';
import {checkIfCreator} from "../creator/checkIfCreator";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (!await checkIfCreator(userId, req.body.charId)) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  
  
  const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v2/direct_upload`
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
  }

  const formData = new FormData();
  formData.append('requireSignedURLs', 'true');

  try {
    const response = await axios({
      method: 'POST',
      url: CLOUDFLARE_URL,
      headers: { ...headers, ...formData.getHeaders() },
      data: formData
    });
    const { uploadURL } = response.data.result
    return res.status(200).json({ uploadURL })
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}