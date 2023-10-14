import aws from 'aws-sdk';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js'

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Replace with your AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Replace with your AWS Secret Access Key
  region:  process.env.AWS_ACCESS_REGION  // Or your AWS SES region
});

const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { from, subject, content } = req.body;

  if (!from || !subject || !content) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // const emailParams = {
    //   from,
    //   to: 'junyu@yuzu.fan',
    //   subject,
    //   html
    // };

    // const result = await transporter.sendMail(emailParams);
    // write into supabase
    const { data, error } = await supabaseAdmin
      .from('creator_signup_list')
      .insert([
        { email: from, content: content },
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
