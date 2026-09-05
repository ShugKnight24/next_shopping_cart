/**
 * FullscreenCarousel - Immersive full-bleed image carousel
 *
 * A premium carousel component featuring full-screen background images
 * with Ken Burns effect, elegant typography, and smooth transitions.
 *
 * Best used for: Hero sections, product launches, brand storytelling
 *
 * @example
 * <FullscreenCarousel
 *   slides={slideData}
 *   autoplayInterval={6000}
 *   showThumbnails={true}
 * />
 */

import Link from 'next/link';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PauseIcon,
  PlayIcon,
} from '../Icons';
import styles from './FullscreenCarousel.module.css';

// Default slide data matching slides.json structure
const defaultSlides = [
  {
    productName: 'Exclusive Deals',
    slideText: 'Unbeatable prices on premium products.',
    slideMemeText:
      'We have the best deals. The best. Believe me. No one does it better.',
    slideSubHeading:
      "See something you like? Reach out and we'll make it happen.",
    slideImage: '../static/img/deal.jpg',
    slideCTA: 'Shop Deals',
    slideCTALink: '/products',
    theme: 'dark',
    accent: '#daa520',
  },
  {
    productName: 'iPhone 16 Pro',
    slideText: 'Intelligence. Redefined.',
    slideMemeText:
      'The most advanced iPhone ever. Now with Apple Intelligence built in.',
    slideSubHeading: 'Pro camera. Pro display. Pro performance.',
    slideImage: '../static/img/iphone_16.jpg',
    slideCTA: 'Learn More',
    slideCTALink: '/products/IPHONE16PRO',
    theme: 'dark',
    accent: '#c4b49a',
  },
  {
    productName: 'MacBook Pro M4',
    slideText: 'Supercharged by M4 Pro.',
    slideMemeText: 'Now in space black. The most powerful MacBook ever made.',
    slideSubHeading:
      'Up to 22 hours of battery life. Liquid Retina XDR display.',
    slideImage: '../static/img/macbook_m4.webp',
    slideCTA: 'Explore',
    slideCTALink: '/products/MACBOOKM4',
    theme: 'dark',
    accent: '#1d1d1f',
  },
  {
    productName: 'Office Pod',
    slideText: 'The Future of Work.',
    slideSubHeading: 'Premium workspace solutions for the modern professional.',
    slideMemeText:
      'Your private sanctuary. Designed for focus, built for productivity.',
    slideImage: '../static/img/office_pod.avif',
    slideCTA: 'Discover',
    slideCTALink: '/products',
    theme: 'dark',
    accent: '#2d5a87',
  },
];

export function FullscreenCarousel({
  slides = defaultSlides,
  autoplayInterval = 6000,
  showThumbnails = false,
  enableParallax = true,
  showQuote = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const progressRef = useRef(null);
  const containerRef = useRef(null);
  const slideCount = slides.length;

  const currentSlide = slides[currentIndex];

  // Handle slide navigation
  const goToSlide = useCallback(
    (index, skipTransition = false) => {
      if (isTransitioning && !skipTransition) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slideCount);
  }, [currentIndex, slideCount, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slideCount) % slideCount);
  }, [currentIndex, slideCount, goToSlide]);

  // Autoplay with progress bar
  useEffect(() => {
    if (!isAutoPlaying) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / autoplayInterval) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressRef.current = requestAnimationFrame(animate);
      } else {
        goToNext();
      }
    };

    progressRef.current = requestAnimationFrame(animate);

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, autoplayInterval, goToNext]);

  // Parallax mouse effect
  const handleMouseMove = useCallback(
    (e) => {
      if (!enableParallax || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    },
    [enableParallax]
  );

  // Pause on hover/focus
  const handleInteractionStart = () => setIsAutoPlaying(false);
  const handleInteractionEnd = () => setIsAutoPlaying(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }
  };

  return (
    <section
      ref={containerRef}
      className={`${styles.carousel} ${styles[currentSlide.theme || 'dark']}`}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {/* Background images with Ken Burns effect */}
      <div className={styles.backgroundContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.productName + index}
            className={`${styles.background} ${index === currentIndex ? styles.active : ''}`}
            style={{
              backgroundImage: `url(${slide.slideImage})`,
              transform: enableParallax
                ? `scale(1.1) translate(${(mousePosition.x - 0.5) * -20}px, ${(mousePosition.y - 0.5) * -20}px)`
                : undefined,
            }}
          />
        ))}
        <div className={styles.overlay} />
        <div className={styles.vignette} />
      </div>

      {/* Top bar with product name */}
      <header className={styles.topBar}>
        <div className={styles.productBadge}>
          <span
            className={styles.accentLine}
            style={{ backgroundColor: currentSlide.accent }}
          />
          <span className={styles.productName}>{currentSlide.productName}</span>
        </div>

        {/* Pause/Play control */}
        <button
          className={styles.playPauseButton}
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isAutoPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          <span>{isAutoPlaying ? 'Pause' : 'Play'}</span>
        </button>
      </header>

      {/* Main content */}
      <div className={styles.content}>
        <div
          className={`${styles.slideContent} ${isTransitioning ? styles.transitioning : ''}`}
        >
          {currentSlide.badge && (
            <span
              className={styles.badge}
              style={{ backgroundColor: currentSlide.accent }}
            >
              {currentSlide.badge}
            </span>
          )}

          <h1 className={styles.headline}>{currentSlide.slideText}</h1>

          {currentSlide.slideSubHeading && (
            <p className={styles.subheadline}>{currentSlide.slideSubHeading}</p>
          )}

          {showQuote && currentSlide.slideMemeText && (
            <blockquote className={styles.quote}>
              <span className={styles.quoteIcon}>"</span>
              {currentSlide.slideMemeText}
            </blockquote>
          )}

          {currentSlide.slideCTA && (
            <div className={styles.ctaContainer}>
              <Link
                href={currentSlide.slideCTALink || '/products'}
                className={styles.ctaButton}
                style={{ '--accent-color': currentSlide.accent }}
              >
                <span>{currentSlide.slideCTA}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className={`${styles.navButton} ${styles.prev}`}
        onClick={goToPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className={`${styles.navButton} ${styles.next}`}
        onClick={goToNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom controls */}
      <div className={styles.bottomControls}>
        {/* Progress indicators */}
        <div className={styles.indicators}>
          {slides.map((slide, index) => (
            <button
              key={slide.productName + index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.productName}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              <span className={styles.indicatorLabel}>{slide.productName}</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width:
                      index === currentIndex
                        ? `${progress}%`
                        : index < currentIndex
                          ? '100%'
                          : '0%',
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Slide counter */}
        <div className={styles.counter}>
          <span className={styles.current}>
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>
            {String(slideCount).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Optional thumbnails */}
      {showThumbnails && (
        <div className={styles.thumbnails}>
          {slides.map((slide, index) => (
            <button
              key={slide.productName + index}
              className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${slide.productName}`}
            >
              <img src={slide.slideImage} alt="" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

FullscreenCarousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      slideText: PropTypes.string.isRequired,
      slideMemeText: PropTypes.string,
      slideSubHeading: PropTypes.string,
      slideImage: PropTypes.string.isRequired,
      slideCTA: PropTypes.string,
      slideCTALink: PropTypes.string,
      theme: PropTypes.oneOf(['light', 'dark']),
      accent: PropTypes.string,
      badge: PropTypes.string,
    })
  ),
  autoplayInterval: PropTypes.number,
  showThumbnails: PropTypes.bool,
  enableParallax: PropTypes.bool,
  showQuote: PropTypes.bool,
};

export default FullscreenCarousel;
