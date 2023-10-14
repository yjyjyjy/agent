import { useRouter } from "next/router";
import { useEffect, useState, Suspense } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Chat from '@/components/chat/chat';
import axios from 'axios';
import { useUser } from '@/utils/useUser';

export default function () {
  const { setTokenBalance: setUserTokenBalance, userDetails } = useUser();
  const [char, setChar] = useState(null);
  const [channel, setChannel] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null); // unfortunately, useUser() will trigger a re-render on every page load
  // const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();
  const supabase = createPagesBrowserClient()

  useEffect(() => {
    // init chat
    const initChannel = async () => {
      // fetch character data
      const slug = router.query.char_slug.toLowerCase();
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      console.log('userId', userId)
      let ip
      // get Token Balance
      if (!userId) {
        const resp = await axios.get('https://api.ipify.org?format=json')
        ip = resp.data.ip
      }
      try {
        const { status: getChatStatus, data: { character, channel } } = await axios.post('/api/chat/get_channel', { slug, ip });
        if (getChatStatus === 200) {
          console.log('✅ get chat success')
          console.log('chat', channel)
          console.log('character', character)
          setChannel(channel)
          setChar(character)
        }
      } catch (error) {
        console.log('❌ get chat error', error)
        router.push('/')
      }
      const { status, data } = await axios.post('/api/auth/token_balance', {
        id: userId || ip
      })

      if (status === 200) {
        console.log('get token balance success', data);
        setUserTokenBalance(data)
        setTokenBalance(data)
      }

    }

    if (router.isReady) {
      initChannel()
    }
  }, [router.isReady]);



  // 1. get character data
  // 2. get token balance
  // 3. init chat
  // 3.1 if signed in user.
  //    /api/chat/query_recent_chat
  //    if chatExist, redirect to chat page
  //    else /api/chat/init_chat
  // 3.2 if not signed in user
  //    /api/user_tracking/temp_chat
  //    if first_time, /api/chat/init_chat
  //    else redirect to chat page


  // wait screen when router is not ready
  if (!router.isReady || !char || !char) {
    return <>
      <div className="fixed top-0 left-0 w-screen h-screen bg-base z-0" />
      <div className="hero min-h-screen bg-base-100">
        <div className="loading loading-lg" />
      </div>
    </>;
  }
  return (
    <div>
      <div className={`fixed top-0 left-0 w-screen h-screen bg-black `} />
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <Chat
        channel={channel}
        character={char}
      // userDetails={userDetails}
      // tokenBalance={tokenBalance}
      // setTokenBalance={setTokenBalance}
      />
      {/* </Suspense> */}
    </div>
  );

}
