import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  HeadphonesIcon,
  LaptopIcon,
  SmartphoneIcon,
  WatchIcon,
} from '../Icons';
import { AnimatedCart } from './AnimatedCart';
import styles from './Hero.module.css';

// Product shelf items that will jump into the cart
const shelfProducts = [
  {
    id: 1,
    icon: 'headphones',
    color: '#8b5cf6',
    label: 'Headphones',
    delay: 2.2,
  },
  {
    id: 2,
    icon: 'smartphone',
    color: '#3b82f6',
    label: 'Smartphone',
    delay: 2.8,
  },
  { id: 3, icon: 'watch', color: '#10b981', label: 'Smart Watch', delay: 3.4 },
  { id: 4, icon: 'laptop', color: '#f59e0b', label: 'Laptop', delay: 4.0 },
];

// Get icon component by name
function getProductIcon(iconName, size = 24) {
  const icons = {
    headphones: <HeadphonesIcon size={size} />,
    smartphone: <SmartphoneIcon size={size} />,
    watch: <WatchIcon size={size} />,
    laptop: <LaptopIcon size={size} />,
  };
  return icons[iconName];
}

// Scroll to section helper
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Premium Cart Commerce Logo - Realistic cart with text inside basket
function CartCommerceLogo({ className }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Realistic metal gradients */}
          <linearGradient
            id="logoMetalGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#c0c0c0" />
            <stop offset="20%" stopColor="#e8e8e8" />
            <stop offset="40%" stopColor="#f5f5f5" />
            <stop offset="60%" stopColor="#d8d8d8" />
            <stop offset="80%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#909090" />
          </linearGradient>
          <linearGradient id="logoMetalDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#808080" />
            <stop offset="50%" stopColor="#606060" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
          <linearGradient
            id="logoHandleGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#606060" />
            <stop offset="50%" stopColor="#909090" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
          <linearGradient
            id="logoWheelGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#505050" />
            <stop offset="50%" stopColor="#707070" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
          <linearGradient id="logoTextGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#daa520" />
            <stop offset="50%" stopColor="#f4d03f" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="3" dy="5" stdDeviation="8" floodOpacity="0.4" />
          </filter>
          <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.5"
            />
          </filter>
        </defs>

        {/* Shopping Cart - Centered, realistic design */}
        <g filter="url(#logoShadow)" transform="translate(50, 10)">
          {/* Cart basket - trapezoidal wire basket */}
          <path
            d="M25 30 L35 110 L165 110 L175 30 Z"
            fill="url(#logoMetalGradient)"
            stroke="url(#logoMetalDark)"
            strokeWidth="3"
          />

          {/* Wire mesh pattern */}
          <g stroke="#a0a0a0" strokeWidth="1" opacity="0.5">
            <line x1="30" y1="50" x2="170" y2="50" />
            <line x1="32" y1="70" x2="168" y2="70" />
            <line x1="34" y1="90" x2="166" y2="90" />
            <line x1="60" y1="32" x2="56" y2="108" />
            <line x1="100" y1="30" x2="100" y2="110" />
            <line x1="140" y1="32" x2="144" y2="108" />
          </g>

          {/* Top rim */}
          <path
            d="M20 30 L180 30"
            stroke="url(#logoHandleGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Handle */}
          <path
            d="M18 30 L5 12"
            stroke="url(#logoHandleGradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M5 12 L-8 12"
            stroke="#505050"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M5 12 L-8 12"
            stroke="#707070"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Cart frame legs */}
          <path
            d="M35 110 L42 140"
            stroke="url(#logoMetalDark)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M165 110 L158 140"
            stroke="url(#logoMetalDark)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M42 135 L158 135"
            stroke="url(#logoMetalDark)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Wheels */}
          <circle cx="48" cy="150" r="10" fill="url(#logoWheelGradient)" />
          <circle cx="48" cy="150" r="6" fill="#606060" />
          <circle cx="48" cy="150" r="3" fill="#808080" />
          <circle cx="152" cy="150" r="10" fill="url(#logoWheelGradient)" />
          <circle cx="152" cy="150" r="6" fill="#606060" />
          <circle cx="152" cy="150" r="3" fill="#808080" />
        </g>

        {/* Text INSIDE the cart basket */}
        <g filter="url(#textShadow)" transform="translate(50, 10)">
          <text
            x="100"
            y="62"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            fontSize="28"
            fontWeight="800"
            fill="#ffffff"
            textAnchor="middle"
            letterSpacing="-1"
          >
            Cart
          </text>
          <text
            x="100"
            y="92"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            fontSize="20"
            fontWeight="500"
            fill="url(#logoTextGold)"
            textAnchor="middle"
            letterSpacing="2"
          >
            Commerce
          </text>
        </g>

        {/* Tagline below cart */}
        <text
          x="150"
          y="175"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="10"
          fontWeight="500"
          fill="rgba(255,255,255,0.7)"
          textAnchor="middle"
          letterSpacing="3"
        >
          PREMIUM SHOPPING EXPERIENCE
        </text>
      </svg>
    </div>
  );
}

// Cart Pattern Background Component
function CartPatternBackground({ className }) {
  return (
    <div className={className}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="cartPattern"
            x="0"
            y="0"
            width="120"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Mini cart silhouette */}
            <g
              opacity="0.15"
              fill="none"
              stroke="rgba(218, 165, 32, 1)"
              strokeWidth="2"
            >
              {/* Basket */}
              <path d="M20 25 L25 55 L75 55 L80 25 Z" />
              {/* Rim */}
              <path d="M18 25 L82 25" strokeWidth="2" />
              {/* Handle */}
              <path d="M15 25 L8 15 L3 15" />
              {/* Wheels */}
              <circle cx="32" cy="62" r="5" />
              <circle cx="68" cy="62" r="5" />
            </g>
          </pattern>
        </defs>
        <rect
          width="200%"
          height="200%"
          fill="url(#cartPattern)"
          className={styles.cartPatternRect}
        />
      </svg>
    </div>
  );
}

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
          <span className={styles.statNumber}>4.9★</span>
          <span className={styles.statLabel}>Customer Rating</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat4}`}>
          <span className={styles.statNumber}>100%</span>
          <span className={styles.statLabel}>Secure Payment</span>
        </div>
      </div>

      {/* Cart Track Section with Product Shelves */}
      <div className={styles.cartTrackSection}>
        {/* Product Shelves - Items that jump into cart */}
        <div className={styles.productShelves}>
          {shelfProducts.map((product, index) => (
            <div
              key={product.id}
              className={`${styles.shelfItem} ${styles[`shelfItem${index + 1}`]}`}
              style={{
                '--jump-delay': `${product.delay}s`,
                '--item-color': product.color,
              }}
            >
              <div className={styles.shelfProduct}>
                <div
                  className={styles.productIconWrapper}
                  style={{ backgroundColor: product.color }}
                >
                  {getProductIcon(product.icon, 32)}
                </div>
                <span className={styles.productLabel}>{product.label}</span>
              </div>
              <div className={styles.shelf}>
                <div className={styles.shelfTop} />
                <div className={styles.shelfFront} />
              </div>
            </div>
          ))}
        </div>

        {/* Track line */}
        <div className={styles.cartTrack}>
          <svg
            viewBox="0 0 1440 20"
            preserveAspectRatio="none"
            className={styles.trackSvg}
          >
            <defs>
              <linearGradient
                id="trackGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="rgba(184, 134, 11, 0.3)" />
                <stop offset="50%" stopColor="rgba(218, 165, 32, 0.5)" />
                <stop offset="80%" stopColor="rgba(184, 134, 11, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="10"
              x2="1440"
              y2="10"
              stroke="url(#trackGradient)"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Animated Cart on the track */}
        <div className={styles.cartOnTrack}>
          <AnimatedCart className={styles.animatedCart} />
        </div>

        {/* Checkout Register - Cart destination */}
        <div className={styles.checkoutRegister}>
          <svg
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="registerBody"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#daa520" />
                <stop offset="50%" stopColor="#b8860b" />
                <stop offset="100%" stopColor="#8b6914" />
              </linearGradient>
              <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Register body */}
            <rect
              x="10"
              y="30"
              width="100"
              height="60"
              rx="6"
              fill="url(#registerBody)"
            />
            {/* Screen */}
            <rect
              x="20"
              y="40"
              width="50"
              height="30"
              rx="3"
              fill="url(#screenGlow)"
            />
            {/* Screen content - dollar sign */}
            <text
              x="45"
              y="62"
              fontSize="20"
              fontWeight="bold"
              fill="#fff"
              textAnchor="middle"
            >
              $
            </text>
            {/* Keypad area */}
            <rect x="75" y="40" width="28" height="40" rx="2" fill="#2d5a87" />
            {/* Keypad buttons */}
            <g fill="#ffffff" opacity="0.8">
              <rect x="78" y="44" width="6" height="5" rx="1" />
              <rect x="86" y="44" width="6" height="5" rx="1" />
              <rect x="94" y="44" width="6" height="5" rx="1" />
              <rect x="78" y="52" width="6" height="5" rx="1" />
              <rect x="86" y="52" width="6" height="5" rx="1" />
              <rect x="94" y="52" width="6" height="5" rx="1" />
              <rect x="78" y="60" width="6" height="5" rx="1" />
              <rect x="86" y="60" width="6" height="5" rx="1" />
              <rect x="94" y="60" width="6" height="5" rx="1" />
            </g>
            {/* Card reader slot */}
            <rect x="75" y="70" width="28" height="6" rx="1" fill="#1e3a5f" />
            {/* Checkout label */}
            <text
              x="60"
              y="22"
              fontSize="10"
              fontWeight="bold"
              fill="#daa520"
              textAnchor="middle"
            >
              CHECKOUT
            </text>
          </svg>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className={styles.bottomFade} />
    </section>
  );
}
