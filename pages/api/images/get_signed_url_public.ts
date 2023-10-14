import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }

  const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v2/direct_upload`
  console.log('🟢 CLOUDFLARE_URL', CLOUDFLARE_URL)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`
  }
  console.log('🟢 headers', headers)
  // let { id } = req.body;
  const response = await fetch(CLOUDFLARE_URL, {
    method: 'POST',
    headers
  }).then(
    (res) => res.json()
  )
  console.log('🟢 response', response)
  const { id, uploadURL } = response.result
  console.log('🟢 ', response.result)
  res.status(200).json({ id, uploadURL, url: `https://upload.imagedelivery.net/${process.env.CLOUDFLARE_ACC_ID}/${id}` })
}