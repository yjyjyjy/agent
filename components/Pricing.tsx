import cn from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Button from 'components/ui/Button';
import { postData } from 'utils/helpers';
import { getStripe } from 'utils/stripe-client';
import { useUser } from 'utils/useUser';
import { Price, ProductWithPrice } from 'types';
import { Mixpanel, MixpanelEvents } from 'lib/mixpanel';
import classNames from 'classnames';
import { coolDownHours, maxFreeGrantAmount } from 'lib/imageGenConstants';
import axios from 'axios';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Props {
  products: ProductWithPrice[];
  variant?: 'image' | 'chat';
}

type BillingInterval = 'year' | 'month';

export default function Pricing({ products }: Props) {
  products.sort((a, b) => parseInt(a.metadata.tokenAmount) - parseInt(b.metadata.tokenAmount));
  products = [{
    id: 'free',
    name: 'Free Plan',
    description: 'Free Plan',
    metadata: {
      tokenAmount: '0'
    },
    prices: [{
      id: 'freeMonth',
      currency: 'usd',
      unit_amount: 0,
      interval: 'month',
      product_id: 'free'
    }, {
      id: 'freeYear',
      currency: 'usd',
      unit_amount: 0,
      interval: 'year',
      product_id: 'free'
    }]
  }, ...products]
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();

  const handleCheckout = async (price: Price) => {
    Mixpanel.track(MixpanelEvents['Interact'], { path: '/pricing', action: 'checkoutIntent', description: price.description });
    setPriceIdLoading(price.id);
    if (!user) {
      return router.push('/signin');
    }
    if (subscription) {
      return router.push('/account');
    }

    try {
      const { checkoutSessionId } = await postData({
        url: '/api/create-checkout-session',
        // @ts-ignore
        data: { price}
      });
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId: checkoutSessionId });
    } catch (error) {
      console.log("🔴🔴🔴🔴 error: ", error)
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };
  const ProductCard = ({ product }) => {
    const price = product?.prices?.find(
      (price) => price.interval === billingInterval
    );
    if (!price) return null;
    const priceString = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0
    }).format((billingInterval === 'month' ? price?.unit_amount : price?.unit_amount / 12) / 100);
    const priceStringAnchor = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0
    }).format(product?.prices?.find(
      (price) => price.interval === 'month'
    )?.unit_amount / 100);

    const keyTextColor = (productName) => {
      switch (productName) {
        case 'Free Plan':
          return '';
        case 'Starter Plan':
          return 'text-teal-300';
        case 'Creator Plan':
          return 'text-amber-200';
        case 'Master Plan':
          return 'bg-gradient-to-r from-teal-300 to-amber-200 text-transparent bg-clip-text';
      }
    }
    const ctaButtonColor = (productName) => {
      switch (productName) {
        case 'Free Plan':
          return '';
        case 'Starter Plan':
          return { background: '#86E7D4' };
        case 'Creator Plan':
          return { background: '#F9E796' };
        case 'Master Plan':
          return { background: 'linear-gradient(90deg, #86E7D4 0%, #F9E796 100%)' };
      }
    }
    return (
      <div
        key={product.id}
        className={cn(
          'rounded-lg shadow-sm divide-y divide-zinc-600 bg-zinc-900 ',
          { 'border border-teal-500': (product.name === subscription?.prices?.products?.name) }
        )}
      >
        <div className={classNames("p-6", (product.id === 'free' && !subscription) ? 'text-gray-300' : 'text-white')}>

          <div className='w-36'>
            <div className={classNames("text-2xl leading-6 font-semibold", keyTextColor(product.name))}>
              {product.name}
            </div>
          </div>
          {/* <div className='text-xl font-semibold pt-4'>{
            product.id === 'free' ?
              <span>* {maxFreeGrantAmount} Free tokens/{coolDownHours}hr<br />* Slow run (? mins)<br /></span> :
              <span>* {product.metadata.tokenAmount} tokens/mo<br />* Fast (6-10s) run<br />* Same Free tokens</span>}

          </div> */}
          <div className='text-xl font-semibold pt-4'>{
            product.id === 'free' ?
              <span>* 50 messages, 3 images/day<br /></span> :
              <span>* {product.metadata.tokenAmount} tokens/mo<br />* Same Free tokens</span>}

          </div>

          {/* <p className="mt-4 text-zinc-300">{product.description}</p> */}

          {/* pricing */}
          {
            <p className="mt-4">
              {billingInterval === 'year' && product.id !== 'free' && < span className="text-4xl text-gray-400 pr-2 line-through">
                {priceStringAnchor}
              </span>}
              <span className="text-5xl font-extrabold">
                {priceString}
              </span>
              <span className="text-base font-medium">
                /mo
              </span>
            </p>
          }
          {/* disclaimer */}
          {product.id !== 'free' && <p className={classNames("mt-4 text-zinc-300 text-sm", billingInterval === 'year' ? 'text-teal-400' : '')}>{billingInterval === 'year' ? `Total $${price?.unit_amount / 100} with Yearly` : 'Monthly'} Billing</p>}
          <p className="mt-4 text-zinc-300 text-sm">{product.id === 'free' ? `Subject to changes` : `Unused 💰 expires each month`}</p>

          {/* CTA button */}
          {product.id !== 'free' && <Button
            variant="slim"
            type="button"
            disabled={isLoading}
            // disabled={true}
            loading={priceIdLoading === price.id}
            onClick={() => handleCheckout(price)}
            className={classNames("mt-8 block w-full rounded-md py-2 text-sm font-semibold text-center")}
            // @ts-ignore
            style={ctaButtonColor(product.name)}
          >
            {product.name === subscription?.prices?.products?.name
              ? 'Manage'
              : 'Subscribe'}
          </Button>}
        </div>
      </div >
    )
  }
  return (
    <section className="bg-base">

      <div className="max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8 ">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl ">
            Pricing Plans
          </h1>
          <div className="mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl max-w-2xl m-auto ">
            To build the best companion experience on Earth, we need your support!
            <br />
            1💰/response, 10💰/image in private chat
          </div>


          {/* billing interval chooser */}
          <div className="relative self-center mt-6 bg-zinc-900 rounded-lg p-0.5 flex sm:mt-8 border border-zinc-800 ">
            <button
              onClick={() => setBillingInterval('month')}
              type="button"
              className={`${billingInterval === 'month'
                ? 'relative w-1/2 bg-zinc-700 border-teal-400 shadow-sm text-white '
                : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400 '
                } rounded-md border-2 m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-8 `}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              type="button"
              className={`${billingInterval === 'year'
                ? 'relative w-1/2 bg-zinc-700 border-teal-400 shadow-sm text-white '
                : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400 '
                } rounded-md border-2 m-1 py-2 text-sm font-medium whitespace-nowrap sm:w-auto sm:px-8 `}
            >
              Yearly billing
            </button>

          </div>
        </div>
        <div className=" mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4  ">
          {products.map((product) => {
            return (
              <ProductCard product={product} key={product.id} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
