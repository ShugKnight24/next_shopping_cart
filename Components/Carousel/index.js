/**
 * =============================================================================
 * CAROUSEL CONFIGURATION & EXPORTS
 * =============================================================================
 *
 * This file provides a centralized way to select and configure carousels.
 * Two carousel variants are available:
 *
 * 1. CAROUSEL (Card-Based)
 *    - Split layout with content on left, image on right
 *    - Best for: Product showcases, feature highlights
 *    - Shows: Title, description, quote, CTA buttons
 *    - Floating decorative elements
 *
 * 2. FULLSCREEN CAROUSEL (Immersive)
 *    - Full-viewport background images
 *    - Best for: Hero sections, landing pages, brand storytelling
 *    - Shows: Headline, description, quote, thumbnails (optional)
 *    - Ken Burns effect, parallax (optional)
 *
 * =============================================================================
 */

// Export both carousel variants for direct use
export { Carousel } from './Carousel';
export { FullscreenCarousel } from './FullscreenCarousel';

// Default export is the Carousel (card-based) variant
export { Carousel as default } from './Carousel';

/**
 * =============================================================================
 * CAROUSEL CONFIG
 * =============================================================================
 *
 * Configuration object for carousel defaults.
 * Developers can import and spread this config when using carousels.
 *
 * @example
 * import { Carousel, CAROUSEL_CONFIG } from '../Components/Carousel';
 * <Carousel {...CAROUSEL_CONFIG.card} slides={mySlides} />
 */
export const CAROUSEL_CONFIG = {
  // Card-based carousel (split layout)
  card: {
    autoPlayInterval: 6000,
    pauseOnHover: true,
    showHeader: true,
    headerLabel: 'Featured Products',
    headerTitle: 'Exceptional Finds',
    enableSwipe: true,
  },

  // Fullscreen carousel (immersive hero)
  fullscreen: {
    autoplayInterval: 5000,
    showThumbnails: true,
    enableParallax: false,
    showQuote: true,
  },
};

/**
 * =============================================================================
 * VARIANT SELECTOR
 * =============================================================================
 *
 * Helper to select carousel component by variant name.
 * Useful for dynamic rendering based on configuration.
 *
 * @param {'card' | 'fullscreen'} variant - The carousel variant to use
 * @returns {React.Component} The carousel component
 *
 * @example
 * import { getCarouselByVariant } from '../Components/Carousel';
 * const CarouselComponent = getCarouselByVariant('fullscreen');
 * <CarouselComponent slides={mySlides} />
 */
import { Carousel } from './Carousel';
import { FullscreenCarousel } from './FullscreenCarousel';

export function getCarouselByVariant(variant = 'card') {
  const variants = {
    card: Carousel,
    fullscreen: FullscreenCarousel,
  };

  return variants[variant] || Carousel;
}

/**
 * =============================================================================
 * UNIVERSAL CAROUSEL
 * =============================================================================
 *
 * A wrapper component that renders the appropriate carousel based on variant prop.
 * This is the easiest way to switch between carousel types.
 *
 * @param {Object} props
 * @param {'card' | 'fullscreen'} props.variant - Which carousel variant to render
 * @param {Array} props.slides - Slide data
 * @param {Object} props...rest - Additional props passed to the carousel
 *
 * @example
 * import { UniversalCarousel } from '../Components/Carousel';
 *
 * // Use card-based carousel
 * <UniversalCarousel variant="card" slides={slideData} />
 *
 * // Use fullscreen carousel
 * <UniversalCarousel variant="fullscreen" slides={slideData} showThumbnails />
 */
export function UniversalCarousel({ variant = 'card', ...props }) {
  const CarouselComponent = getCarouselByVariant(variant);
  return <CarouselComponent {...props} />;
}

/**
 * =============================================================================
 * SLIDE DATA STRUCTURE
 * =============================================================================
 *
 * Both carousels expect slides in this format (matching slides.json):
 *
 * {
 *   productName: string,     // Product or slide title
 *   slideText: string,       // Main description text
 *   slideMemeText: string,   // Quote or tagline
 *   slideSubHeading: string, // Optional subheading
 *   slideImage: string,      // Image URL or path
 *   slideCTA: string,        // Call-to-action button text
 *   slideCTALink: string,    // CTA link URL
 * }
 *
 * =============================================================================
 */
