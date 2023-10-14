import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import axios from "axios";
import { redis } from 'lib/redis'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // call for midlayer
        try {
            const { data, status } = await axios.post(process.env.MID_LAYER_API_ENDPOINT + '/phase_up',
                {
                    channel_id : req.body.channel_id, 
                    char_id : req.body.char_id, 
                    human_prefix : req.body.human_prefix,
                    next_phase : req.body.next_phase,
                },
                {
                    timeout: 60000 // 60 seconds
                }
            );
            console.log('response', status, data)

            if (data.statusCode === 200) {
                const reply = data.response
                return res.status(200).json({
                    message: 'success',
                    botMsg: reply
                })
            }
            return res.status(500).json({ message: 'api error' })
        } catch (error) {
            console.log('chat error', error);
            return res.status(500).json({ message: error.message })
        }


    }
}