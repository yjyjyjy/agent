import React, { useEffect, useState } from 'react';
import Carousel from "nuka-carousel"
import axios from 'axios';
import { useRouter } from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';


// import { Statsig } from 'statsig-react';

const NEOLandPage = () => {
  const router = useRouter();

  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [topModels, setTopModels] = React.useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    getTopModels()

  }, []); // include necessary dependencies



  const getTopModels = async () => {
    var { data: items } = await axios.get(`/api/characters/get_top_model`);
    console.log('getTopModels', items.images)

    if (items.images.length == 0) return;

    for (let i = 0; i < items.images.length; i++) {
      const { status, data: chatCount } = await axios.post('/api/characters/get_chat_count', { char_id: items.images[i].id });
      items.images[i].chatCount = chatCount.message_count
    }

    setTopModels(items.images)

  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const chatButtonCallBack = async () => {
    // log this click
    const supabase = createPagesBrowserClient()

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      router.push(`/signin?charID=${topModels[currentSlideIndex].url_slug}`)
    } else {
      router.push(`/${topModels[currentSlideIndex].url_slug}`)
    }
  }

  return (
    //TODO: MUST RETURN, OTHERWISE IT WILL NOT RENDER
    <div>
      {topModels.length == 0 ? (<>
        <div className="fixed top-0 left-0 w-screen h-screen bg-base z-0" />
        <div className="hero min-h-screen bg-base-200">
          <div className="loading loading-lg" />
        </div>
      </>)
        :
        (<div className="flex flex-col justify-between">

          <Carousel style={{ outline: 'none' }} swiping={false} className='pl-10 pr-10 outline-none' autoplay={true} autoplayInterval={3000} defaultControlsConfig={{ nextButtonText: ' ', prevButtonText: ' ' }} afterSlide={(index: number) => {
            setCurrentSlideIndex(index)
          }}>

            {Array.isArray(topModels) && topModels.map((model, index) => {
              return <div className="card w-full shadow-xl transform " >
                <div className="card-body">
                  <div className="flex items-center justify-center">

                    <div className="flex flex-col max-w-[500px] items-start justify-start">
                      <img src={model.image_url} className="w-full" alt="Tailwind CSS Carousel component" />

                      <h1 className="text-5xl font-bold mt-10">{model.name}</h1>
                      <p className="text-base text-gray-400" > {`${model.chatCount + 68} Subscribers 💗`}</p>
                      <p className="py-6">{capitalizeFirstLetter(model.description.length > 200 ? model.description.substring(0, 200) + "..." : model.description)}</p>
                    </div>
                  </div>
                </div>
              </div>
            })}

          </Carousel>
          <button onClick={chatButtonCallBack} className="z-10 btn btn-primary self-center mb-10">{`Chat with ${topModels[currentSlideIndex].name} Now`}</button>
          <div className="w-full flex flex-col justify-start items-center bg-black" />

        </div>)}

    </div>
  );
}

export default NEOLandPage;
