import { useCallback, useEffect, useRef, useState } from 'react';
import slideContent from '../../data/slides.json';
import { Dot } from './Dot';
import { Slide } from './Slide';
import { ChevronLeft, ChevronRight, PlayIcon, PauseIcon } from '../Icons';

export function Carousel({ autoPlayInterval = 6000, pauseOnHover = true }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const maxSlides = slideContent.length;
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  const showSlides = useCallback((slideIndex) => {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');

    if (slides.length > 0) {
      Array.from(slides).forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
        dots[index]?.classList.toggle('active', index === slideIndex);
      });
    }
  }, []);

  useEffect(() => {
    showSlides(currentSlide);
  }, [currentSlide, showSlides]);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || !autoPlayInterval) return;

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100);
      setProgress(newProgress);
    }, 50);

    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % maxSlides);
      setProgress(0);
    }, autoPlayInterval);

    return () => {
      clearTimeout(slideTimer);
      clearInterval(progressInterval);
    };
  }, [currentSlide, isPaused, autoPlayInterval, maxSlides]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        !containerRef.current?.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousClick();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextClick();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextClick = () => {
    setCurrentSlide((prevState) => (prevState + 1) % maxSlides);
  };

  const handlePreviousClick = () => {
    setCurrentSlide((prevState) => (prevState - 1 + maxSlides) % maxSlides);
  };

  const handleDotClick = (dotIndex) => {
    setCurrentSlide(dotIndex);
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  return (
    <section
      className="carousel-container"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Image carousel"
      aria-roledescription="carousel"
    >
      <div className="product-carousel">
        {slideContent.map(
          (
            {
              productName,
              slideCTA,
              slideImage,
              slideMemeText,
              slideSubHeading,
              slideText,
            },
            index
          ) => {
            return (
              <Slide
                key={productName}
                productName={productName}
                slideCTA={slideCTA}
                slideImage={slideImage}
                slideMemeText={slideMemeText}
                slideSubHeading={slideSubHeading}
                slideText={slideText}
                isActive={index === currentSlide}
                index={index}
                total={maxSlides}
              />
            );
          }
        )}
        <button
          className="prev"
          onClick={handlePreviousClick}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button
          className="next"
          onClick={handleNextClick}
          aria-label="Next slide"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="carousel-controls">
        <div
          className="dots-container"
          role="tablist"
          aria-label="Carousel slides"
        >
          {slideContent.map((slide, index) => (
            <Dot
              key={index}
              onClick={() => handleDotClick(index)}
              isActive={index === currentSlide}
              index={index}
              label={slide.productName}
            />
          ))}
        </div>
        {autoPlayInterval > 0 && (
          <button
            className={`play-pause-btn ${isPaused ? 'paused' : ''}`}
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? (
              <PlayIcon size={16} aria-hidden="true" />
            ) : (
              <PauseIcon size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {/* Progress bar */}
      {autoPlayInterval > 0 && !isPaused && (
        <div className="carousel-progress" ref={progressRef}>
          <div
            className="carousel-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  );
}
