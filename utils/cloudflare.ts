import axios from 'axios';

type Image = {
    imageFile: Blob;
};

export async function getSignedUrl() {
    const data = await fetch('/api/images/get_signed_url_public', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json())
    return data?.uploadURL
}


export async function uploadFile({ file, signedUrl }) {
    const data = new FormData()
    data.append('file', file)
    const upload = await fetch(signedUrl, {
        method: 'POST',
        body: data,
    }).then((r) => r.json())
    console.log('🟢 upload', upload)
    return upload?.result?.id
}

// upload to cloudflare
export const uploadSingleImageCDN = async ({ imageFile }: Image) => {
    console.log('🟢 imageFile', imageFile);

    // send in and get the response url
    const signedUrl = await getSignedUrl()
    if (!signedUrl) { return console.error('No signed url') }

    // frontend upload
    const id = await uploadFile({ file: imageFile, signedUrl })
    if (!id) { return console.error('Upload failed') }

    const response = await axios.post('/api/images/get_image_url', { id })
    const imgUrl = response?.data?.imgUrl
    console.log('🟢🟢🟢 imgUrl', imgUrl)
    return imgUrl
};

export const uploadMultipleImagesIntoCharacter = async ({ imageFiles, slug }) => {
    console.log('🟢 imageFile', imageFiles);
    const promiseArray = imageFiles.map((imageFile) => uploadSingleImageCDN(imageFile))
    console.log('🟢🟢🟢 promiseArray', promiseArray)
    const imagesUrls = await Promise.all(promiseArray)
    console.log('🟢🟢🟢 imagesUrls', imagesUrls)
    return imagesUrls
};

