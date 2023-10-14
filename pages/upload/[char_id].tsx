import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { AiOutlineFileImage } from "react-icons/ai";
import { useDropzone } from "react-dropzone";
import { Gallery } from "react-grid-gallery";
import { createPagesBrowserClient, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import UploadProgress from "@/components/imageHosting/uploadProgress";
import { useRouter } from "next/router";
import { db } from "../../firebase/config";
import { collection, addDoc } from "@firebase/firestore";
import axios from 'axios'
import { useToasts } from 'react-toast-notifications'
import { useUser } from "@/utils/useUser";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { get } from "http";

type Image = {
  imageFile: Blob;
};

// Server side rendering to check if the user is a subscriber
export async function getServerSideProps(context) {
  const supabase = createPagesServerClient({ req: context.req, res: context.res });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const userId = user?.id
  let reviewStatus = 'pending';

  if (userId) {
    // check if user is approved for review
    const { data, error } = await supabase
      .from('users')
      .select('under_review')
      .eq('id', userId)
      .single();
    if (error) {
      console.log('error getting user data', error)
    }
    if (data) {
      reviewStatus = data.under_review ? 'pending' : 'approved';
    }
  }
  // If there is a user, return their data.
  return { props: { reviewStatus } };
}


const UploadPosts = ({ reviewStatus }) => {
  const router = useRouter();
  const charId = router.query.char_id;
  const { addToast } = useToasts()

  let [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [coverImage, setCoverImage] = useState([]);
  const [coverImageFiles, setCoverImageFile] = useState<Image[]>([]);

  const [files, setFiles] = useState<Image[]>([]);
  const [caption, setCaption] = useState(""); // Added state for caption
  const [loadingState, setLoadingState] = useState(true); // Added state for loading
  const [submitEnabled, setSubmitEnabled] = useState(false); // Added state for loading
  const [postVisibilityEveryone, setPostVisibilityEveryone] = useState(null); // Added state for loading
  const [paywallTokenAmount, setPaywallTokenAmount] = useState(0); // Added state for loading
  const [isPreviewImageEnabled, setIsPreviewImageEnabled] = useState(false);
  const [char_slug, setChar_slug] = useState("404");

  const { user } = useUser();

  useEffect(() => {
    checkCreator(router.query.char_id)
    getChar_slug()
  }, [router.isReady]);

  async function getChar_slug() {
    const response = await axios.post('/api/characters/get_slug_from_id', { char_id: charId });
    setChar_slug(response.data.id[0].url_slug)
  }
  async function checkCreator(charId) {
    if (user) {
      const response = await axios.post('/api/creator/checkIfCreator', {
        charId: charId,
        id: user.id
      });
      console.log("After Axios call, response:", response);
      if (response.data.isCreator == false) {
        console.log("Not a creator");
        router.push('/404');
      } else {
        setLoadingState(false);
      }
    }
  }

  useEffect(() => {
    if (images.length != 0 && caption !== "" && postVisibilityEveryone != null) {
      if (postVisibilityEveryone == false && paywallTokenAmount == 0) {
        setSubmitEnabled(false);
      } else {
        if (isPreviewImageEnabled && coverImageFiles.length == 0) {
          setSubmitEnabled(false);
        } else {
          setSubmitEnabled(true);
        }
      }
    } else {
      setSubmitEnabled(false);
    }

  }, [images, caption, paywallTokenAmount, postVisibilityEveryone, coverImageFiles, isPreviewImageEnabled]);

  async function getSignedUrl(is_public) {
    if (postVisibilityEveryone == true || is_public) {
      const data = await fetch('/api/images/signed_url_public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ charId: charId }),
      }).then((res) => res.json())
      return data?.uploadURL
    }
    const data = await fetch('/api/images/signed_url_private', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ charId: charId }),
    }).then((res) => res.json())
    return data?.uploadURL
  }

  async function uploadFile({ file, signedUrl }) {
    const data = new FormData()
    data.append('file', file)
    const upload = await fetch(signedUrl, {
      method: 'POST',
      body: data,
    }).then((r) => r.json())
    return upload?.result?.id
  }

  // upload to cloudflare
  const uploadSingleImageCDN = async ({ imageFile }: Image, is_public) => {
    // send in and get the response url
    const signedUrl = await getSignedUrl(is_public)
    if (!signedUrl) {
      setLoading(false)
      return console.error('No signed url')
    }
    console.log('signedUrl', signedUrl)

    const id = await uploadFile({ file: imageFile, signedUrl })
    if (!id) {
      setLoading(false)
      return console.error('Upload failed')
    }
    console.log('id', id)
    const url = `https://imagedelivery.net/nlM6HQk41K_Fcp5lNigPXA/${id}/public`
    return url
  };

  const getCloudFlareBatchToken = async () => {
    const { status, data } = await axios.get('/api/images/cloudflare_get_batch_token', {});
    if (status !== 200) {
      console.log(data)
      addToast(data.message, { appearance: 'error', autoDismiss: true })
      throw new Error('Failed to get batch token')
    }
    return data.batchToken
  };


  const batchUpload = async () => {
    setLoading(true);
    // batch token not working, and theres not much documentation on it
    // const batchToken = await getCloudFlareBatchToken() 

    if (files.length > 0) {
      // upload previewImage
      let previewCDNURL = []
      if (coverImageFiles.length > 0) {
        const url = await uploadSingleImageCDN(coverImageFiles[0], true)
        previewCDNURL.push(url)
        setProgress((1) / files.length * 100)
      }

      // upload images
      let cdnUrls = []
      for (let i = 0; i < files.length; i++) {
        const previewUrl = await uploadSingleImageCDN(files[i], false)
        cdnUrls.push(previewUrl)
        // update progress
        setProgress((i + 1) / files.length * 100)
      }

      // update firebase
      const collectionRef = collection(db, "posts", String(charId), "posts");
      try {
        await addDoc(collectionRef, {
          caption: caption,
          image: cdnUrls,
          cover: postVisibilityEveryone ? cdnUrls[0] : previewCDNURL.length > 0 ? previewCDNURL[0] : cdnUrls[0].replace('public', 'blur'),
          timestamp: new Date(),
          status: reviewStatus,
          price: paywallTokenAmount //token
        })
      } catch (error) {
        console.error('Failed to add document to the collection: ', error);
        addToast('Upload Failed, Please Try again', { appearance: 'error', autoDismiss: true })
        setLoading(false);
        throw error;
      }
    }
    // set Success
    setLoading(false);
    addToast('Upload successful', { appearance: 'success', autoDismiss: true })
    if (reviewStatus === 'pending') { addToast('Post under review', { appearance: 'warning' }) }
    router.push(`${window.location.origin}/${char_slug}`);
  }

  function DragDropWindowMultiple(props) {
    const { title, fileFormat, maxFiles, images, setImages, setFiles } = props;

    const onDrop = useCallback((acceptedFiles) => {
      // Upload files to storage
      acceptedFiles.forEach((file) => {
        setFiles((prevState) => [...prevState, { imageFile: file }]);
        const reader = new FileReader();
        reader.onload = (event) => {
          // Create a new image object
          const img = new window.Image();  // Use window.Image if Image gives you trouble
          img.src = event.target?.result as string;

          img.onload = () => {
            const newItem = {
              src: img.src,
              width: img.width,
              height: img.height,
            };
            // Update the state
            setImages((prevState) => [...prevState, newItem]);
          };
        };
        reader.readAsDataURL(file);
      });

    }, [setImages, setFiles]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      //@ts-ignore
      accept: "image/*",
      maxFiles: maxFiles,
      noClick: true,
      noKeyboard: true,
      onDrop,
    });

    return <div className="dropzone mt-10">

      <div className="w-full flex-row flex bordered w-full max-w-xs">

        <div >

          <div {...getRootProps()} className="drag_drop_wrapper">
            <input hidden {...getInputProps()} />
            <div className="flex flex-row items-center justify-center">
              <button onClick={open} className={images.length != 0 ? "dropzone_button btn ml-5 w-1/2 btn-accent" : "dropzone_button btn w-full btn-accent"}>
                {
                  isDragActive ?
                    "Drop the photo here..." :
                    images.length == 0 ? "Click or Drag Here to Upload" : "Add More"
                }
              </button>
              {images.length != 0 && <div className="btn w-1/2 ml-5 btn-outline" onClick={() => {
                setImages([])
                setFiles([])
              }}>Clear</div>}
            </div>

          </div>
          <label className="label mt-2">
            <span className="label-text-alt">{fileFormat}</span>
          </label>

        </div>


      </div>
    </div>
  }

  function DragDropWindowSingle(props) {
    const { title, fileFormat, maxFiles, coverImage, setCoverImage, setCoverImageFile } = props;

    const onDrop = useCallback((acceptedFiles) => {
      // Upload files to storage
      acceptedFiles.forEach((file) => {
        setCoverImageFile((prevState) => [...prevState, { imageFile: file }]);
        const reader = new FileReader();
        reader.onload = (event) => {
          // Create a new image object
          const img = new window.Image();  // Use window.Image if Image gives you trouble
          img.src = event.target?.result as string;

          img.onload = () => {
            const newItem = {
              src: img.src,
              width: img.width,
              height: img.height,
            };
            // Update the state
            setCoverImage((prevState) => [...prevState, newItem]);
          };
        };
        reader.readAsDataURL(file);
      });

    }, [setCoverImage, setCoverImageFile]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      //@ts-ignore
      accept: "image/*",
      maxFiles: maxFiles,
      noClick: true,
      noKeyboard: true,
      onDrop,
    });

    return <div className="dropzone mt-10">

      <div className="w-full flex-row flex bordered w-full max-w-xs">

        <div >

          <div {...getRootProps()} className="drag_drop_wrapper">
            <input hidden {...getInputProps()} />
            <div className="flex flex-row items-center justify-center">
              {coverImage.length == 0 && <button onClick={open} className={"dropzone_button btn w-full btn-accent"}>
                {
                  isDragActive ?
                    "Drop the photo here..." :
                    "Click or Drag Here 1 Image"
                }
              </button>}
              {coverImage.length != 0 && <div className="btn w-full btn-outline" onClick={() => {
                setCoverImage([])
                setCoverImageFile([])
              }}>Clear</div>}
            </div>

          </div>
          <label className="label mt-2">
            <span className="label-text-alt">{fileFormat}</span>
          </label>

        </div>


      </div>
    </div>
  }

  const [index, setIndex] = useState(-1);

  const currentImage = images[index];
  const nextIndex = (index + 1) % images.length;
  const nextImage = images[nextIndex] || currentImage;
  const prevIndex = (index + images.length - 1) % images.length;
  const prevImage = images[prevIndex] || currentImage;

  const handleGalleryImageClick = (index: number) => setIndex(index);
  const handleClose = () => setIndex(-1);
  const handleMovePrev = () => setIndex(prevIndex);
  const handleMoveNext = () => setIndex(nextIndex);
  const [key, setKey] = useState(0);

  useEffect(() => { setTimeout(() => setKey(key + 1)); }, [currentImage]);



  return loadingState ?
    <> <div className="fixed top-0 left-0 w-screen h-screen bg-base z-0" />
      <div className="hero min-h-screen bg-base-200">
        <div className="loading loading-lg" />
      </div>
    </> : <div>

      {!!currentImage && (
        <Lightbox
          key={key}
          mainSrc={currentImage.src}
          mainSrcThumbnail={currentImage.src}
          nextSrc={nextImage.src}
          nextSrcThumbnail={nextImage.src}
          prevSrc={prevImage.src}
          prevSrcThumbnail={prevImage.src}
          onCloseRequest={handleClose}
          onMovePrevRequest={handleMovePrev}
          onMoveNextRequest={handleMoveNext}
        />
      )}
      <div className="flex flex-col items-center">
        <div className="hero h-36">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold">Upload New Post</h1>
              <h1 className="text-xl font-bold text-accent">@{char_slug}</h1>

            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <div className="card w-96 bg-neutral text-neutral-content">
          <div className={postVisibilityEveryone != null && postVisibilityEveryone == false ? "mt-5 mr-5 ml-5" : "m-5"}>
            <h1 className="text-xl text-left font-bold mb-2 text-accent">Post Setting</h1>
            <h1 className="text-l text-left font-bold mb-1">Visibility</h1>
            <select
              className="select w-full"
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'Visible to Everyone') {
                  setPostVisibilityEveryone(true);
                } else if (selectedValue === 'Pay to view') {
                  setPostVisibilityEveryone(false);
                }
              }}
              defaultValue="Select Visibility"
            >
              <option disabled>Select Visibility</option>
              <option value="Visible to Everyone">Public (incl. visitors)</option>
              <option value="Pay to view">Pay to view</option>
            </select>
          </div>


          {postVisibilityEveryone != null && postVisibilityEveryone == false && <div>
            <div className="divider"></div>

            <div className="flex justify-center mr-5 ml-5 mb-5 ">
              <div className="form-control w-full">
                <label className="label">
                  <span className="text-l font-bold">Paywall Amount</span>
                  <span className="label-text-alt">Amount in Token</span>
                </label>
                <input
                  type="text"
                  value={paywallTokenAmount == 0 ? "" : paywallTokenAmount}
                  onChange={(e) => {
                    // Only update the state if the input is an integer or empty string
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) {
                      if (inputValue === '') {
                        setPaywallTokenAmount(0);
                      } else {
                        setPaywallTokenAmount(parseInt(inputValue));
                      }
                    }
                  }}
                  placeholder={postVisibilityEveryone == true ? "Post will be free to view" : "How much do you want to charge?"}
                  disabled={postVisibilityEveryone == null || postVisibilityEveryone == true}
                  className="input input-bordered w-full "
                />
                <label className="label">
                  <span className="label-text-alt text-accent">Token Conversion Rate 1 USD=100💰</span>
                </label>
              </div>

            </div>
            <div className="divider"></div>

            <div className="form-control justify-center mb-5 mr-5 ml-5">
              <label className="label cursor-pointer">
                <span className={isPreviewImageEnabled ? "label-text text-accent text-l font-bold" : "label-text text-l font-bold"}>{isPreviewImageEnabled ? "Free Preview Image Enabled" : "Toggle to Include free preview image"}</span>
                <input
                  type="checkbox"
                  className="toggle "
                  checked={isPreviewImageEnabled}
                  onChange={() => setIsPreviewImageEnabled(!isPreviewImageEnabled)}
                />
              </label>
            </div>
          </div>}

        </div>
      </div>
      {isPreviewImageEnabled && !postVisibilityEveryone && <div className="flex justify-center mb-6">
        <div className="card w-96 bg-neutral text-neutral-content">
          <div className="card-body items-center text-center">
            <div style={{ maxWidth: '36rem', minWidth: '20rem' }}> {/* Inline style for max-width */}
              <h1 className="text-xl text-left font-bold mb-2 text-accent">Upload Preview Image</h1>
              <h1 className="text-l text-left font-bold mb-5">Image here will unblurred as a preview</h1>

              <div className="overflow-x-auto overflow-y-auto max-h-[300px]"> {/* Added vertical scrolling and max height */}
                <Gallery images={coverImage} onSelect={
                  //delete selected image
                  (index) => {
                    setCoverImage((prevState) => prevState.filter((_, i) => i !== index));
                    setCoverImageFile((prevState) => prevState.filter((_, i) => i !== index));
                    // setImages((prevState) => prevState.filter((_, i) => i !== index));
                    // setFiles((prevState) => prevState.filter((_, i) => i !== index));
                  }
                }
                  enableImageSelection={false}
                />
              </div>

              <DragDropWindowSingle
                title=""
                fileFormat=".jpg or .png, a Single images"
                maxFiles={1}
                setCoverImage={setCoverImage}
                setCoverImageFile={setCoverImageFile}
                coverImage={coverImage}
              />
            </div>
          </div>
        </div>
      </div>}
      <div className="flex justify-center">
        <div className="card w-96 bg-neutral text-neutral-content">
          <div className="card-body items-center text-center">
            <div style={{ maxWidth: '36rem', minWidth: '20rem' }}> {/* Inline style for max-width */}
              <h1 className="text-xl text-left font-bold mb-2 text-accent">Upload Images</h1>
              {!postVisibilityEveryone && <h1 className="text-l text-left font-bold mb-5">Image here will be blured behind paywall</h1>}

              <div className="overflow-x-auto overflow-y-auto max-h-[300px]"> {/* Added vertical scrolling and max height */}
                <Gallery images={images} onSelect={
                  //delete selected image
                  (index) => {
                    setImages((prevState) => prevState.filter((_, i) => i !== index));
                    setFiles((prevState) => prevState.filter((_, i) => i !== index));
                  }
                }
                  enableImageSelection={false}
                  onClick={handleGalleryImageClick}
                />
              </div>

              <DragDropWindowMultiple
                title=""
                fileFormat=".jpg or .png, max 30 images"
                maxFiles={30}
                setImages={setImages}
                setFiles={setFiles}
                images={images}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <div className="card w-96 bg-neutral text-neutral-content">
          <div className="m-5">
            <label className="label">
              <h1 className="text-xl text-left font-bold mb-2 text-accent">Description for this Post</h1>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Enter your caption here"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>
          </div>

        </div>
      </div>

      <div className="flex flex-col justify-center items-center mt-6">
        <div className='mb-5'>
          {loading && <UploadProgress progress={progress} />}
        </div>

        <button className="btn btn-accent w-full mb-2" style={{ maxWidth: '24rem', minWidth: '20rem' }} onClick={batchUpload} disabled={!submitEnabled}>Submit Post</button>
        <button className="btn  w-full mb-10" style={{ maxWidth: '24rem', minWidth: '20rem' }} onClick={() => {
          router.push(`${window.location.origin}/${char_slug}`);
        }} >Return to @{char_slug} Page</button>
      </div>

    </div>


};

export default UploadPosts;

//loading && 
