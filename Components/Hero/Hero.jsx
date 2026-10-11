import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useId, useState } from 'react';
import { StarFilled } from '../Icons';
import { CartCommerceMark } from './CartCommerceMark';
import { CartTrackScene } from './CartTrackScene';
import styles from './Hero.module.css';
import { HeroAnimationSwitcher } from './HeroAnimationSwitcher';
import { Isometric3DHero } from './Isometric3DHero';
import { VaultAnimation } from './VaultAnimation';
import { WebGLCosmicHero } from './WebGLCosmicHero';

// Scroll to section helper
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Premium Cart Commerce Logo: the chrome cart mark (see CartCommerceMark).
function CartCommerceLogo({ className }) {
  return <CartCommerceMark className={className} />;
}

/**
 * One shopping cart drawn as a line icon on a 64-unit box: a handle with a
 * grip, a wire basket (rim, rails and wires), the chassis and two wheels.
 * The same three-quarter silhouette as the brand mark, so the wallpaper
 * reads as carts at a glance rather than as trapezoids.
 */
function PatternCart({ x, y, scale = 1, rotate = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {/* Handle and grip */}
      <path d="M4 14 H11 L17 22" strokeWidth="2.6" />
      {/* Basket: rim, floor, ends */}
      <path d="M17 22 H60 L55 42 H22 Z" strokeWidth="2.2" />
      {/* Wire rails and uprights */}
      <path
        d="M18.6 28.6 H58.4 M20.2 35.2 H56.8 M27 22 L29 42 M37 22 L38 42 M47 22 L47 42 M56 22 L54 42"
        strokeWidth="1.1"
        opacity="0.75"
      />
      {/* Chassis */}
      <path d="M22 42 L24.5 49 H55" strokeWidth="2.2" />
      {/* Wheels */}
      <circle cx="28" cy="54" r="3.4" strokeWidth="2" />
      <circle cx="51" cy="54" r="3.4" strokeWidth="2" />
    </g>
  );
}

PatternCart.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  scale: PropTypes.number,
  rotate: PropTypes.number,
};

// Cart Pattern Background Component: a staggered wallpaper of carts that
// drifts diagonally by exactly one tile per loop.
function CartPatternBackground({ className }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <div className={className}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`${id}-carts`}
            x="0"
            y="0"
            width="220"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="rgba(218, 165, 32, 1)"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.2"
            >
              <PatternCart x={14} y={8} scale={1.3} rotate={-4} />
              <PatternCart x={128} y={84} scale={1.1} rotate={5} />
            </g>
          </pattern>
        </defs>
        <rect
          x="-220"
          y="-160"
          width="200%"
          height="200%"
          fill={`url(#${id}-carts)`}
          className={styles.cartPatternRect}
        />
      </svg>
    </div>
  );
}

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [animationMode, setAnimationMode] = useState('track');
  const [_mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section
      className={`${styles.hero} ${isVisible ? styles.visible : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Cart Pattern Background - animates diagonally */}
      <CartPatternBackground className={styles.cartPatternBg} />

      {/* Animated SVG Background Pattern */}
      <div className={styles.backgroundPattern}>
        <svg
          className={styles.patternSvg}
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient
              id="heroGradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#2d5a87" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0f2744" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8860b" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#daa520" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b8860b" stopOpacity="0.2" />
            </linearGradient>
            <pattern
              id="luxuryPattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              {/* Clean diamond grid pattern */}
              <path
                d="M40 0L80 40L40 80L0 40Z"
                fill="none"
                stroke="rgba(184, 134, 11, 0.15)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#heroGradient1)" />
          <rect
            width="100%"
            height="100%"
            fill="url(#luxuryPattern)"
            className={styles.patternOverlay}
          />

          {/* Corner accents */}
          <g className={styles.cornerElements}>
            <path
              d="M0 0 L150 0 L150 8 L8 8 L8 150 L0 150 Z"
              fill="rgba(184, 134, 11, 0.15)"
            />
            <path
              d="M1440 0 L1290 0 L1290 8 L1432 8 L1432 150 L1440 150 Z"
              fill="rgba(184, 134, 11, 0.15)"
            />
            <path
              d="M0 800 L0 650 L8 650 L8 792 L150 792 L150 800 Z"
              fill="rgba(184, 134, 11, 0.1)"
            />
            <path
              d="M1440 800 L1440 650 L1432 650 L1432 792 L1290 792 L1290 800 Z"
              fill="rgba(184, 134, 11, 0.1)"
            />
          </g>
        </svg>
      </div>

      {/* Main Content - Centered */}
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <CartCommerceLogo className={styles.logo} />

          <div className={styles.badgeContainer}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              Premium E-Commerce Experience
            </span>
          </div>

          <h1 className={styles.headline}>
            <span className={styles.headlineAccent}>Shop</span> Smarter
            <br />
            <span className={styles.headlineMain}>Live Better</span>
          </h1>

          <p className={styles.subheadline}>
            Experience the future of online shopping with curated collections,
            lightning-fast checkout, and exceptional service at every step.
          </p>

          <div className={styles.ctaContainer}>
            <Link href="/products" className={styles.ctaPrimary}>
              <span>Start Shopping</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              className={styles.ctaSecondary}
              onClick={() => scrollToSection('how-it-works')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              <span>See How It Works</span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>4.9/5 Rating</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.trustItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure Checkout</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.trustItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Fast Delivery</span>
            </div>
          </div>

          {/* Scroll indicator - positioned below hero text */}
          <div className={styles.scrollIndicator}>
            <span>Scroll to explore</span>
            <div className={styles.scrollMouse}>
              <div className={styles.scrollWheel} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats - repositioned */}
      <div className={styles.floatingStats}>
        <div className={`${styles.statCard} ${styles.stat1}`}>
          <span className={styles.statNumber}>50K+</span>
          <span className={styles.statLabel}>Happy Customers</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat2}`}>
          <span className={styles.statNumber}>24h</span>
          <span className={styles.statLabel}>Fast Delivery</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat3}`}>
          <span className={styles.statNumber}>
            4.9 <StarFilled size={15} />
          </span>
          <span className={styles.statLabel}>Customer Rating</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat4}`}>
          <span className={styles.statNumber}>100%</span>
          <span className={styles.statLabel}>Secure Payment</span>
        </div>
      </div>

      {/* Interactive Hero Animation Mode Switcher */}
      <HeroAnimationSwitcher
        activeMode={animationMode}
        onSelectMode={setAnimationMode}
      />

      {/* Dynamic Hero Showcase Stage */}
      <div
        className={styles.heroShowcaseStage}
        id={`hero-animation-${animationMode}`}
      >
        {animationMode === 'track' && <CartTrackScene />}

        {animationMode === 'vault' && <VaultAnimation />}

        {animationMode === '3d' && <Isometric3DHero />}

        {animationMode === 'webgl' && <WebGLCosmicHero />}
      </div>

      {/* Bottom fade to white */}
      <div className={styles.bottomFade} />
    </section>
  );
}
