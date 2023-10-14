import { createClient } from '@supabase/supabase-js';
import { stripe } from './stripe';
import { toDateTime } from './helpers';
import { Customer, UserDetails, Price, Product } from 'types';
import type { Database } from 'types_db';
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid'
import { redis } from 'lib/redis';
import { constructTokenBalanceFromDB } from './backendUtils';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin priviliges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (eventId, product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
    lastEventId: eventId // keep track
  };

  const { error } = await supabaseAdmin.from('products').upsert([productData]);
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (eventId, price) => {
  const priceData = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
    lastEventId: eventId // keep track
  };

  const { error } = await supabaseAdmin.from('prices').upsert([priceData]);
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

const createOrRetrieveCustomer = async ({ userId, email }: { userId: string; email?: string; }) => {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error || !data?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: { metadata: { supabaseUserId: string }; email?: string } =
    {
      metadata: {
        supabaseUserId: userId
      }
    };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await supabaseAdmin
      .from('customers')
      .insert([{ id: userId, stripe_customer_id: customer.id }]);
    if (supabaseError) throw supabaseError;
    console.log(`New customer created and inserted for ${userId}.`);
    return customer.id;
  }
  return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  userId: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', userId);
  if (error) throw error;
};

const updateTokenPurchase = async ({ customerId, stripeEventId, amount }) => {
  // Get customer's userId from mapping table.
  // console.log('🔴 🔴 🔴 1.customerId', customerId)
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const { id: userId } = customerData;
  // console.log('🔴 🔴 🔴 1.userId', userId)

  // upsert the transaction
  const transactionId = uuid()
  const { error: tokenTscError } = await supabaseAdmin.from('token_transaction').upsert({
    id: transactionId,
    userId,
    eventType: 'paid',
    stripeEventId,
    amount,
    createdAt: new Date().toISOString()
  })
  if (tokenTscError) throw tokenTscError

  // update redis tokenBal
  let tokenBal : any = await redis.get(`tokenBal:${userId}`)
  if (!tokenBal || !Array.isArray(tokenBal) || !tokenBal.find(bal => bal.id === 'free_text')) {
    // reconstructing tokenBalArry from db. The amount is from the previous step
    tokenBal = [
      { id: 'free_text', type: 'free', amount: 30, expiresAt: 0, lastSpentAt: Date.now() },
    ]
    console.log('11.tokenBal', tokenBal)
  }
  const grantTokenBal = {
    id : stripeEventId,
    type: 'paid',
    amount: amount,
    expiresAt: 0,
    lastSpentAt: Date.now()
  }
  console.log('22.grantTokenBal', tokenBal)
  tokenBal.push(grantTokenBal)

  console.log('final.tokenBal', tokenBal)
  await redis.set(`tokenBal:${userId}`, tokenBal)
}

const manageSubscriptionStatusChange = async ({ subscriptionId, customerId, createAction = false, stripeEventId, invoice }) => {
  // Get customer's userId from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const { id: userId } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData =
  {
    id: subscription.id,
    user_id: userId,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
    stripeEventId
  };

  //@ts-ignore
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${userId}]`
  );

  // provision the subscription
  if (subscriptionData.status === 'active') {
    const ProductId = subscription.items.data[0].plan.product // e.g. productId: prod_NiQGcEjZwmLSjZ
    console.log('🔴 ProductId', ProductId)
    const { data: prodMetaData } = await supabaseAdmin.from('products').select('metadata').eq('id', ProductId).single()
    console.log('🔴 prodMetaData', prodMetaData)
    // @ts-ignore
    const subscriptionTokenAmount = prodMetaData?.metadata?.tokenAmount
    console.log('🔴 subscriptionTokenAmount', subscriptionTokenAmount)
    //grab existing fulfilled amount
    let existingPurchasedAmount = 0
    const { data: tscData, error: tscError } = await supabaseAdmin
      .from('token_transaction')
      .select('amount')
      .gte('expiresAt', new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString())
      .eq('eventType', 'paid')
      .eq('userId', userId)
    if (tscError) throw tscError
    for (const tsc of tscData) {
      existingPurchasedAmount += tsc.amount
    }
    console.log('🔴 existingPurchasedAmount', existingPurchasedAmount)
    console.log('subscriptionData.current_period_start', subscriptionData.current_period_start)
    console.log('subscriptionData.current_period_end', subscriptionData.current_period_end)

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const startDate = new Date(subscriptionData.current_period_start);
    console.log('🔴 startDate', startDate)
    const endDate = new Date(subscriptionData.current_period_end);
    console.log('🔴 endDate', endDate)
    // @ts-ignore
    const periodLength = Math.round(Math.abs((endDate - startDate) / oneDay));
    console.log('🔴 periodLength', periodLength)
    // @ts-ignore
    const remainingLength = Math.round(Math.abs((endDate - new Date()) / oneDay));
    const remainingAmount = Math.round(subscriptionTokenAmount * remainingLength / periodLength * (periodLength > 40 ? 12 : 1)) // annual sub gets 12 months at once

    if (remainingAmount > existingPurchasedAmount) {
      let amount = remainingAmount - existingPurchasedAmount // this covers both upgrade and new sub
      console.log('🔴 amount', amount)
      const { error: tokenTscError } = await supabaseAdmin.from('token_transaction').upsert({
        id: invoice, // use invoice as id to prevent duplicate
        userId,
        eventType: 'paid',
        stripeEventId,
        amount,
        expiresAt: subscriptionData.current_period_end,
        createdAt: new Date().toISOString()
      })
      if (tokenTscError) throw tokenTscError
    }
    // clear and rewrite balance cache
    // await redis.del(`paidGrantBalance:${userId}`)


    // save the spend data
    let oldTokenBal = await redis.get(`tokenBal:${userId}`)
    let tokenBal = oldTokenBal
    if (!tokenBal || !Array.isArray(tokenBal) || !tokenBal.find(bal => bal.id === 'free_text') || !tokenBal.find(bal => bal.id === 'free_image')) {
      // reconstructing tokenBalArry from db. The amount is from the previous step
      tokenBal = [
        { id: 'free_text', type: 'free', amount: 200, expiresAt: 0, lastSpentAt: Date.now() },
        { id: 'free_image', type: 'free', amount: 10, expiresAt: 0, lastSpentAt: Date.now() }
      ]
      console.log('11.tokenBal', tokenBal)
    }

    // @ts-ignore
    // let { data: paidTokenBal, error } = await supabaseAdmin.rpc('get_grant_balance', { user_id: userId })
    const { data: paidTokenBal, error: paidTokenBalErr } = await supabaseAdmin
      .from('token_transaction')
      .select('id, amount, expiresAt')
      .gte('expiresAt', new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString())
      .eq('eventType', 'paid')
      .eq('userId', userId)
    if (paidTokenBalErr) throw paidTokenBalErr
    paidTokenBal.forEach(bal => {
      // @ts-ignore
      bal.type = 'paid'
      // @ts-ignore
      bal.lastSpentAt = Date.now()
      bal.expiresAt = new Date(bal.expiresAt).getTime()
    })
    console.log(paidTokenBal)
    // @ts-ignore
    for (const pb of paidTokenBal) {
      console.log('222.paidTokenBal', pb)
      // @ts-ignore
      if (!tokenBal.find(b => b.id === pb.id)) {
        console.log('333.paidTokenBal', pb)
        console.log(pb)
        // @ts-ignore
        tokenBal.push(pb)
      }
    }
    await redis.set(`tokenBal:${userId}`, tokenBal)
  }

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && userId)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      userId,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  updateTokenPurchase
};
