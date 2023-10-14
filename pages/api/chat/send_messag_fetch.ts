import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { StreamingTextResponse, AIStream} from 'ai'

import axios from "axios";
import { redis } from 'lib/redis'
import { NextRequest, NextResponse } from "next/server";
import { Database } from 'types_db';

export const runtime = 'edge'


export default async function handler(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  if (req.method === 'POST') {
    // read from json string
    const json = await req.json()
    console.log('send_message.json',json)
    const channel_id = json.id
    const messages = json.messages
    const lastMessage = messages[messages.length - 1]

    try {
      const response = await fetch(process.env.MID_LAYER_API_ENDPOINT+'/chat',
      { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel_id : channel_id,
          human_prefix : 'the dev',
          human_input : lastMessage.content
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('/chat.response', data)
        const title = messages[0].content.substring(0, 100)
        const id = channel_id
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const aiMessage = data.response
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: aiMessage,
              role: '<character>'
            }
          ]
        }
        await redis.hmset(`chat:${id}`, payload)
        await redis.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
        console.log('end send_message')
        return new Response(aiMessage)
      }
      return new Response('error : did not get reponse')
      // StreamingTextResponse(new ReadableStream(lastMessage.content))
    } catch (error) {
      console.log('send_message.error', error)
      return new Response(error.message, {
        status: 500
      })
    }
  }
}