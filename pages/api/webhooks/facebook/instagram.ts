
import { supabase } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js'


export default async function handler(req, res) {

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  // Check if a token and mode is in the query string of the request
  console.log("🔴 agent received.body", JSON.stringify(req.body))
  await supabaseAdmin.from('test').insert({ content: JSON.stringify(req.body) })
  // if (mode && token) {
  //   // Check the mode and token sent is correct
  //   if (mode === "subscribe" && token === 'e85d7e7a-053f-4347-9a6c-5eb2ba334df5') {
  //     // Respond with the challenge token from the request
  //     console.log("🔴 agent WEBHOOK_VERIFIED");
  //     console.log('🔴 agent req', req)
  //     console.log('🔴 agent req', JSON.stringify(req))
  //     console.log()
  //     res.status(200).send(challenge);
  //   } else {
  //     // Respond with '403 Forbidden' if verify tokens do not match
  //     console.error("🔴 agent 403");
  //     res.sendStatus(403);
  //   }
  // }
  // res.status(400).send({ error: '🔴 agent 400' });
  res.status(200).send(challenge);
}
