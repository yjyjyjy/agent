import aws from 'aws-sdk';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js'



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { from, content, channel_id } = req.body;

  if (!from || !content) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {

    const { data, error } = await supabaseAdmin
      .from('feedback_chat')
      .insert([
        { email: from, content: content, channel_id: channel_id },
      ])
    if (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to write into database' });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
