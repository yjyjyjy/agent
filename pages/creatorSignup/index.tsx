import { useState } from "react";
import PillButton from '@/components/ui/PillButton';
import { BiCheck } from 'react-icons/bi';
import { MdCancel } from 'react-icons/md';
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AiOutlineFileImage, AiOutlineEdit } from "react-icons/ai";
import Confetti from 'react-confetti'
import { motion, AnimatePresence } from "framer-motion";
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import axios from "axios";
import { useToasts } from 'react-toast-notifications';
import UploadProgress from "@/components/imageHosting/uploadProgress";
import { uploadSingleImageCDN } from '@/utils/cloudflare'
import { useUser } from "@/utils/useUser";
import { useRouter } from "next/router";

//-------------------- HEYHEYHEY TODO -----------------
//If User did not register go to sign up and redirect back to this page AFTER CLICKING the GET Started Button
//If User Did register and HAVE already had a character, just redirect to users' character page
//Other wise proceed with this page

export default function CreatorSignup() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isBrowser = typeof window !== "undefined";

  const [windowDimensions, setWindowDimensions] = useState(
    isBrowser ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 }
  );

  function handleResize() {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  const [welcomeText, setWelcomeText] = useState("Get Started")

  useEffect(() => {
    if (isBrowser) {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isBrowser]);

  // useEffect(() => {
  //   if (user) {
  //     setWelcomeText("Get Started")
  //   } else {
  //     setWelcomeText("Sign Up")
  //   }
  // }, []);

  let [progress, setProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0)
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts()
  const { user } = useUser();
  const router = useRouter();

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };


  const pageTransition = {
    type: "spring",
    ease: "anticipate",
    duration: 0.5,
  };

  function checkUserState() {
    //if user is logged in
    if (user) {
      goNextPage()
    } else {
      router.push(`/signin?creatorSignUp=${true}`)
    }

  }

  function goNextPage() {
    // check for handle, handle is unique
    setCurrentPage(currentPage + 1);
  }

  function goPreviousPage() {
    setCurrentPage(currentPage - 1);
  }

  const uploadAll = async (charId) => {
    setLoading(true);
    let totalImages = 0;
    if (profileFile) totalImages += 1;
    if (bannerFile) totalImages += 1;

    let updateData = {}
    if (profileFile) {
      // upload profile image
      const profileUrl = await uploadSingleImageCDN(profileFile)
      updateData['image_url'] = profileUrl
      setProgress(1 / totalImages * 100)
    }
    if (bannerFile) {
      // upload banner image
      const bannerUrl = await uploadSingleImageCDN(bannerFile)
      updateData['banner_image'] = bannerUrl
      setProgress(1 / totalImages * 100)
    }

    // write data here
    console.log('updateData', updateData)
    if (Object.keys(updateData).length > 0) {
      const { status, data } = await axios.put('/api/characters/update', {
        updateData: updateData,
        charId: charId
      });
      if (status !== 200) {
        setLoading(false);
        addToast('Upload failed', { appearance: 'error', autoDismiss: true })
        return
      }
    }

    // set Success
    setLoading(false);
    addToast('Upload successful', { appearance: 'success', autoDismiss: true })
  }

  function DragDropWindowSingle(props) {
    const { title, fileFormat, maxFiles, image, setImage, setFile } = props;

    const onDrop = useCallback((acceptedFiles) => {
      // Upload files to storage
      acceptedFiles.forEach((file) => {
        setFile({ imageFile: file });
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
      });
    }, [setImage]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      //@ts-ignore
      accept: "image/*",
      maxFiles: maxFiles,
      noClick: true,
      noKeyboard: true,
      onDrop,
    });


    return (
      <div className="hero max-h-96 ">
        <div className="hero-content text-center">
          <figure>
            {image == null ? <AiOutlineFileImage className="w-32 h-32" /> : <img className="max-h-48" alt="preview image" src={image} />}
          </figure>
          <div className="dropzone mt-10">

            <div className="w-full flex-row flex bordered w-full max-w-xs">

              <div >
                <h2 className="card-title mb-2">{title}</h2>

                <div {...getRootProps()} className="drag_drop_wrapper">
                  <input hidden {...getInputProps()} />
                  <div className="flex flex-row items-center justify-center">
                    {!image && <button onClick={open} className={"dropzone_button btn w-full btn-accent"}>
                      {
                        isDragActive ?
                          "Drop the photo here..." :
                          "Click or Drag " + title
                      }
                    </button>}
                    {image && <div className="btn w-full btn-outline" onClick={() => {
                      setImage(null)
                    }}>Clear</div>}
                  </div>

                </div>
                <label className="label mt-2">
                  <span className="label-text-alt">{fileFormat}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>)
  }
  function WelcomePage() {
    return <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome!</h1>
          <p className="py-6">Join the fastest growing platform for AI empowered creators and make money doing what you love!</p>
          <button onClick={checkUserState} className="btn btn-primary">{welcomeText}</button>
        </div>
      </div>
    </div>
  }

  function NameAndHandle() {
    const checkHandleUniqueness = async (handle) => {
      // Assuming you have a function to fetch handles from your database
      const { status, data } = await axios.post('/api/auth/check_user_name', { handle: handle });
      if (status !== 200) {
        return false;
      }
      return data.isUnique;
    }

    return <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">What should the world be known you as?</h1>

          <div className="flex flex-col justify-center items-center mt-20">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">What is your name? (for your main page)</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-control w-full max-w-xs mt-5 mb-20 ">
              <label className="label">
                <span className="label-text">Come up with a exclusive handle</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
                value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} />
            </div>
            <div className="flex flex-row justify-center items-center ">
              <button onClick={goPreviousPage} className="btn ">Back</button>
              <button onClick={() => {
                checkHandleUniqueness(handle).then((isUnique) => {
                  if (isUnique) {
                    if (name == "") {
                      addToast("Name Can not be Empty", { autoDismiss: true, appearance: "error" })
                      return
                    }
                    if (handle == "") {
                      addToast("Handle can not be Empty", { autoDismiss: true, appearance: "error" })
                      return
                    }
                    goNextPage();
                  } else {
                    addToast('Handle is already taken', { appearance: 'error', autoDismiss: true })
                  }
                })
              }
              } className="btn btn-primary btn-wide ml-5">Next</button>

            </div>
          </div>


        </div>
      </div>
    </div>
  }

  function Description() {
    return <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">What should the world know about you?</h1>

          <div className="flex flex-col justify-center items-center mt-20">
            <div className="form-control mb-10 w-full">
              <label className="label">
                <span className="label-text">Your bio</span>
              </label>
              <textarea className="textarea textarea-bordered h-24" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
            </div>

            <div className="flex flex-row justify-center items-center ">
              <button onClick={goPreviousPage} className="btn ">Back</button>
              <button onClick={() => {
                if (bio == "") {
                  addToast("Bio can not be empty", { autoDismiss: true, appearance: 'error' })
                } else {
                  goNextPage()
                }
              }} className="btn btn-primary btn-wide ml-5">Next</button>

            </div>
          </div>


        </div>
      </div>
    </div>
  }

  function AssetUpload() {
    return <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Setup your Profile</h1>
          <div className="flex flex-col justify-center items-center mt-10">

            <DragDropWindowSingle maxFiles={1} setImage={setProfileImage} image={profileImage} setFile={setProfileFile} title="Profile Image" fileFormat=".jpg or .png" />
            <DragDropWindowSingle maxFiles={1} setImage={setBannerImage} image={bannerImage} setFile={setBannerFile} title="Banner Image (Optional)" fileFormat="Landscape Orientation .jpg or .png" />
            <div className='mb-10'>
              {loading && <UploadProgress progress={progress} />}
            </div>
          </div>

          <div className="flex flex-row justify-center items-center ">
            <button onClick={goPreviousPage} className="btn ">Back</button>
            <button onClick={
              async () => {
                setLoading(true);
                // update user profile
                const { status, data } = await axios.post('/api/characters/update', {
                  name: name,
                  url_slug: handle,
                  bio: bio
                });
                if (status !== 200) {
                  setLoading(false);
                  addToast('Upload failed', { appearance: 'error', autoDismiss: true })
                  return
                }
                const charId = data.row.id;
                // TODO trigger image upload and update
                uploadAll(charId).then(() => {
                  setLoading(false);
                  goNextPage();
                })
              }
            } className="btn btn-primary btn-wide ml-5" disabled={!profileImage || loading}>Confirm and finish</button>

          </div>
        </div>


      </div>
    </div>


  }

  function SuccessPage() {
    return <>
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
      />
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Your done!</h1>
            <p className="py-6">Go to your page and upload your first post</p>
            <button className="btn btn-primary" onClick={() => {
              router.push(`/${handle}`)
            }}>Go to my page</button>
          </div>
        </div>
      </div>
    </>
  }

  function PageSelector() {
    return (
      <AnimatePresence>
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {currentPage === 0 && WelcomePage()}
          {currentPage === 1 && NameAndHandle()}
          {currentPage === 2 && Description()}
          {currentPage === 3 && AssetUpload()}
          {currentPage === 4 && SuccessPage()}
        </motion.div>
      </AnimatePresence>
    );
  }

  return PageSelector();


}

