import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { useUser } from '@/utils/useUser';
import { redis } from 'lib/redis'
import axios from "axios"
import { useState } from "react"
import { error } from "console"

export default async function handler(req, res) {
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (req.method === 'GET') {
        const name = req.query.name;
        try {
            const { data: charItem, error: fetchDataError } = await supabaseAdmin
                .from('characters')
                .select('id')
                .eq('name', name).single()
            if (!charItem || error) {
                return res.status(404).json({message : 'not found'});
            }
            return res.status(200).json({id : charItem.id});
        } catch (error) {
            //TODO: RETURN DEFAULT CHARACTERS
            return res.status(500).json({ error: error.message })
        }
    }
}