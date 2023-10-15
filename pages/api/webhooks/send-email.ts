import { jsonToHtml } from '@/utils/json-to-html';
import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_ACCESS_REGION });

export default async function handler(req, res) {
  const { body, method } = req;

  if (method === 'POST') {
    const { json, email } = body;
    const html = jsonToHtml(json);



    const ses = new AWS.SES();

    try {
      const params = {
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: html,
          },
          Subject: {
            Data: "Ins Summary",
          },
        },
        // Source: process.env.AWS_SECRET_SOURCE,
      };
      let response = await ses.sendEmail(params).promise();
      res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email' });
    }

    console.log(body);
    res.status(200).json({ message: 'success' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${method} not allowed` });
  }
}



// import welcomeEmail from './welcomeEmail';

AWS.config.update({ region: process.env.AWS_ACCESS_REGION });

export default async function handler(req, res) {
  // const emailHtml = render(<welcomeEmail />);
  const params = {
    Destination: {
      ToAddresses: [req.body.record.email],
    },
    Message: {
      Body: {
        Html: ,
      },
      Subject: {
        Data: "Welcome",
      },
    },
    Source: process.env.AWS_SECRET_SOURCE,
  };

  const ses = new AWS.SES();

  try {
    let response = await ses.sendEmail(params).promise();
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}