//next js api function that checks if email exist from supabase

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      
    const { data, error } = await supabaseAdmin.from('characters').select('url_slug').eq('url_slug', req.body.handle)
    const count = data ? data.length : 0;
    if (error) {
        console.log(error)
        return res.status(401).json({ error: error.message });
    }
    if (data) {
        return res.status(200).json({ message: 'success', isUnique: count===0 });
    }
}