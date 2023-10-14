import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { db } from "../../../firebase/config";
import { query, collection, doc, where, startAt, limit, orderBy, addDoc, getDocs } from "@firebase/firestore";
import { getTokenBalanceBackend, guardWebhook } from '@/utils/backendUtils'
import {generateSignedURL} from './get_posts'
import {chargeToken} from '../auth/charge_text'
import axios from "axios";
import { redis } from "@/lib/redis";

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (req.method === 'POST') {
    const postIdToUnlock = req.body.postId;
    const charId = req.body.charId;
    let posts = req.body.posts;

    const price = posts.find(post => post.postId === postIdToUnlock).price;
    // check if user has enough token first
    const tb = await getTokenBalanceBackend(userId);
    if (tb.paidToken < price && tb.freeTextToken < price) {
      console.log('📸 unlock_post.not_enough_token', tb);
      return res.status(200).json({ message: `Not enough token balance, You have ${tb.paidToken || tb.freeTextToken} tokens left` })
    }

    // update post
    posts = await Promise.all(posts.map(async post => {
      if (post.postId === postIdToUnlock) {
        // resolve the image in post.bag
        const unlockedImagePromises = post.bag.map(image => {
          return generateSignedURL({
            url: image.replace('https:/imagedelivery.net', 'https://imagedelivery.net'),
          });
        });
        const unlockedImage = await Promise.all(unlockedImagePromises);
        return {
          ...post,
          image: unlockedImage,
          bag: undefined,
        }
      } else {
        return post;
      }
    }))
    console.log('🔥⛺️📖 unlock_post.get_posts_url_done');

    // update firebase
    const collectionRef = collection(db, "paid", userId, charId);
    addDoc(collectionRef, {
      postId: postIdToUnlock,
      timestamp: new Date(),
      price: price
    })
    console.log(`🔥⛺️📝 unlock_post.write_firebase_done ${postIdToUnlock} -> ${userId}/${charId}`);

    // update token balance
    const { tokenBalance, chargedFrom } = await chargeToken(userId, price);
    if (chargedFrom !== 'free') {
      // update char earning
      const pipeline = redis.pipeline()
      await pipeline.hincrby(`character:${charId}`, 'post_sold', 1)
      await pipeline.hincrby(`character:${charId}`, 'token_spend_post', price)
      await pipeline.zincrby('character_rank', 1, charId)
      await pipeline.hincrby(`character:${charId}`, 'token_spend', price)
      await pipeline.exec()
    }
    console.log('💰✅ unlock_post.charge_text.success');

    // now return all info
    return res.status(200).json({ posts: posts, tokenBalance: tokenBalance, message: `You have ${tokenBalance.paidToken || tokenBalance.freeTextToken} tokens left`});
  }
}