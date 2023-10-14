import { NextApiHandler } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

import { stripe } from '@/utils/stripe';
import { createOrRetrieveCustomer } from '@/utils/supabase-admin';
import { getURL } from '@/utils/helpers';

const CreatePortalLink: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user?.id || user.id === '') throw Error(`Could not get user: ${user?.id}`);
      const customer = await createOrRetrieveCustomer({
        userId: user.id,
        email: user.email
      });
      console.log(`🌳 createOrRetrieveCustomer ${customer}`)

      if (!customer) throw Error('Could not get customer');
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: `${getURL()}/account`
      });
      console.log(`🌳 created portal link for user ${user.id}: ${url}`)
      if (!url || url.length < 10) throw Error(`Could not get portal link for user ${user.id}. URL: ${url}`);
      return res.status(200).json({ url });

    } catch (err: any) {
      console.log(`🤯 Error creating portal URL: ${err}, ${err.message}, ${JSON.stringify(err)}`);
      return res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default CreatePortalLink;
