import React, { useState, useCallback, useEffect, useRef } from "react";
import { useIsVisible } from 'react-is-visible'
// import type { NextPage } from "next";
// import Head from "next/head";
// import Image from "next/image";
import { AiOutlineFileImage, AiOutlineEdit } from "react-icons/ai";
import { useDropzone } from "react-dropzone";
// import { Gallery } from "react-grid-gallery";
import UploadProgress from "@/components/imageHosting/uploadProgress";
import { useRouter } from "next/router";
import axios from "axios";
import { useUser } from "@/utils/useUser";
import { useToasts } from 'react-toast-notifications'
import PillButton from '@/components/ui/PillButton';
import { BiCheck } from 'react-icons/bi';
import { MdCancel } from 'react-icons/md';
import { uploadSingleImageCDN, uploadMultipleImagesIntoCharacter } from '@/utils/cloudflare'
import DragDropWindowSingle from '@/components/creator/DragDropWIndowSingle'
import DragDropWindowMultiple from '@/components/creator/DragDropWindowMultiple'

type Image = {
  imageFile: Blob;
};

export default function () {
  // get query
  const router = useRouter();
  let [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [success, setSuccess] = useState(false);
  const [loadingState, setLoadingState] = useState(true); // Added state for loading
  const { user } = useUser();
  const { addToast } = useToasts()
  const [char, setChar] = useState(null)
  const [pageName, setPageName] = useState('')
  const [userProfileEditingMode, setUserProfileEditingMode] = useState(false)
  const [characterImages, setCharacterImages] = useState([])
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const bottomRef = useRef()
  const isBottomVisible = useIsVisible(bottomRef)

  const [slug, setSlug] = useState(null)
  useEffect(() => {
    if (router.isReady) {
      setSlug(router?.query?.slug)
    }
  }, [router.isReady]);

  useEffect(() => {
    if (slug) {
      getCharacter()
    }
  }, [slug])

  const getCharacter = async () => {
    const { data, status } = await axios.post(`/api/character/get_character`, {
      slug
    })
    if (status > 299) {
      addToast('character does not exist', { appearance: 'error', autoDismiss: true })
      router.push('/creator');
      return
    }
    if (!user.id || data.created_by !== user?.id) {
      addToast('you are not the creator of this character', { appearance: 'error', autoDismiss: true })
      router.push('/creator');
      return
    }
    console.log(data)
    setChar(data)
  }

  const getCharacterImages = async () => {
    const { data, status } = await axios.post(`/api/character/get_character_images`, {
      slug
    })
    if (status > 299 || !data || !Array.isArray(data)) {
      addToast('cannot load character images', { appearance: 'error', autoDismiss: true })
      return
    }
    setCharacterImages(data)
  }
  console.log(images)


  const handleUpload = async ({ imageFiles, slug }) => {
    console.log(imageFiles, slug)
    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0 || !slug) return []
    // setLoading(true);
    // const imgUrl = await uploadSingleImageCDN(imageFiles[0])
    const imgUrls = await uploadMultipleImagesIntoCharacter({ imageFiles, slug })

    // const promiseArray = imageFiles.map((imageFile) => uploadSingleImageCDN(imageFile, slug))
    // const urls = await Promise.all(promiseArray)
    // setLoading(false);
    addToast(`Upload successful ${imgUrls}`, { appearance: 'success', autoDismiss: true })
    console.log('🔴🔴🔴 ', imgUrls)
    return imgUrls
  }

  // const handleReName = async () => {
  //   const { status, data } = await axios.put('/api/characters/update', {
  //     updateData: { 'page_name': pageName },
  //     charId: router.query.char_id
  //   });
  //   if (status !== 200) {
  //     addToast('update page name failed', { appearance: 'error', autoDismiss: true })
  //     return
  //   }
  //   addToast('update page name successful', { appearance: 'success', autoDismiss: true })
  //   setUserProfileEditingMode(false)
  // }

  const ImageGridItem = ({ image }) => {
    return <>
      <img
        className={'object-cover relative aspect-auto'}
        src={image.src}
      // onClick={onImageClick}
      // onError={() => { setImageDeleted(true) }} // in case the image is deleted or broken
      />
    </>
  }

  if (!char) {
    return <div>Loading...</div>
  } else {
    return (<div className="flex flex-col">
      {char.name}
      {/* 🌳 edit bio */}
      {/* discription */}

      {/* 🌳 image upload */}
      {/* profile image uploader */}
      {/* <DragDropWindowSingle
        setImage={setProfileImage}
        image={profileImage}
        setFile={setProfileFile}
        title="Profile Image"
        fileFormat=".jpg or .png"
        dropButtonText="Click or Drag Here 1 Image"
      /> */}

      {/* image uploader */}
      <DragDropWindowMultiple
        fileFormat=".jpg or .png, max 30 images"
        maxFiles={30}
        setImages={setImages}
        setFiles={setFiles}
        images={images}
        upload={() => handleUpload({ imageFiles: files, slug })}
      />
      {/* upload preview */}

      {images && Array.isArray(images) && images.length > 0 && <div
        className='m-2 p-2 border border-accent rounded-lg'>
        <div className="text-lg">Upload Preview</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:px-20">

          {(!!images && Array.isArray(images) && images.length > 0) && images.map((image, index) => {
            return (
              <ImageGridItem
                key={index}
                image={image}
              // isDiscover={true}
              // onImageClick={() => {
              //   setModalOpen(true);
              //   setModalImage(image);
              // }}
              // setImage={
              //   (updatedImg) => {
              //     setImages(images.map(i => i.id === image.id ? { ...i, ...updatedImg } : i))
              //   }}
              // onReportInitiated={() => {
              //   console.log('image.id', image.id)
              //   setReportPostId(image.id)
              //   setReportModalOpen(true)
              // }}
              // following={following}
              // setFollowing={(updatedFollowing) => setFollowing(updatedFollowing)}
              />
            )
          })}
          {/* load more */}
          <div ref={bottomRef} className='h-3 w-3' />
        </div>
      </div>
      }


      {/* 🌳 images */}


    </div>)
  }
};



// return (
//   <div>
//     <div className="flex flex-col items-center">
//       <div className="hero h-48  ">
//         <div className="hero-content text-center">
//           <div className="max-w-md">
//             <h1 className="text-5xl font-bold">Creator Asset Portal</h1>
//           </div>
//         </div>
//       </div>

//       <div className='flex justify-start items-start'>
//         <span className='mr-3 md:pt-1'>Your page name: </span>
//         {!userProfileEditingMode ?
//           <>
//             <div className='pt-1'>
//               {pageName}
//             </div>
//             <div className='ml-2'>
//               <PillButton
//                 text={''}
//                 icon={AiOutlineEdit}
//                 onClick={() => setUserProfileEditingMode(true)}
//               />
//             </div>
//           </>
//           :
//           <div className='flex flex-col'>
//             <div className='flex'>
//               <input
//                 type="text"
//                 className="w-full border border-zinc-700 rounded-md px-2 pt-1 text-black"
//                 placeholder="User Name"
//                 onChange={(e) => {
//                   e.stopPropagation();
//                   setPageName(e.target.value)
//                 }}
//                 value={pageName}
//               />
//               <div className='ml-2'>
//                 <PillButton
//                   text={''}
//                   icon={BiCheck}
//                   onClick={async (e) => {
//                     e.stopPropagation();
//                     await handleReName();
//                   }}
//                 />
//               </div>
//               <div className='ml-2'>
//                 <PillButton
//                   text={''}
//                   icon={MdCancel}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setUserProfileEditingMode(false);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         }
//       </div>

// <DragDropWindowSingle maxFiles={1} setImage={setProfileImage} image={profileImage} setFile={setProfileFile} title="Profile Image" fileFormat=".jpg or .png" />

// <DragDropWindowSingle maxFiles={1} setImage={setBannerImage} image={bannerImage} setFile={setBannerFile} title="Banner Image" fileFormat=".jpg or .png" />

//     </div>

//     <div className="flex flex-col justify-center items-center mt-6">
//       <div className='mb-5'>
//         {loading && <UploadProgress progress={progress} />}
//       </div>
//       <button className="btn btn-accent w-full mb-2" style={{ maxWidth: '24rem', minWidth: '20rem' }} onClick={uploadAll} disabled={!profileImage && !bannerImage}>Submit Images</button>
//       <button className="btn  w-full mb-10" style={{ maxWidth: '24rem', minWidth: '20rem' }} onClick={() => {
//         router.push(`${window.location.origin}/${charSlug}`);
//       }} >Return to @{charSlug} Page</button>
//     </div>
//   </div>

// );