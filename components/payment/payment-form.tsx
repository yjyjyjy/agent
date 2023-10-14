import { useEffect, useState } from 'react';
import CardRow from './tier-row';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import axios from 'axios';
import Stripe from 'stripe';
import router from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { env } from 'process';

function CreditCardForm(redirUrl) {
  const [activeCard, setActiveCard] = useState(0);
  // const [products, setProducts] = useState([]);

  const products = [
    {
      "id": "price_1Nh0pFH2m1e8lbMbUOLQUXA2",
      "description": "1,000 Token",
      "name": "$10",
    },
    {
      "id": "price_1Nh0pFH2m1e8lbMbmni4zXvQ",
      "description": "3,000 Token",
      "name": "$30",
    },
    {
      "id": "price_1Nh0pGH2m1e8lbMb6l1ghBYS",
      "description": "6,000 Token",
      "name": "$60",
    }
  ]

  // useEffect(() => {
  //   const fetchData = async () => {
  //     // get products from stripe
  //     const { status, data } = await axios.get('/api/webhooks/get_stripe_products');
  //     if (status === 200) {
  //       setProducts(data.products);
  //       // console.log('products', products);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const createCheckoutSession = async (prodIdx) => {
    const supabase = createPagesBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      router.push(`/signin`)
    } else {

      router.push({
        pathname: 'https://www.automatic1111.xyz/payment',
        query: { redirUrl: redirUrl.redirUrl.toString(), productID: prodIdx, userID: userId, authKey: "013539be-e1ec-476a-ba64-0623e61453fa", }
      })
    }
    // try {
    //   const checkoutSession: Stripe.Checkout.Session = await axios.post('/api/create-checkout-session', productData);
    //   if ((checkoutSession as any).statusCode === 500) {
    //     console.error((checkoutSession as any).message);
    //     return;
    //   }


    //   // Redirect to Checkout.
    //   const stripe = await getStripe();
    //   console.log("🔴🔴🔴🔴 checkoutSession: ", checkoutSession)


    //   const { error } = await stripe!.redirectToCheckout({
    //     //@ts-ignore
    //     sessionId: checkoutSession.data.checkoutSessionId,
    //   });
    //   // If `redirectToCheckout` fails due to a browser or network
    //   // error, display the localized error message to your customer
    //   // using `error.message`.
    //   console.warn(error.message);

    // } catch (error) {
    //   console.log("🔴🔴🔴🔴 error: ", error)
    //   return alert((error as Error)?.message);
    // } finally {
    // }
  }


  return (
    <>
      <div className="flex flex-col w-full border-opacity-50">

        <CardRow products={products} activeCard={activeCard} setActiveCard={setActiveCard} />
        <button onClick={() => {
          createCheckoutSession(activeCard)
        }} className="btn btn-secondary mt-5">Buy</button>
      </div>
    </>
  );
}

export default CreditCardForm;
