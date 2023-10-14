
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useEffect, useRef } from 'react';



const InpaintMaskCanvas = ({ imageUrl, canvas, width, height }) => {
  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  const [windowWdith, windowHeight] = windowSize.current;

  useEffect(() => {
    const canvas_with_mask = document.querySelector("#react-sketch-canvas__stroke-group-0");
    canvas_with_mask.removeAttribute("mask");
  }, [])

  const calculateAspectRatioFit = (srcWidth, srcHeight, screenWidth, screenHeight) => {
    screenWidth = Math.min(screenWidth, 600)
    screenHeight = Math.min(screenHeight, 600)
    const ratio = Math.min((screenWidth / srcWidth), (screenHeight / srcHeight));
    return { imgWith: srcWidth * ratio, imgHeight: srcHeight * ratio };
  }
  const { imgWith, imgHeight } = calculateAspectRatioFit(width, height, windowWdith - 50, windowHeight - 350);

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className='border-2 border-white'>
        <ReactSketchCanvas
          ref={canvas}
          width={`${imgWith}px`}
          height={`${imgHeight}px`}
          strokeWidth={20}
          canvasColor="black"
          strokeColor="white"
          backgroundImage={imageUrl}
        />
      </div>
    </div>
  )
}

export default InpaintMaskCanvas;