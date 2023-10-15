import { jsonToHtml } from '@/utils/json-to-html';
import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_ACCESS_REGION });
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const createSendEmailCommand = async (toAddress, fromAddress, email_html) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [
        toAddress,
      ],
    },
    Message: {
      Body: {
        Html: {
          Data: email_html.welcome_email_content,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: email_html.welcome_message,
      },
    },
    Source: fromAddress,
  })
}

export default async function handler(req, res) {
  const { body, method } = req;


  if (method === 'POST') {
    try {
      const { json, email } = body;
      const sesClient = new SESClient({ region: process.env.AWS_ACCESS_REGION });
      const html = jsonToHtml(json);
      const sendEmailCommand = await createSendEmailCommand(email, 'founder@anydream.xyz', html);

      try {
        await sesClient.send(sendEmailCommand);
        // await supabase.from('users').update({ new_user_email_sent_at: new Date().toISOString() }).eq('id', userId)
        // console.log(`🪵 handle_new_user ${userId}, 🟢 Welcome email sent successfully!`)
        return res.status(200).json({ message: 'Email sent successfully!' });
      } catch (error) {
        // console.log(`🪵 handle_new_user ${userId}, 🤯 welcome new user send email error: `, error);
        res.status(500).json({ error: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
      res.statusš(500).json({ message: 'Email sent failed!' });
    }
    console.log(body);
    res.status(200).json({ message: 'success' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${method} not allowed` });
  }
}
