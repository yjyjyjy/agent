import { jsonToHtml } from '@/utils/json-to-html'
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const createSendEmailCommand = (toAddress, fromAddress, email_html) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [
        toAddress,
      ],
    },
    Message: {
      Body: {
        Html: {
          Data: email_html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: 'email summary',
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
      console.log('🪵 send-email, 📧 email: ', email);
      console.log('🪵 send-email, 📧 sesClient: ', sesClient);
      const html = jsonToHtml(json);
      console.log('🪵 send-email, 📧 html: ', html);
      const sendEmailCommand = createSendEmailCommand(email, 'founder@anydream.xyz', html);
      console.log('🪵 send-email, 📧 sendEmailCommand: ', sendEmailCommand);

      try {
        await sesClient.send(sendEmailCommand);
        // await supabase.from('users').update({ new_user_email_sent_at: new Date().toISOString() }).eq('id', userId)
        // console.log(`🪵 handle_new_user ${userId}, 🟢 Welcome email sent successfully!`)
        return res.status(200).json({ message: 'Email sent successfully!' });
      } catch (error) {
        // console.log(`🪵 handle_new_user ${userId}, 🤯 welcome new user send email error: `, error);
        res.status(500).json({ error });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Email sent failed!' });
    }
  } else {
    res.status(405).json({ message: `Method ${method} not allowed` });
  }
}
