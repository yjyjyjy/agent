import { useUser } from '@/utils/useUser';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

const BlurredImage = ({ imageSrc, blur, unlockPremiumCallBack, msgId, cost }) => {
  const { user } = useUser();
  const [blurState, setBlurState] = useState(blur)
  const [ubSrc, setUbSrc] = useState(null)
  const { addToast } = useToasts()

  const blurImageCallBack = async () => {
    const { status, data } = await axios.post('/api/images/blur_image', {
      url: imageSrc
    })
    if (status === 200) {
      setUbSrc(data.blurredImage)
    }
  }

  useEffect(() => {
    blurImageCallBack();
  }, [blurState]);

  // Wait for ubSrc to be available before rendering the image
  if (ubSrc === null && blurState) {
    return <div>Loading Image...</div>;
  }

  return (
    <div className="relative flex items-center justify-center w-full h-auto">
      <img
        src={blurState ? ubSrc : imageSrc}
        alt="Descriptive alt text"
        className="w-full h-auto z" // Adding a z-index to ensure image stays below the button
      />
      {blurState && (
        <button
          className="btn btn-primary absolute z-10" // Making sure button is above the image
          onClick={async () => {
            if (await unlockPremiumCallBack(msgId)) {
              setBlurState(false);
              addToast('Unlocked premium picture', { appearance: 'success', autoDismiss: true });
            } else {
              // console.log('bubble.not enough token')
              if (user?.id) {
                console.log('herererehere')
                addToast('Not enough token left', { appearance: 'error', autoDismiss: true })
              }

            }
          }}
        >
          Unlock {cost}💰
        </button>
      )}
    </div>
  );

};

export default BlurredImage;
