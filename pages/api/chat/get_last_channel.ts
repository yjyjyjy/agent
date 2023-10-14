import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabase = createPagesServerClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  console.log('🔴🔴🔴🔴 userId', userId)

  try {
    let { data: lastChannel, error } = await supabaseAdmin
      .from('channels')
      .select('id,' + 'characters(id, url_slug)')
      .eq('user_id', userId)
      .order('last_chat_at', { ascending: false })
      .limit(1)
      .single()
    // lastChannel {
    //   id: 'dfbb6a51-5980-4e08-9397-fe247231b8dd',
    //   characters: { id: '0a593276-11e2-46e1-8c7b-c1c8c72cf9ed', url_slug: 'lexi' }
    // }
    if (error) {
      console.log('🤯 error', error)
    }

    console.log('🔴🔴🔴🔴 lastChannel', lastChannel)
    // check if char_id in user_records
    return res.status(200).json({
      channelId: lastChannel?.id,
      charId: lastChannel?.characters?.id,
      charSlug: lastChannel?.characters?.url_slug
    })
  }
  catch (error) {
    return res.status(500).json({ message: error.message })
  }
}