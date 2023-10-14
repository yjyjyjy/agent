import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

export default function ImageSlider({
  images,
  onChange = null,
  onClick = null,
  autoPlay = false,
  showThumbs = false,
  wideCarousel = false,
  // emulateTouch = true,
  // swipeable = true,
}) {
  // console.log(images);
  // console.log('wideCarousel', wideCarousel)
  return (
    <div className={wideCarousel ? '' : 'max-w-[380px]'}>
      <Carousel
        autoPlay={autoPlay}
        infiniteLoop={true}
        showThumbs={showThumbs}
        // axis="horizontal"
        preventMovementUntilSwipeScrollTolerance={true}
        swipeScrollTolerance={50}
        // emulateTouch={emulateTouch}
        // swipeable={swipeable}
        onClickItem={(index) => { onClick() }}
        onChange={(index) => {
          if (!onChange) return
          onChange(index)
        }}
      >
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} />
          </div>
        ))}
      </Carousel>
    </div>
  )
}