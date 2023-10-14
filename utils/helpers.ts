import { Price } from 'types';

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`; // www.anypal.ai
  // Make sure to including trailing `/`.
  // url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const postData = async ({
  url,
  data
}: {
  url: string;
  data?: { price: Price, referral: string };
}) => {
  console.log('posting,', url, data);

  const res: Response = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.log('Error in postData', { url, data, res });

    throw Error(res.statusText);
  }

  return res.json();
};

export const toDateTime = (secs: number) => {
  var t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function findAspectRatioDimensions({ inputWidth, inputHeight }) {
  if (!inputWidth || !inputHeight) return { width: 512, height: 768 } //default to portrait
  const aspectRatioName = inputWidth > inputHeight ? 'landscape' : inputWidth === inputHeight ? 'square' : 'portrait'
  const width = aspectRatioList.find(r => r.name === aspectRatioName).width
  const height = aspectRatioList.find(r => r.name === aspectRatioName).height
  return { width, height }
}

export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// export const getBase64FromUrl = async (url): Promise<any> => {
//   const data = await fetch(url,{
//     headers: {
//       'Access-Control-Allow-Origin' : '*',
//     }
//   });
//   const blob = await data.blob();
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     reader.onloadend = () => {
//       const base64data = reader.result;
//       resolve(base64data);
//     }
//   });
// }

export const imageToDataUri = async (img, width, height): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      console.log('Image loaded');
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL())
    }
    image.onerror = reject
    image.src = img;
  })
}

export const getTokenUnit = (params) => {
  if (params.upscale) return 7; // If up-scaling then token size will increase
  return (params.batch_size || 1) * 2;
}
