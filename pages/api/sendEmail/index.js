import AWS from 'aws-sdk';
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
                Html: {
                    Data: `<!doctypehtml><meta charset=utf-8><meta content="ie=edge"http-equiv=x-ua-compatible><title>Welcome Email</title><meta content="width=device-width,initial-scale=1"name=viewport><style>@media screen{@font-face{font-family:'Source Sans Pro';font-style:normal;font-weight:400;src:local('Source Sans Pro Regular'),local('SourceSansPro-Regular'),url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff')}@font-face{font-family:'Source Sans Pro';font-style:normal;font-weight:700;src:local('Source Sans Pro Bold'),local('SourceSansPro-Bold'),url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff')}}a,body,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table,td{mso-table-rspace:0;mso-table-lspace:0}img{-ms-interpolation-mode:bicubic}a[x-apple-data-detectors]{font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;line-height:inherit!important;color:inherit!important;text-decoration:none!important}div[style*="margin: 16px 0;"]{margin:0!important}body{width:100%!important;height:100%!important;padding:0!important;margin:0!important}table{border-collapse:collapse!important}a{color:#000}img{height:auto;line-height:100%;text-decoration:none;border:0;outline:0}</style><body style=background-color:#e9ecef><div class=preheader style=display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0>A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border=0 cellpadding=0 cellspacing=0 width=100% style="margin:20px 0; padding: 100px 0px;    background: #e9ecef;"><tr><td align=center bgcolor=#e9ecef><table border=0 cellpadding=0 cellspacing=0 width=100% style=max-width:600px><tr><td align=left bgcolor=#ffffff><h1 style="text-align:center;display:block;font-family:cursive; padding-top: 30px;">Welcome to Yuzu</h1></table><tr><td align=center bgcolor=#e9ecef><table border=0 cellpadding=0 cellspacing=0 width=100% style=max-width:600px><tr><td align=left bgcolor=#ffffff style="padding:24px;font-family:'Source Sans Pro',Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;text-align:center"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Welcome</h1><p style=margin:0>Thank you for signing up with Paste. We strive to produce high quality email templates that you can use for your transactional or marketing needs.<tr><td align=left bgcolor=#ffffff><table border=0 cellpadding=0 cellspacing=0 width=100%><tr><td align=center bgcolor=#ffffff style="padding:25px 12px"><table border=0 cellpadding=0 cellspacing=0><tr><td align=center bgcolor=#1a82e2 style=border-radius:6px><a href=https://www.anydream.xyz rel="noopener noreferrer"style="display:inline-block;padding:16px 36px;font-family:'Source Sans Pro',Helvetica,Arial,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px;background-color:rgb(15 118 110/1)"target=_blank>Visit Website</a></table></table></table></table>`,
                },
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