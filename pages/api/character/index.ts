import { createClient } from '@supabase/supabase-js';
import type { Database } from 'types_db';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      console.log('🔴')
      console.log(req.body)
      req.body.created_by = user.id

      console.log('🔴🔴')
      const { data, error } = await supabaseAdmin
        .from('characters')
        .upsert(req.body) // id, name, description, character_config, created_at
        .select()
      console.log('data', data)
      if (error) {
        console.log(error)
        console.log(JSON.stringify(error))
        console.log('Error occurred while inserting data:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });

      } else {
        console.log('Data inserted successfully!');
        res.status(200).json({ success: true });
      }

    } catch (error) {
      console.log('An error occurred:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🔴')
      console.log(req.body)
      const { error } = await supabaseAdmin.from('characters')
        .delete()
        .eq('id', req.body.id)
        .eq('created_by', user.id)

      if (error) {
        console.log('Error occurred while delete char:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });

      } else {
        console.log('Char Delete Successfully!');
        res.status(200).json({ success: true });
      }

    } catch (error) {
      console.log('An error occurred:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

};