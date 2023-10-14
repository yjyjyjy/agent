import classNames from 'classnames'
import { SiDiscord, SiReddit, SiTwitter } from 'react-icons/si';
import LoadingDots from 'components/ui/LoadingDots'
import axios from 'axios';
import { TbBookmarks } from 'react-icons/tb'
import MoreMenu from '../ui/MoreMenu';
import { useEffect, useState } from 'react';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import UpVoteAction from '../gridItemActions/UpVoteAction';
import DownVoteAction from '../gridItemActions/DownVoteAction';
import SaveAction from '../gridItemActions/SaveAction';
import { BsTrash } from 'react-icons/bs';
import { AiOutlineFolderAdd, AiOutlineReddit } from 'react-icons/ai';
import { HiOutlineUserGroup } from 'react-icons/hi'
import { RiShareForwardLine } from 'react-icons/ri'
import { useToasts } from 'react-toast-notifications'
// import { RedditShareButton } from "react-share";
import ImageSlider from '../ui/ImageSlider';
import Link from 'next/link';
import React from 'react';
import { get } from 'http';


const ImageGridItem = ({
  onImageClick,
  image,
  loading = false,
  selectMode = false,
  isSelected = false,
  isDiscover = false,
  setImage = null,
  onReportInitiated = null,
}) => {
  const { user, userDetails } = useUser();
  const router = useRouter()
  const { addToast } = useToasts()
  if (!image) return null
  const { id, image_url, social, users: creator } = image
  const [imageDeleted, setImageDeleted] = useState(false)
  const [charChatCounts, setCharChatCounts] = useState(0);

  const Action = ({ icon, onClick, className = '' }) => {
    return (
      <div className={`hover:cursor-pointer ${className}`}
        onClick={onClick}>
        {icon}
      </div>);
  }

  useEffect(() => {
    getCharChatCounts();
  }, [])

  const getCharChatCounts = async () => {
    const { status, data: chatCount } = await axios.post('/api/characters/get_chat_count', { char_id: id });
    setCharChatCounts(chatCount.message_count)
  }

  // Splitting the description into sentences.
  const sentences = image.description.split('. ');

  // Taking the first sentence for display.
  const firstSentence = sentences[0];

  // Concatenating the remaining sentences.
  const remainingSentences = sentences.slice(1).join('. ');


  return !imageDeleted &&
    (<div
      className={classNames('w-full h-full', loading && 'border border-teal-500')}
    >
      {loading ?
        <div className='bg-gray-700 w-full h-full flex flex-col justify-center items-center space-y-4 p-5 md:py-10'>
          <div>Queued...Refresh if taking too long</div>
          <div><Link href={'/pricing'}><span className='underline text-teal-400 font-bold'>A paid plan</span></Link> = fast generation  (6-10 sec) / priority queue</div>
          <div>Feedback &gt; <a href='https://discord.gg/eVJ5mTDgK7' target={'_blank'} className='underline text-teal-400'>Discord</a>, <a href='https://www.reddit.com/r/anydreamxyz/' target={'_blank'} className='underline text-white'>Reddit</a>, <a href='https://twitter.com/anydreamxyz' target={'_blank'} className='underline text-white'>Twitter</a></div>
          <LoadingDots />
        </div>
        :
        (
          <div className='flex flex-col w-full'>
            {/* image display */}
            <div className={classNames(
              'relative p-1 hover:cursor-pointer',
              selectMode && 'border border-white',
              isSelected && 'border-teal-200 border-4',
            )}>
              {selectMode && <input
                id="candidates"
                type="checkbox"
                readOnly={true}
                checked={isSelected}
                // className="h-5 w-5 rounded border-gray-300 text-teal-500"
                className="absolute right-3 top-3 h-4 w-4 rounded accent-teal-200"
              />}

              <div className="card w-full bg-base-100 shadow-xl" >
                <figure> <img
                  // className={'object-cover relative ww-' + image.requestParams.width + ' hh-' + image.requestParams.height}
                  src={image_url}
                  onError={() => { setImageDeleted(true) }} // in case the image is deleted or broken
                /></figure>
                <div className="card-body">
                  <h2 className="card-title">{image.name}</h2>
                  <p className="text-base text-gray-400" > {`${charChatCounts + 68} Subscribers 💗`}</p>

                  {/* Displaying only the first sentence */}
                  <p>{firstSentence}.</p>
                  <div className='btn btn-primary' onClick={onImageClick}>View Creator</div>


                </div>
              </div>



            </div>



          </div>
        )
      }
    </div >)

};

export default ImageGridItem;
