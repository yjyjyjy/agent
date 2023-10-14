import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      
      const char_id = req.body.char_id;
      const { data, error } = await supabaseAdmin
      .from('characters')
      .select('url_slug, page_name, description')
      .eq('id', char_id)


    console.log(error)

    if (error) {
        return res.status(401).json({ error: error.message });
    }
    if (data) {
        return res.status(200).json({ id: data });
    }
}