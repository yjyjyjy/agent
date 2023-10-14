import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { en } from "@supabase/auth-ui-react";

import axios from "axios";
import { redis } from 'lib/redis'
const redis_prefix = process.env.REDIS_PREFIX

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (req.method === 'POST') {
    try {
      console.log('image req', req?.body);
      const response = await axios.post(process.env.MID_LAYER_API_ENDPOINT+'/request_for_image', req?.body);
      // console.log('image res', response);
      return res.status(200).json({ message: 'success', image: response.data.statusCode==200? response.data.response : false})
    } catch (error) {
      console.log('image error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}