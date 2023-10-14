// import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "@firebase/firestore";
import ReactPlayer from "react-player/lazy";
import Image from "next/image";
import { PiHeartBold, PiBookBookmarkBold } from 'react-icons/pi'
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import Button from 'components/ui/Button';
import SimpleImageSlider from "react-simple-image-slider";
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { useState } from "react";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { BiImageAlt } from "react-icons/bi";

// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { db } from "../firebase";
// import Moment from "react-moment";

function Post({ id, price, media, date, caption, mediaformat, metaData, unlockPending, unlockCallBack, deltePostCallBack, imageCount }) {
  function onHeartClick() {
    // update the likes swap
    // update the likes count on this picture
    // update the likes count on the user
  }
  const [showMore, setShowMore] = useState(false);

  // Determine the first 250 characters and the remaining characters.
  const firstPart = caption.slice(0, 250);
  const remainingPart = caption.slice(250);

  // Determine whether the "Show More" button should be displayed.
  const shouldShowMoreButton = remainingPart.length > 0;
  const [pressedUnlock, setPressedUnlock] = useState(false);
  const [deletePost, setDeletePost] = useState(false);


  const isUnderReview = () => {
    return metaData.status === 'pending';
  };

  function getImageDisplay() {
    if (isUnderReview()) {
      return (
      <div className="relative">
      <Image
        className="object-cover rounded-lg"
        src={Array.isArray(media) ? media[0].replace('public', 'blur') : media.replace('public', 'blur')}
        width={400}
        height={250}
        alt="post"
      />
    </div>
      )
    }

    if (Array.isArray(media) && media.length > 1) { // Multiple images
      return (
        <div className="slide-container " >
          <Slide autoplay={false} arrows={false} canSwipe={true} transitionDuration={100}>
            {media.map((mediaItem, index) => {
              return (
                // multiple can only be images
                (
                  <div className= "justify-center items-center flex" key={index}>
                    <Image
                      className="object-cover rounded-lg"
                      src={mediaItem}
                      width={400}
                      height={250}
                      alt="post"
                      draggable="false" // Make it not draggable
                    />
                  </div>
                )
              );  // End of return
            })}
          </Slide>
        </div>
      );
    } else { // Single image
      return (
        mediaformat === "image" ? (
          <div className="relative">
            <Image
              className="object-cover rounded-lg"
              src={Array.isArray(media) ? media[0] : media}
              width={400}
              height={250}
              alt="post"
            />
          </div>
        ) : mediaformat === "video" ? (
          <div className="rounded-lg overflow-hidden">
            <ReactPlayer
              className="react-player"
              url={media}
              width="100%"
              height="100%"
              controls
            />
          </div>
        ) : (
          <span className="rounded-lg">media format not supported</span>
        )
      );
    }
  }


  return (
    <div className="card card-compact w-full bg-base-100 shadow-xl mt-10" style={{ maxWidth: '358px' }}>
      <div className="m-1 justify-center items-center">

        {getImageDisplay()}

      
      </div>
      {/* <div className="flex justify-between px-4 pt-4 w-full">
        <div className="flex space-x-4 " >
          <label className="swap">
            <input type="checkbox" onClick={onHeartClick} />
            <AiFillHeart className="swap-on fill-current w-10 h-10" />
            <AiOutlineHeart className="swap-off fill-current w-10 h-10" />

          </label>
        </div>
        <div className="flex space-x-4 " >
          <label className="swap ">
            <input type="checkbox" onClick={onHeartClick} />
            <FaBookmark className="swap-on fill-current w-8 h-8" />
            <FaRegBookmark className="swap-off fill-current w-8 h-8" />

          </label>
        </div>
      </div> */}
      {/* caption */}

      <div className="ml-5 mr-5 mb-5 w-86 break-words overflow-x-hidden">
        <div className="flex flex-row justify-between ">
          <div className="label text-sm ">
            {date}
          </div>
          {imageCount != null && <div className="label text-sm ">
            <BiImageAlt></BiImageAlt>{imageCount}
          </div>}
        </div>
        <div className="text-start mb-5 font-bold break-all">
          {firstPart}
          {showMore && remainingPart}

          {shouldShowMoreButton && (
            <div
              className="link link-secondary cursor-pointer"
              onClick={() => {
                setShowMore(!showMore);
              }}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </div>
          )}
        </div>
        {isUnderReview() ? (
          <div
          className="btn btn-primary w-full"
          onClick={() => {}}
        >
          {"content under review"}
        </div>
        ) : (
          unlockPending && (
            <div
              className="btn btn-primary w-full"
              onClick={() => {
                setPressedUnlock(true);
                if (pressedUnlock) {
                  unlockCallBack(id)
                }
              }}
            >
              {!pressedUnlock ? `Unlock With ${price} 💰` : `Press again to confirm ${price} 💰`}
            </div>  
          )
        )}
      </div>

      {deltePostCallBack && <div className="flex justify-end ml-5 mr-5 mb-5">
        <div className="btn btn-accent btn-sm" onClick={
          () => {
            if (deletePost) {
              deltePostCallBack(id)
            } else {
              setDeletePost(true)
            }
          }
        }>{deletePost ? "Click again to delete" : "delte post"}</div>
      </div>}

    </div>
  )

}

export default Post