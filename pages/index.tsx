import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/utils/useUser';
import router from 'next/router';
import LandingPage from './landing_page';
import { Transition } from '@headlessui/react';
import React from 'react';


export default function () {
  const { user, isLoading } = useUser();
  const [loadingLastChat, setLoadingLastChat] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const getLastChat = async () => {
        setLoadingLastChat(true)
        try {
          const { data } = await axios.get('/api/chat/get_last_channel')
          const { charSlug } = data // channelId, charId
          router.push(`/${charSlug || 'lexi'}`)
        } catch (error) {
          const { response, message } = error
          console.log(response.status)
          console.log(message)
          router.push('/lexi')
        } finally {
          setLoadingLastChat(false)
        }
      }
      getLastChat()
    }
  }, [user, isLoading]);

  if (isLoading || loadingLastChat) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Transition
        show={true}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <LandingPage />
      </Transition>
    </div>
  );
};
