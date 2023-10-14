import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import axios from "axios";
import { IncomingForm } from 'formidable';


export const config = {
  api: {
    bodyParser: false,  // Disabling Next.js's body parser
  },
};

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: err.toString() });
      }
      // files contains the uploaded files
      console.log('files', files);
      try {
        const response = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v1`, files.file, {
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
            } 
        });
        console.log('cf res=', response.data);
        return res.status(200).json({ message: 'success', url : response.data.result.variants[0]})
      } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: error.message })
      }
    });
  }
}