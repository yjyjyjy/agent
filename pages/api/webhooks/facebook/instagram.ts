export default async function handler(req, res) {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  console.log("🔴 agent received", req);
  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === 'e85d7e7a-053f-4347-9a6c-5eb2ba334df5') {
      // Respond with the challenge token from the request
      console.log("🔴 agent WEBHOOK_VERIFIED");
      console.log('🔴 agent req', req)
      console.log('🔴 agent req', JSON.stringify(req))
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      console.error("🔴 agent 403");
      res.sendStatus(403);
    }
  }
}
