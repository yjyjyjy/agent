import { sleep } from '@/utils/helpers';
import axios from 'axios';
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return res.status(402).json({ message: 'Unauthorized' })
  }
  console.log("Request received")
  if (req.method !== 'POST') {
    // Handle any other HTTP method
    return res.status(405).json({ error: 'Method Not Allowed, only POST is allowed.' });
  }

  try {
    const response = await axios.post('http://www.anydream.xyz/api/a1_request', {
      model: req.body.model,
      endpoint: "txt2img",
      params: {
        seed: -1,
        steps: 25,
        width: 512,
        height: 768,
        n_iter: 1,
        prompt: `(masterpiece, best quality, ultra-detailed, best shadow), (detailed background), (beautiful detailed face), high contrast, (best illumination, an extremely delicate and beautiful), ((cinematic light)), colorful, hyper detail, dramatic light, intricate details, ${req.body.prompt}, hyperrealistic, octane, render, 8k, best quality, (realistic, photo-realistic:1.37)`,
        tiling: false,
        cfg_scale: 7,
        batch_size: 1,
        sampler_name: "DPM++ 2M Karras",
        negative_prompt: "Arsehole, fat, (worst quality:2), (low quality:2), (normal quality:2), lowres, ((monochrome)), ((grayscale)), bad anatomy, DeepNegative, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, cropped, poorly drawn hands, poorly drawn face, mutation, deformed, extra fingers, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutated hands, polar lowres, bad body, bad proportions, gross proportions, text, error, missing fingers, missing arms, missing legs"
      },
      aspectRatio: { "width": 512, "height": 768 },
      apiKey: "OliviaIsTheBest-5fe57730-d850-4231-9fc1-3adbc6b06184"
    });

    if (response.status === 200) {
      console.log(response.data.requestId)
      const startTime = new Date()
      do {
        const now = new Date()
        // @ts-ignore
        console.log((now - startTime))
        // @ts-ignore
        const checkImageGenResponse = await axios.post(`http://www.anydream.xyz/api/a1_request/check`, {
          requestId: response.data.requestId,
          apiKey: "OliviaIsTheBest-5fe57730-d850-4231-9fc1-3adbc6b06184"
        })
        console.log(checkImageGenResponse.status, checkImageGenResponse.data)
        if ((['server_error', 'success'].includes(checkImageGenResponse.data.status)
          // @ts-ignore
        ) || (now - startTime) / 1000 > 60 * 1 // 1 minutes time out
        ) {
          if (checkImageGenResponse.data.images
             && checkImageGenResponse.data.images[0]
             && checkImageGenResponse.data.images[0]["imgUrl"]) {
            return res.status(200).json({ url: checkImageGenResponse.data.images[0]["imgUrl"] });
          } else {
            console.log('Failed to fetch anydream Image');
            return res.status(500).json({ error: 'anydream img fetch time out' });
          }
        }
        await sleep(1000)
      } while (true)
    } else {
      console.log('Failed to fetch anydream Image');
      return res.status(500).json({ error: 'Failed to fetch anydream Image' });
    }
  } catch (error) {
    console.log('An error occurred:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }

};
