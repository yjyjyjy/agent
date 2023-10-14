import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (req.method === 'POST') {


    try {
      const { data: charItems, error: fetchDataError } = await supabaseAdmin
        .from('characters')
        .select('id, image_url, created_by, description, name, character_config').eq('id', req.body.char_id);
      if (charItems.length > 0) {
        return res.status(200).json(charItems[0]);
      }
      if (fetchDataError) {
        console.log('get_character.error', fetchDataError.message)
        return res.status(500).json({ message: fetchDataError.message })
      }
      return res.status(404).json({ message : 'character not found' });
    } catch (error) {
      console.log('get_character.error', error)
      return res
      .status(500)
      .json({ error: { statusCode: 500, message: JSON.stringify(error) } });
    }
  }
}