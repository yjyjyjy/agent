

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Readable } from 'node:stream';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/utils/stripe';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  updateTokenPurchase
} from '@/utils/supabase-admin';

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false
  }
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  'customer.created',
  'customer.updated',
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ??
      process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    // 🌳 check if the event is from stripe
    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    console.log('🔴 event', event)
    if (relevantEvents.has(event.type)) {
      // 🌳 log the event
      const { error: stripeEventLogError } = await supabaseAdmin.from('stripe_event_logs').insert({
        id: event.id, eventType: event.type, data: event.data, livemode: event.livemode, createdAt: new Date(event.created * 1000)
      });
      if (stripeEventLogError) {
        console.log('🔴 stripeEventLogError', stripeEventLogError)
      }

      try {
        switch (event.type) {
          case 'customer.created':
          case 'customer.updated':
            await supabaseAdmin.from('customers').update({
              lastEventId: event.id,
              // @ts-ignore
            }).eq('stripe_customer_id', event.data.object.id);
            break;
          case 'product.created':
          case 'product.updated':
            await upsertProductRecord(event.id, event.data.object);
            break;
          case 'price.created':
          case 'price.updated':
            await upsertPriceRecord(event.id, event.data.object);
            break;
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            await manageSubscriptionStatusChange({
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              createAction: event.type === 'customer.subscription.created',
              stripeEventId: event.id,
              // @ts-ignore
              invoice: subscription.latest_invoice || subscription.invoice,
            })
            break;
          case 'checkout.session.completed':

            var checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            console.log('🔴 payment success', checkoutSession)

            if (checkoutSession.mode === 'subscription') {
              const subscriptionId = checkoutSession.subscription;
              await manageSubscriptionStatusChange({
                subscriptionId,
                customerId: checkoutSession.customer as string,
                createAction: true,
                stripeEventId: event.id,
                // @ts-ignore
                invoice: subscription.latest_invoice || subscription.invoice,
              });
            }

            //check if the payment is matching a product id
            // @ts-ignore
            var checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            if (checkoutSession.mode === 'payment') {
              console.log('🔴 payment triggered', checkoutSession)
              await updateTokenPurchase({
                customerId: checkoutSession.customer as string,
                stripeEventId: event.id,
                amount: checkoutSession.metadata.tokenAmount,
              });
            }

            break;
          default:
            throw new Error('Unhandled relevant event!');
        }
      } catch (error) {
        console.log(error);
        return res
          .status(400)
          .send('Webhook error: "Webhook handler failed. View logs."');
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default webhookHandler;