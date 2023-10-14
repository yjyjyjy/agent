import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { useUser } from '@/utils/useUser';
import { redis } from 'lib/redis'
import axios from "axios"
import { useState } from "react"

export default async function handler(req, res) {
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }


    if (req.method === 'GET') {
        try {

            const topCharacters = await redis.zrange('character_rank', 0, 3, {
                rev: true
            })


            console.log('topCharacters', topCharacters)

            const { data: charItems, error: fetchDataError } = await supabaseAdmin
                .from('characters')
                .select('id, image_url, created_by, description, name, hidden, url_slug')
                .in('id', topCharacters)

            const filtered = charItems.filter(item => {
                return item.id && item.image_url && !item.hidden;
            });

            // Map to new shape
            const items = filtered.map(item => {
                return {
                    id: item.id,
                    name: item.name,
                    url_slug: item.url_slug,
                    image_url: item.image_url,
                    created_by: item.created_by,
                    description: item.description
                };
            });
            // console.log('getChar.items', items)
            const shuffledItems = shuffleArray(items);

            return res.status(200).json({ images: shuffledItems});
        } catch (error) {

            //TODO: RETURN DEFAULT CHARACTERS
            return res.status(500).json({ error: error.message })
        }
    }
}