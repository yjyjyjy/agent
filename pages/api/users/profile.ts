import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  if (req.method === 'PUT') {
    console.log('req.body -----', req.body);
    if (req?.body?.user_name) {
      if (!req?.body?.user_name || !req?.body?.user_name?.match(/^[a-zA-Z0-9_.-]*$/)) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
    }
    try {
      await supabase.from('users').update({ ...req.body }).eq('id', userId)
      return res.status(200).json({ message: 'success' })
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}