import Link from 'next/link';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import slideContent from '../../data/slides.json';
import styles from './PremiumCarousel.module.scss';

// Slide data - can be moved to a separate file or fetched from API
// const defaultSlides = [
//   {
//     id: 1,
//     productName: 'iPhone 16 Pro',
//     headline: 'Pro. Beyond.',
//     subheadline: 'With Apple Intelligence',
//     description:
//       'The most advanced iPhone ever. Featuring the revolutionary A18 Pro chip.',
//     image:
//       'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-hero-desert-202409?wid=1200',
//     cta: { label: 'Shop Now', href: '/products/IPHONE16PRO' },
//     theme: 'dark',
//     accent: '#c4b49a',
//   },
//   {
//     id: 2,
//     productName: 'MacBook Pro M4',
//     headline: 'Mind-blowing.',
//     subheadline: 'Supercharged by M4 Pro',
//     description:
//       'The most powerful MacBook Pro ever. Up to 22 hours of battery life.',
//     image:
//       'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-16-hero-202410?wid=1200',
//     cta: { label: 'Explore', href: '/products/MACBOOKM4' },
//     theme: 'dark',
//     accent: '#1d1d1f',
//   },
//   {
//     id: 3,
//     productName: 'Gibson SG Standard',
//     headline: 'Legendary Tone.',
//     subheadline: 'Heritage Cherry',
//     description: 'The iconic rock machine. Now at an incredible price.',
//     image:
//       'https://media.sweetwater.com/api/i/f-webp__q-82__ha-d074da576794e566__hmac-f13d64ca315c00e4c5e288e72bb577873020c566/images/items/750/SGSTHCCH-large.jpg',
//     cta: { label: 'View Guitar', href: '/products/SGS17HCCH' },
//     theme: 'light',
//     accent: '#8B0000',
//     badge: 'Sale',
//   },
//   {
//     id: 4,
//     productName: 'Shure SM58',
//     headline: 'Industry Standard.',
//     subheadline: 'Trusted by professionals worldwide',
//     description: "The world's most popular vocal microphone. Built to last.",
//     image: 'https://media.sweetwater.com/images/items/750/SM58-xlarge.jpg',
//     cta: { label: 'Shop Mics', href: '/products/SM58' },
//     theme: 'light',
//     accent: '#1e3a5f',
//   },
// ];

export function PremiumCarousel({
  slides = slideContent,
  autoplayInterval = 6000,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const slideCount = slides.length;

  // Handle next/previous
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
    setProgress(0);
  }, [slideCount]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
    setProgress(0);
  }, [slideCount]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

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

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      className={`${styles.carousel} ${styles[currentSlide.theme]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {/* Background with Ken Burns effect */}
      <div className={styles.backgroundContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.background} ${index === currentIndex ? styles.active : ''}`}
            style={{
              backgroundImage: `url(${slide.slideImage})`,
            }}
          />
        ))}
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.slideContent}>
          {currentSlide.badge && (
            <span
              className={styles.badge}
              style={{ backgroundColor: currentSlide.accent }}
            >
              {currentSlide.badge}
            </span>
          )}
          <span className={styles.productName}>{currentSlide.productName}</span>
          <h1 className={styles.headline}>{currentSlide.headline}</h1>
          <h2 className={styles.subheadline}>{currentSlide.subheadline}</h2>
          <p className={styles.description}>{currentSlide.description}</p>
          {currentSlide.cta && (
            <Link href={currentSlide.cta.href} className={styles.ctaButton}>
              {currentSlide.cta.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}
        </div>

        {/* Product image overlay (optional second image positioning) */}
        <div className={styles.productImage}>
          <img src={currentSlide.slideImage} alt={currentSlide.productName} />
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className={`${styles.navButton} ${styles.prev}`}
        onClick={goToPrev}
        aria-label="Previous slide"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className={`${styles.navButton} ${styles.next}`}
        onClick={goToNext}
        aria-label="Next slide"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Progress indicators */}
      <div className={styles.indicators}>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
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
    </section>
  );
}

PremiumCarousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productName: PropTypes.string.isRequired,
      headline: PropTypes.string.isRequired,
      subheadline: PropTypes.string,
      description: PropTypes.string,
      image: PropTypes.string.isRequired,
      cta: PropTypes.shape({
        label: PropTypes.string.isRequired,
        href: PropTypes.string.isRequired,
      }),
      theme: PropTypes.oneOf(['light', 'dark']),
      accent: PropTypes.string,
      badge: PropTypes.string,
    })
  ),
  autoplayInterval: PropTypes.number,
};
