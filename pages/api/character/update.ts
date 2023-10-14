import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  if (req.method === 'PUT') {
    console.log('req.body -----', req.body);

    // review stage which list check     
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('under_review')
      .eq('id', userId)
      .single();
    
    if (userData.under_review) {
      const { data, error } = await supabaseAdmin.from('characters').update(
        {
          under_review: true,
          review_payload : req.body.updateData
        }
      ).eq('id', req.body.charId);
      return res.status(200).json({ message: 'success', underReview: true })
    } 

    try {
      const { data, error } = await supabaseAdmin.from('characters').update(req.body.updateData).eq('id', req.body.charId);
      console.log('data', data, error)
      return res.status(200).json({ message: 'success' })
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }


  if (req.method === 'POST') {
    
    req.body.created_by = userId

    const { data, error } = await supabaseAdmin
      .from('characters')
      .upsert(req.body) // name, url_slug, bio, created_at
      .select()
    console.log('data', data)
    if (error) {
      console.log(error)
      console.log(JSON.stringify(error))
      console.log('Error occurred while inserting data:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });

    } else {
      console.log('Data inserted successfully!');
      res.status(200).json({ success: true , row: data[0]});
    }
  }

}