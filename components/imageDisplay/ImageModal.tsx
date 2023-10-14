import { Transition, Dialog } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { imageToDataUri } from '../../utils/helpers';
import InpaintMaskCanvas from './InpaintMaskCanvas';
import ModalActions from './ModalActions';
import ImageSlider from '../ui/ImageSlider';
import { findAspectRatioDimensions } from '@/utils/helpers';
import { Mixpanel, MixpanelEvents } from '../../lib/mixpanel';
import { useRouter } from 'next/router';
import { upscaleParams } from '../../constants/upscale';
import ParticleAnimation from 'react-particle-animation'

const ImageModal = ({
  modalOpen,
  setModalOpen,
  modalImage,
  neverDismiss = false
}) => {
  const router = useRouter()
  const canvas = useRef<any>();

  const [currentImage, setCurrentImage] = useState(modalImage);


  useEffect(() => {
    setCurrentImage(modalImage);
  }, [modalImage])

  const { image_url, id, created_by, char_name, description } = currentImage;

  useEffect(() => {
    console.log('modalImage', modalImage)
  }, [modalOpen])

  const getPanelBody = () => {
    return <div className='h-[600px]'>
      <img src={image_url} className='object-contain w-full h-full' />
    </div>
  }

  return (<Transition.Root show={modalOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => {
      if (!neverDismiss) {
        setModalOpen(false)
      }
    }}>

      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >

        <div className="fixed inset-0 bg-base transition-opacity" />
      </Transition.Child>



      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-5 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative transform overflow-hidden transition-all sm:mt-8 sm:max-w-2xl sm:max-h-2xl sm:p-1">
              <div className=''>
                {getPanelBody()}
              </div>
              <ModalActions id={id} name={char_name} description={description} created_by={created_by} setModalOpen={setModalOpen} />

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition.Root>);
};

export default ImageModal;
