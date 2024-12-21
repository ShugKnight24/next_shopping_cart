import { useCallback, useEffect, useState } from 'react';
import slideContent from '../../data/slides.json';
import { Dot } from './Dot';
import { Slide } from './Slide';

export function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const maxSlides = slideContent.length;

  const showSlides = useCallback((slideIndex) => {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');

    if (slides.length > 0) {
      Array.from(slides).forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
        dots[index].classList.toggle('active', index === slideIndex);
      });
    }
  }, []);

  useEffect(() => {
    showSlides(currentSlide);
  }, [currentSlide, showSlides]);

  const handleNextClick = () => {
    setCurrentSlide((prevState) => (prevState + 1) % maxSlides);
  };

  const handlePreviousClick = () => {
    setCurrentSlide((prevState) => (prevState - 1 + maxSlides) % maxSlides);
  };

  const handleDotClick = (dotIndex) => {
    setCurrentSlide(dotIndex);
  };

  return (
    <section className="carousel-container">
      <div className="product-carousel">
        {slideContent.map(
          ({
            productName,
            slideCTA,
            slideImage,
            slideMemeText,
            slideSubHeading,
            slideText,
          }) => {
            return (
              <Slide
                key={productName}
                productName={productName}
                slideCTA={slideCTA}
                slideImage={slideImage}
                slideMemeText={slideMemeText}
                slideSubHeading={slideSubHeading}
                slideText={slideText}
              />
            );
          }
        )}
        <button className="prev" onClick={() => handlePreviousClick()}>
          <i className="fas fa-chevron-circle-left" />
        </button>
        <button className="next" onClick={() => handleNextClick()}>
          <i className="fas fa-chevron-circle-right" />
        </button>
      </div>
      <div className="dots-container">
        {slideContent.map((_, index) => (
          <Dot key={index} onClick={() => handleDotClick(index)} />
        ))}
      </div>
    </section>
  );
}
