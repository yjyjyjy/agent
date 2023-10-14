import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { v4 as uuid } from 'uuid'
import axios from "axios";
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    const supabase = createPagesServerClient({ req, res })
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    const { slug, ip } = req.body

    if (!userId && !ip) {
        return res.status(402).json({ message: 'Need to have either IP or userId' })
    }

    if (req.method === 'POST') {
        try {
            // ✅ get Character
            console.log('✅ get Character', slug, userId, ip)
            let { data: character, error: fetchCharacterError } = await supabaseAdmin
                .from('characters')
                .select('id, image_url, created_by, description, page_name, name, preview_images, character_config, banner_image, price_tags, free_content_grant, url_slug, bio, under_review')
                .eq('url_slug', slug).single()

            if (!character || fetchCharacterError) {
                return res
                    .status(500)
                    .json({ error: { statusCode: 500, message: "Cannot find character" } });
            }

            // ✅ get channelId
            console.log('✅ get channelId')
            let channelId, fetchChannelError, channelData
            if (userId) {
                ({ data: channelData, error: fetchChannelError } = await supabaseAdmin
                    .from('channels')
                    .select('id')
                    .eq('char_id', character.id)
                    .eq('user_id', userId))
            } else {
                ({ data: channelData, error: fetchChannelError } = await supabaseAdmin
                    .from('channels')
                    .select('id')
                    .eq('char_id', character.id)
                    .eq('user_ip', ip))
            }
            if (channelData && channelData.length > 0) {
                channelId = channelData[0].id
            }
            if (fetchChannelError) {
                console.log('🤯 fetchChannelError', fetchChannelError)
                return res
                    .status(500)
                    .json({ error: { statusCode: 500, message: 'fetchChannelError' } });
            }

            // ✅ (optional) if the channel doesn't exist, create a channel
            console.log("✅ (optional) if the channel doesn't exist, create a channel")
            let channel
            if (!channelId) {
                channelId = uuid()
                // update mid layer
                console.log(channelId, character.id)
                const resp = await axios.post(process.env.MID_LAYER_API_ENDPOINT + '/load_story',
                    // const { data, status } = await axios.post(process.env.MID_LAYER_API_ENDPOINT + '/load_story',
                    {
                        channel_id: channelId,
                        story_id: character.id,
                        human_prefix: 'user'
                    }
                );
                const data = resp.data
                // update message storage in redis
                const id = channelId
                const title = data.ai_prefix
                const createdAt = Date.now()
                const path = `/chat/${channelId}`
                channel = {
                    id,
                    title,
                    userId: userId || ip,
                    createdAt,
                    path,
                    messages: [
                        {
                            id: `${id}-${createdAt}-greeting`,
                            content: data.response,
                            role: '<character>'
                        },
                        {
                            id: `${id}-${createdAt}-image`,
                            content: character.preview_images[0],
                            imgId: 'demo-pic',
                            blur: true,
                            tier: -1,
                            role: 'image_link'
                        }
                    ],
                    charId: character.id
                }

                console.log('🔴🔴🔴🔴 channel', channel)
                await redis.hset(`chat:${id}`, channel)
                await supabaseAdmin.from('channels').upsert({
                    id: channelId,
                    char_id: character.id,
                    user_id: userId,
                    user_ip: ip,
                    created_at: new Date().toISOString(),
                    last_chat_at: new Date().toISOString()
                }).select()
                // await redis.zadd(`user:chat:${userId || ip}`, {
                //     score: createdAt,
                //     member: `chat:${id}`
                // })
            } else {
                channel = await redis.hgetall(`chat:${channelId}`)
                await supabaseAdmin.from('channels').update({
                    last_chat_at: new Date().toISOString()
                }).eq('id', channelId)
            }
            console.log('✅ channel', channel)
            console.log('✅ character', character)
            return res.status(200).json({ character, channel })
        } catch (error) {
            console.log('getChat.error', error)
            return res.status(500).json({ message: error.message })
        }
    }
}