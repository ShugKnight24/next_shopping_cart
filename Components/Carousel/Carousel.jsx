import Link from 'next/link';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import slideContent from '../../data/slides.json';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  StarFilled,
} from '../Icons';
import styles from './Carousel.module.css';

function Slide({
  productName,
  slideCTA,
  slideCTALink,
  slideImage,
  slideMemeText,
  slideSubHeading,
  slideText,
  isActive,
  index,
  total,
}) {
  return (
    <div
      className={`${styles.slide} ${isActive ? styles.active : ''}`}
      role="tabpanel"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${productName}`}
      aria-hidden={!isActive}
    >
      {/* Background gradient overlay */}
      <div className={styles.slideBackground}>
        <div className={styles.gradientOverlay} />
        <div className={styles.noiseTexture} />
      </div>

      <div className={styles.slideInner}>
        {/* Left content */}
        <div className={styles.slideContent}>
          <div className={styles.slideNumber}>
            <span className={styles.current}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.separator}>/</span>
            <span className={styles.total}>
              {String(total).padStart(2, '0')}
            </span>
          </div>

          <h2 className={styles.slideTitle}>{productName}</h2>

          <p className={styles.slideText}>{slideText}</p>

          <p className={styles.slideMeme}>
            <span className={styles.quoteIcon}>"</span>
            {slideMemeText}
          </p>

          {slideSubHeading && (
            <p className={styles.slideSubheading}>{slideSubHeading}</p>
          )}

          <div className={styles.slideActions}>
            {slideCTA &&
              (slideCTALink ? (
                <Link href={slideCTALink} className={styles.primaryCta}>
                  <span>{slideCTA}</span>
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <button className={styles.primaryCta}>
                  <span>{slideCTA}</span>
                  <ArrowRight size={20} />
                </button>
              ))}
            <button className={styles.secondaryCta}>
              <InfoIcon size={18} />
              <span>Learn More</span>
            </button>
          </div>
        </div>

        {/* Right image */}
        <div className={styles.slideImageContainer}>
          <div className={styles.imageFrame}>
            <div className={styles.imageGlow} />
            <img
              src={slideImage}
              alt={productName}
              loading={index === 0 ? 'eager' : 'lazy'}
              className={styles.slideImage}
            />
            <div className={styles.imageReflection} />
          </div>

          {/* Floating elements around image */}
          <div className={styles.floatingElements}>
            <div className={styles.floatingBadge}>
              <StarFilled size={14} />
              <span>Featured</span>
            </div>
            <div className={styles.floatingCircle} />
            <div className={styles.floatingDiamond} />
          </div>
        </div>
      </div>
    </div>
  );
}

Slide.propTypes = {
  productName: PropTypes.string.isRequired,
  slideCTA: PropTypes.string,
  slideCTALink: PropTypes.string,
  slideImage: PropTypes.string.isRequired,
  slideMemeText: PropTypes.string.isRequired,
  slideSubHeading: PropTypes.string,
  slideText: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  total: PropTypes.number,
};

export function Carousel({
  slides = slideContent,
  autoPlayInterval = 6000,
  pauseOnHover = true,
  showHeader = true,
  headerLabel = 'Featured Products',
  headerTitle = 'Exceptional Finds',
  enableSwipe = true,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [_isHovered, setIsHovered] = useState(false);
  const maxSlides = slides.length;
  const containerRef = useRef(null);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  const handleNextClick = useCallback(() => {
    setCurrentSlide((prevState) => (prevState + 1) % maxSlides);
  }, [maxSlides]);

  const handlePreviousClick = useCallback(() => {
    setCurrentSlide((prevState) => (prevState - 1 + maxSlides) % maxSlides);
  }, [maxSlides]);

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
  }, [handleNextClick, handlePreviousClick]);


  const handleDotClick = (dotIndex) => {
    setCurrentSlide(dotIndex);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (pauseOnHover) setIsPaused(false);
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e) => {
    if (!enableSwipe) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!enableSwipe) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!enableSwipe) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNextClick();
      } else {
        handlePreviousClick();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section
      className={styles.carouselContainer}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured products carousel"
      aria-roledescription="carousel"
    >
      {/* Background decorative elements */}
      <div className={styles.backgroundDecorations}>
        <div className={styles.gridPattern} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
      </div>

      {/* Section header */}
      {showHeader && (
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{headerLabel}</span>
          <h2 className={styles.sectionTitle}>{headerTitle}</h2>
        </div>
      )}

      {/* Slides container */}
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => (
          <Slide
            key={slide.productName}
            {...slide}
            isActive={index === currentSlide}
            index={index}
            total={maxSlides}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={handlePreviousClick}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={handleNextClick}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom controls */}
      <div className={styles.carouselControls}>
        {/* Progress indicators */}
        <div className={styles.progressIndicators}>
          {slides.map((slide, index) => (
            <button
              key={index}
              className={`${styles.progressDot} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.productName}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            >
              <span className={styles.dotLabel}>{slide.productName}</span>
              <div className={styles.dotProgress}>
                {index === currentSlide && !isPaused && (
                  <div
                    className={styles.dotProgressBar}
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Play/Pause button */}
        <button
          className={`${styles.playPauseButton} ${isPaused ? styles.paused : ''}`}
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
        >
          {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
        </button>
      </div>
    </section>
  );
}

Carousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      slideText: PropTypes.string.isRequired,
      slideMemeText: PropTypes.string.isRequired,
      slideSubHeading: PropTypes.string,
      slideImage: PropTypes.string.isRequired,
      slideCTA: PropTypes.string,
      slideCTALink: PropTypes.string,
    })
  ),
  autoPlayInterval: PropTypes.number,
  pauseOnHover: PropTypes.bool,
  showHeader: PropTypes.bool,
  headerLabel: PropTypes.string,
  headerTitle: PropTypes.string,
  enableSwipe: PropTypes.bool,
};
