import { NextApiHandler } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

const Logger: NextApiHandler = async (req, res) => {
  console.log(req.body)
  if (req.method === 'POST') {
    const supabase = createPagesServerClient({ req, res });
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous'
    console.log(`🪴 logger:user:${userId}:body:${JSON.stringify(req.body)}`)
    return res.status(200).send('success');

  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default Logger;
