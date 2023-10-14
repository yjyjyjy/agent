import axios from "axios";
import { redis } from 'lib/redis'
import { v4 as uuid } from "uuid";
import { type Chat } from '@/lib/types'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const ip = req.body.ip
      const charId = req.body.charId

      const pipeline = redis.pipeline()
      const chats: string[] = await redis.zrange(`user:chat:${ip}`, 0, -1, {
        rev: true
      })
      if (chats.length === 0) {
        return res.status(200).json({
          message: 'success',
          first_time: true,
          channel_id: null
        })
      }

      for (const chat of chats) {
        pipeline.hgetall(chat)
      }

      const results: Chat[] = await pipeline.exec()

      const charIds = results.map((chat: Chat) => chat.charId) // list of char this id chatted with

      // check if charIds contains char_id
      return res.status(200).json({
        message: 'success',
        first_time: charIds.includes(charId) ? false : true,
        channel_id: charIds.includes(charId) ? results[charIds.indexOf(charId)].id : null
      })
    } catch (error) {
      console.log('/temp_chat.error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}