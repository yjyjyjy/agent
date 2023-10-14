import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });
  const { data, error } = await supabase.from('site_notification').select('color, message')
  console.log(data)
  if (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
  let message = { color: '', message: '' }
  if (data.length > 0) {
    message = data[0]
  }
  return res.status(200).json(message)
}