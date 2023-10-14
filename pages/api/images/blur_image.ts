import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'
import { stringSimilarity } from "string-similarity";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import axios from "axios";

export default async function handler(req, res) {
  // const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  // const supabase = createPagesServerClient({ req, res })
  // const { data: { session } } = await supabase.auth.getSession()
  // const userId = session?.user?.id

  async function blurImage(imageURL) {
    try {
      // Fetch the image from the remote URL
      const response = await axios.get(imageURL, { responseType: 'arraybuffer' });

      // Check if the image was successfully fetched
      if (response.status !== 200) {
        res.status(404).send('Image not found');
        return null;
      }

      // Process the image using sharp and return base64 string
      return sharp(response.data)
        .blur(100) // Adjust the blur level as needed
        .toBuffer()
        .then(buffer => buffer.toString('base64'))
        .catch(err => {
          console.error('Error processing image:', err);
          return null;
        });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  if (req.method === 'POST') {
    const url = req.body.url;
    try {
      const blurredImage = await blurImage(url);
      if (blurredImage) {
        return res.status(200).json({
          message: 'success', blurredImage: `data:image/jpeg;base64,${blurredImage}`
        });
      } else {
        return res.status(500).json({ message: 'error' });
      }
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ message: error.message })
    }
  }
}