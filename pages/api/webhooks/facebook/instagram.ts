export default async function handler(req, res) {
  const { body } = req;

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === 'e85d7e7a-053f-4347-9a6c-5eb2ba334df5') {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      console.log('🔴 req', req)
      console.log('🔴 req', JSON.stringify(req))
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
}
