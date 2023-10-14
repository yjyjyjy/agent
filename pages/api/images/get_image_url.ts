import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  const { id } = req.body;
  if (!id) {
    return res.status(402).json({ message: 'No image id' })
  }

  const query_url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v1/${id}`


  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`
  }

  const data = await fetch(query_url, { method: 'GET', headers }).then(
    (res) => res.json()
  )
  console.log('🟢 get_image_url data', data)
  const imgUrl = data?.result?.variants[0]
  return res.status(200).json({ imgUrl })
}