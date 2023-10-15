const endpoint = 'https://www.waterbear.one/api/webhooks/send-email';

const postMessage = async (body) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    return response;
}

(async () => {
    try {

        const email = 'toddpspm@gmail.com'
        const instagramData = require('./instagram.json');
        const youtubeData = require('./youtube.json');
        

        let res = await postMessage({
            email,
            json: instagramData
        });
        
        console.log(res);

        res = await postMessage({
            email,
            json: youtubeData
        });
        
        console.log(res);
    } catch (e) {
        console.log(e)
    }
})();