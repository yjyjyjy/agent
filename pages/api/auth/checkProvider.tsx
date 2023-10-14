//next js api function that checks if email exist from supabase

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      
      const email = req.body.email;
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('provider')
        .eq('email', email)

    console.log(error)

    if (error) {
        return res.status(401).json({ error: error.message });
    }
    if (data) {
        return res.status(200).json({ data: data});
    }
}