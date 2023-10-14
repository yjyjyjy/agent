import { getUserDetailsBackend, getTokenBalanceBackend } from '@/utils/backendUtils'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
 
export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (req.method === 'GET') {
    const ud = await getUserDetailsBackend(session?.user?.id)
    const tb = await getTokenBalanceBackend(session?.user?.id);
    console.log('get_user_info', ud, tb)
    return res.status(200).json({ userDetails: ud, tokenBalance: tb });
  }


  if (req.method === 'POST') {
    const ud = {
      user_name: 'user',
      id: req.body.ip,
    }
    const tb = await getTokenBalanceBackend(req.body.ip);
    console.log('get_user_info', ud, tb)
    return res.status(200).json({ userDetails: ud, tokenBalance: tb, tempChat: true});
  }

}