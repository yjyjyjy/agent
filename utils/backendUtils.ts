import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from 'lib/awsClient'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "lib/redis";
import { TokenGrantBalance } from 'types'
import { maxFreeGrantAmount, freeGrantCoolDown } from 'lib/imageGenConstants'
import { createClient } from "@supabase/supabase-js";
import { useUser as useSupaUser } from '@supabase/auth-helpers-react';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function getPreSignedUrl({ imgId, watermarked }: { imgId: string, watermarked: boolean }) {
  console.log('get presigned url:', imgId)
  console.log('watermarked', watermarked)
  const command = new GetObjectCommand({
    Bucket: 'a1-generated',
    Key: `${watermarked ? 'watermarked' : 'generated'}/${imgId}.png`
  })
  const imgUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 * 7 })
  if (watermarked) {
    await supabaseAdmin.from('image').update({
      watermarkUrl: imgUrl, watermarkUrlExpiration: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 6.5) // leave some buffer from 7 days
    }).eq('id', imgId)
    console.log('watermarkUrl updated')
  } else {
    await supabaseAdmin.from('image').update({
      imgUrl, imgUrlExpiration: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 6.5) // leave some buffer from 7 days
    }).eq('id', imgId)
    console.log('imgUrl updated')
  }
  // console.log(data, error)
  return { imgId, imgUrl }
}

export async function getPreSignedUrlForImageItems({ imageItems, watermarked }) {
  const promiseArry = imageItems?.map(item => {

    if (watermarked && (item.createdAt && new Date(item.createdAt).getTime() > new Date('2023-04-30').getTime())) {
      // return watermarked
      // try return watermarked if it exists and is not expired
      if (item.watermarkUrl && new Date(item.watermarkUrlExpiration) > new Date()) {
        console.log('watermarkUrl exists and is not expired')
        return { imgId: item.id, imgUrl: item.watermarkUrl }
      }
      return getPreSignedUrl({ imgId: item.id, watermarked: true })
    }
    // return unwatermarked
    // try return unwatermarked if it exists and is not expired
    if (item.imgUrl && new Date(item.imgUrlExpiration) > new Date()) {
      return { imgId: item.id, imgUrl: item.imgUrl }
    }
    return getPreSignedUrl({ imgId: item.id, watermarked: false })
  })

  const urlItems = await Promise.all(promiseArry)
  let results = imageItems.map(item => {
    const imgUrl = urlItems.find(urlItem => urlItem.imgId === `${item.id}`)?.imgUrl || ''
    delete item.watermarkUrl;
    delete item.watermarkUrlExpiration;
    delete item.imgUrlExpiration
    return ({ ...item, imgUrl })
  })
  results = results.filter(item => item.imgUrl !== '')
  return results
}


export async function constructTokenBalanceFromDB({ userId, overwriteRedis = true }) {
  try {
    const { data: tokenBal, error } = await supabaseAdmin
      .from('token_transaction')
      .select('id, amount, expiresAt')
      .gte('expiresAt', new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString())
      .eq('eventType', 'paid')
      .eq('userId', userId)
    if (error) throw error
    console.log('🔴 tokenBal', tokenBal)
    tokenBal.forEach(bal => {
      // @ts-ignore
      bal.lastSpentAt = Date.now()
      // @ts-ignore
      bal.type = 'paid'
      bal.expiresAt = new Date(bal.expiresAt).getTime()
    })

    // @ts-ignore
    tokenBal.push({ id: 'free_text', type: 'free', amount: 50, expiresAt: 0, lastSpentAt: Date.now() })
    // @ts-ignore
    tokenBal.push({ id: 'free_image', type: 'free', amount: 3, expiresAt: 0, lastSpentAt: Date.now() })



    if (overwriteRedis) {
      await redis.set(`tokenBal:${userId}`, tokenBal)
    }
    console.log('returning', tokenBal)
    return tokenBal
  } catch (error) {
    console.log('constructTokenBalanceFromDB error', error)
    return []
  }
}


export async function constructTokenBalanceFromRedis({ ip }) { // this is for unauthenticated user
  try {
    const tokenBalFromRedis: TokenGrantBalance[] = await redis.get(`tokenBal:${ip}`)
    if (!tokenBalFromRedis) {
      const tokenBal = [
        { id: 'free_text', type: 'free', amount: 35, expiresAt: 0, lastSpentAt: Date.now() },
        { id: 'free_image', type: 'free', amount: 3, expiresAt: 0, lastSpentAt: Date.now() }
      ]
      await redis.set(`tokenBal:${ip}`, tokenBal)
      return tokenBal
    }
    return tokenBalFromRedis
  } catch (error) {
    console.log('constructTokenBalanceFromRedis.error', error)
    return []
  }
}


export async function getUserDetailsBackend(userId) {
  const { data: userData, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).single()
  // const ret : UserDetails = userData
  return userData
}

export async function getTokenBalanceBackend(userId) {
  // V2
  // get tokenBalance from Redis
  let tokenBal: any = await redis.get(`tokenBal:${userId}`)

  console.log('aa.tokenBal', tokenBal)
  let redisNeedsUpdate = false
  // when it dosent exist in redis, create from db
  // @ts-ignore

  // console.log(tokenBal)
  if (!tokenBal || !Array.isArray(tokenBal) || !tokenBal.find(bal => bal.id === 'free_text') || !tokenBal.find(bal => bal.id === 'free_image')) {
    console.log('🔴🔴🔴🔴 reconstructing tokenBalArry from db')
    // reconstructing tokenBalArry from db if id is valid
    // check if userId is uuid or not
    if (userId.length === 36) {
    tokenBal = await constructTokenBalanceFromDB({ userId, overwriteRedis: true })
    console.log('bb.tokenBal', tokenBal)
    } else {
      tokenBal = await constructTokenBalanceFromRedis({ ip: userId })
    }
  }
  // @ts-ignore
  const oldBalLength = tokenBal.length
  // @ts-ignore
  tokenBal = tokenBal.filter(bal => {
    // console.log('🌳 bal', bal)
    const notExpired = bal.expiresAt > (new Date().getTime()) || bal.expiresAt === 0
    const isFreeText = bal.id === 'free_text'
    const isFreeImage = bal.id === 'free_image'
    return notExpired || isFreeText || isFreeImage
  })

  // refresh token
  // const lastMidnight = Math.floor(Date.now() / 86400000) * 86400000;
  // tokenBal.forEach(grant => {
  //   if (grant.id === 'free_text' && grant.lastSpentAt < lastMidnight) {
  //     grant.amount = 50;
  //     grant.lastSpentAt = Date.now();
  //     redisNeedsUpdate = true;
  //   }
  //   if (grant.id === 'free_image' && grant.lastSpentAt < lastMidnight) {
  //     grant.amount = 3;
  //     grant.lastSpentAt = Date.now();
  //     redisNeedsUpdate = true;
  //   }
  // });

  if (tokenBal.length !== oldBalLength || redisNeedsUpdate) {
    console.log('44.tokenBal', tokenBal)
    await redis.set(`tokenBal:${userId}`, tokenBal)
  }

  return {
    // @ts-ignore
    paidToken: tokenBal.reduce((acc, bal) => { return bal.type !== 'free' ? acc + parseInt(bal.amount) : acc }, 0),
    freeTextToken: parseInt(tokenBal.find(bal => bal.id === 'free_text')?.amount) ?? 0
    // @ts-ignore
    // nextRefreshTsEpoch: tokenBal.find(bal => bal.id === 'free').spend.reduce((acc, use) => acc < use.ts ? acc : use.ts, new Date().getTime()) + freeGrantCoolDown
  }

}

export async function guardWebhook(req, res) {
  let body
  if (typeof req.body === 'string') {
    body = await JSON.parse(req.body)
  } else {
    body = req.body
  }
  if (!body?.apiKey || body.apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({
      error: 'not_authenticated'
    })
  }
  console.log('guardWebhook', body)
  return body
}