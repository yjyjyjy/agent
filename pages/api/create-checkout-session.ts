import { NextApiHandler } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

import { createOrRetrieveCustomer } from '@/utils/supabase-admin';
import { getURL } from '@/utils/helpers';
import { stripe } from '@/utils/stripe';


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const CreateCheckoutSession: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    console.log('🔴 req.body', req.body)
    const priceId = req.body.default_price;
    // const price = req.body.metadata.price;
    const tokenAmount = req.body.metadata.tokenAmount;
    const quantity = 1;

    try {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const customer = await createOrRetrieveCustomer({
        userId: user.id,
        email: user?.email || ''
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        customer,
        billing_address_collection: 'auto',
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        metadata: {tokenAmount: tokenAmount},
        mode: 'payment',
        success_url: `https://www.yuzu.fan/chat/`,
        cancel_url: `https://www.yuzu.fan/chat/`,
        // automatic_tax: { enabled: true }
      });

      console.log('🔴 checkoutSession', checkoutSession)
      const { id, livemode } = checkoutSession;

      await supabaseAdmin.from('stripe_event_logs').insert({
        id, eventType: 'checkout.session.created', livemode, data: checkoutSession, createdAt: new Date()
      });

      return res.status(200).json({ checkoutSessionId: checkoutSession.id });
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default CreateCheckoutSession;

