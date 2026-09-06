import Link from 'next/link';
import { HorizontalRule } from '../Components/HorizontalRule';
import { PaymentMethods } from '../Components/PaymentMethods';
import { SocialIcons } from '../Components/SocialIcons';
import styles from './Footer.module.css';
import { Logo } from './Logo';

const currentYear = new Date().getFullYear();

// Shopping Cart SVG Icon for attribution
function ShoppingCartIcon({ id = 'left' }) {
  return (
    <svg
      viewBox="0 0 32 44"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.cartSvg}
    >
      {/* Cart handle */}
      <path
        className={styles.cartHandle}
        d="M8 4 L8 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        className={styles.cartRing}
        cx="8"
        cy="3"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Cart body */}
      <path
        className={styles.cartBody}
        d="M2 12 L6 12 L9 32 L26 32 L30 12 L10 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Cart inner glow */}
      <path
        className={styles.cartGlow}
        d="M8 14 L8 30 L24 30 L27 14 Z"
        fill={`url(#cartGlow${id})`}
      />

      {/* Items in cart */}
      <g className={styles.cartItems}>
        <rect
          className={styles.cartItem1}
          x="11"
          y="18"
          width="6"
          height="8"
          rx="1"
          fill="currentColor"
          opacity="0.3"
        />
        <rect
          className={styles.cartItem2}
          x="19"
          y="20"
          width="5"
          height="6"
          rx="1"
          fill="currentColor"
          opacity="0.25"
        />
        <circle
          className={styles.cartItem3}
          cx="14"
          cy="16"
          r="2"
          fill="currentColor"
          opacity="0.2"
        />
      </g>

      {/* Sparkle/shine effect */}
      <g className={styles.cartSparkle}>
        <path
          d="M22 10 L22 8 M20 9 L24 9"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Cart wheels with spokes for visible rotation */}
      <g className={styles.cartWheel} style={{ transformOrigin: '12px 36px' }}>
        <circle
          cx="12"
          cy="36"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="12"
          y1="33"
          x2="12"
          y2="39"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <line
          x1="9"
          y1="36"
          x2="15"
          y2="36"
          stroke="currentColor"
          strokeWidth="0.75"
        />
      </g>
      <g className={styles.cartWheel} style={{ transformOrigin: '23px 36px' }}>
        <circle
          cx="23"
          cy="36"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="23"
          y1="33"
          x2="23"
          y2="39"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <line
          x1="20"
          y1="36"
          x2="26"
          y2="36"
          stroke="currentColor"
          strokeWidth="0.75"
        />
      </g>

      {/* Price tag hanging */}
      <g className={styles.priceTag}>
        <path
          d="M26 16 L30 12 L30 20 L26 16"
          fill="currentColor"
          opacity="0.4"
        />
        <circle cx="28" cy="14" r="1" fill="currentColor" opacity="0.6" />
      </g>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id={`cartGlow${id}`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#daa520" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#daa520" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#daa520" stopOpacity="0.05" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Gift Box SVG for center
function GiftBoxIcon() {
  return (
    <svg
      viewBox="0 0 32 44"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.giftSvg}
    >
      {/* Ribbon loop top */}
      <path
        className={styles.ribbonLoop}
        d="M16 2 Q12 2 12 6 Q12 10 16 12 Q20 10 20 6 Q20 2 16 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Box lid */}
      <rect
        className={styles.boxLid}
        x="4"
        y="12"
        width="24"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.9"
      />

      {/* Box body */}
      <rect
        className={styles.boxBody}
        x="6"
        y="18"
        width="20"
        height="18"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Box inner glow */}
      <rect
        className={styles.boxGlow}
        x="7"
        y="19"
        width="18"
        height="16"
        rx="1"
        fill="url(#giftGlow)"
      />

      {/* Vertical ribbon */}
      <path
        className={styles.ribbonVertical}
        d="M16 12 L16 36"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Horizontal ribbon */}
      <path
        className={styles.ribbonHorizontal}
        d="M6 27 L26 27"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Bow center */}
      <circle
        className={styles.bowCenter}
        cx="16"
        cy="12"
        r="2"
        fill="currentColor"
      />

      {/* Sparkles */}
      <g className={styles.giftSparkles}>
        <circle cx="10" cy="22" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="22" cy="32" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="12" cy="30" r="0.8" fill="currentColor" opacity="0.25" />
      </g>

      {/* Ribbon tails */}
      <path
        className={styles.ribbonTails}
        d="M14 36 L12 42 M18 36 L20 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="giftGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#daa520" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#f0c850" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#daa520" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      <footer className={styles.siteFooter}>
        <div className={styles.storeInfo}>
          <div className={styles.storeDescription}>
            <Link href="/" aria-label="Home / Shop">
              <Logo />
            </Link>
            <p>
              Our store provides quality products at their lowest retail prices
            </p>
          </div>
          <div className={styles.storeLinks}>
            <div className={styles.shopping}>
              <h3>Online Shopping</h3>
              <ul>
                <li>
                  <Link href="/products">All Products & Drops</Link>
                </li>
                <li>
                  <Link href="/favorites">Saved Wishlist</Link>
                </li>
                <li>
                  <Link href="/cart">Cart Bag</Link>
                </li>
                <li>
                  <Link href="/checkout">Express Checkout</Link>
                </li>
                <li>
                  <Link href="/sitemap.xml">XML Sitemap</Link>
                </li>
              </ul>
            </div>
            <div className={styles.shopping}>
              <h3>Creation Studios</h3>
              <ul>
                <li>
                  <Link href="/studio">Custom W2P Studio</Link>
                </li>
                <li>
                  <Link href="/studio/social">Social Media Studio</Link>
                </li>
                <li>
                  <Link href="/studio">Personalized Storybooks</Link>
                </li>
                <li>
                  <Link href="/studio">Framed Art Posters</Link>
                </li>
                <li>
                  <Link href="/studio">Custom Apparel & Kicks</Link>
                </li>
              </ul>
            </div>
            <div className={styles.info}>
              <h3>Shop Info</h3>
              <ul>
                <li>
                  <Link href="/">About Our Store</Link>
                </li>
                <li>
                  <Link href="/products">Featured Categories</Link>
                </li>
                <li>
                  <Link href="/checkout">Shipping & Delivery</Link>
                </li>
                <li>
                  <Link href="/checkout">Payment Options</Link>
                </li>
              </ul>
            </div>
            <div className={styles.contact}>
              <h3>Contact</h3>
              <ul>
                <li>
                  <Link href="mailto:customersupport@storename.com">
                    customersupport@storename.com
                  </Link>
                </li>
                <li>
                  <Link href="tel:12345678900">1-234-567-8900</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <HorizontalRule color={'#1173A8'} borderWidth={1} />
        <div className={styles.paymentSocial}>
          <PaymentMethods />
          <SocialIcons />
        </div>
        <HorizontalRule color={'#1173A8'} borderWidth={1} />
        <div className={styles.copyright}>
          Copyright {currentYear} &copy; Shugmi Shumunov All Rights Reserved
        </div>

        {/* Premium Gold Divider */}
        <div className={styles.goldDivider}>
          <span className={styles.dividerLine} />
          <div className={styles.dividerOrnament}>
            <span className={styles.ornamentDot} />
            <span className={styles.ornamentDiamond} />
            <span className={styles.ornamentDot} />
          </div>
          <span className={styles.dividerLine} />
        </div>

        {/* Developer Attribution */}
        <div className={styles.luxAttribution}>
          <p>
            <span className={styles.footerIcon}>
              <ShoppingCartIcon id="left" />
            </span>
            <span className={styles.attributionText}>Crafted with care</span>
            <span className={styles.footerIcon}>
              <GiftBoxIcon />
            </span>
            <span className={styles.attributionText}>Designed by</span>
            <a
              href="https://shumunovsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attributionLink}
            >
              Shumunov Solutions
            </a>
            <span className={styles.footerIcon}>
              <ShoppingCartIcon id="right" />
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
