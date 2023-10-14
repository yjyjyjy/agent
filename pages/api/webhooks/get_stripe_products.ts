import { stripe } from '@/utils/stripe';


export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await stripe.products.list({
        limit: 3,
      });
      // then sort by price
      const sortedProducts = products.data.sort((a : any, b : any) => {
        return a.metadata.price - b.metadata.price;
      });
      return res.status(200).json({ products: products.data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}