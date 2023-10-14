export const CDN_ENDPOINT = process.env.NEXT_CDN_ENDPOINT || 'https://d26j0ayly12e8r.cloudfront.net'

export function getDomainName(str: string) {
    return new URL(str).hostname
}

export function replaceOriginDomainWithCdn(str: string, cdn_endpoint?: string) {
    let cdn_endpoint_url = new URL(cdn_endpoint || CDN_ENDPOINT)
    let parsed = new URL(str)
    parsed.hostname = cdn_endpoint_url.hostname
    return parsed.toString()
}

interface ReplaceOriginDomainWithCdnInArrayOptions {
    image: { imgUrl: string }[]
}
/**
 * 
 * @param array the array of image items
 * @param cdn_endpoint the cdn endpoint (env variable used default)
 * @returns An array where every image url has been replaced by the configured CDN
 */
export function replaceOriginDomainWithCdnInArray(array: ReplaceOriginDomainWithCdnInArrayOptions[], cdn_endpoint?: string) {
    // console.log('replaceOriginDomainWithCdnInArray', array)
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        // console.log('---element---', element)
        for (let j = 0; j < element.image.length; j++) {
            const images = array[i].image
            // console.log('---images---', images)
            for (let k = 0; k < images.length; k++) {
                const image = images[k]
                if (image.imgUrl) {
                    image.imgUrl = replaceOriginDomainWithCdn(image.imgUrl, cdn_endpoint)
                }
            }
        }
    }
    return array
}