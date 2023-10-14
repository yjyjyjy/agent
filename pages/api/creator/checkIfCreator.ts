
import { createClient } from '@supabase/supabase-js';

export const checkIfCreator = async (id, charId) => {

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // check for chararcter creator
    const { data: charData, error : charError } = await supabaseAdmin
        .from('characters')
        .select('created_by')
        .eq('id', charId)
        .single();

    if (charError) {
        console.log(charError)
        return false;
    }

    if (charData.created_by === id) {
        return true;
    }


    const { data, error } = await supabaseAdmin
        .from('users')
        .select('is_creator')
        .eq('id', id)
        .single();

    if (error) {
        console.log(error)
        return false;
    }

    return data.is_creator;
    
}
        
export default async function handler(req, res) {
   
    const isCreator = await checkIfCreator(req.body.id, req.body.charId);
    return res.status(200).json({ isCreator : isCreator });
   
}