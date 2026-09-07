import PropTypes from 'prop-types';
import { useContext } from 'react';
import { BrandContext, BRAND_VARIANTS } from './Brand/BrandContext';

/**
 * Geometric Monogram Mark (Variant A)
 * Interlocking precision dual-arc 'C' monogram forming an architectural cart profile.
 */
function GeometricMark({ uniqueId, isDark }) {
  const goldGradId = `geoGoldGrad_${uniqueId}`;
  const jewelGradId = `geoJewelGrad_${uniqueId}`;
  const navyGradId = `geoNavyGrad_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={jewelGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={navyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#1e293b'} />
          <stop offset="100%" stopColor={isDark ? '#0284c7' : '#0f172a'} />
        </linearGradient>
        <filter id={`geoGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity={isDark ? 0.35 : 0.2} />
        </filter>
      </defs>

      {/* Hex/Arc Badge Contour */}
      <rect
        x="0"
        y="0"
        width="64"
        height="64"
        rx="16"
        fill={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.03)'}
        stroke={isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.25)'}
        strokeWidth="1.2"
      />

      {/* Cart Basket / Monogram Interlock */}
      <g filter={`url(#geoGlow_${uniqueId})`}>
        {/* Handle and Top Rail */}
        <path
          d="M12 18 H20 L27 38 A3 3 0 0 0 29.8 40 H47.5 A3 3 0 0 0 50.4 37.8 L54 23 H23"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Faceted Interlocking Monogram C */}
        <path
          d="M44 26 C41 23.5 36.5 22.5 32 24 C27 25.7 24 30.5 25 35.5 C26 40.5 31 44 36.5 43 C41 42.2 44.5 39.5 46 37"
          fill="none"
          stroke={`url(#${navyGradId})`}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Radiant Sparkle Gem */}
        <path
          d="M36 21 L37.5 26 L42.5 27.5 L37.5 29 L36 34 L34.5 29 L29.5 27.5 L34.5 26 Z"
          fill={`url(#${jewelGradId})`}
        />

        {/* Wheels */}
        <g fill={`url(#${goldGradId})`}>
          <circle cx="28" cy="49" r="4.2" />
          <circle cx="47" cy="49" r="4.2" />
        </g>
        <g fill={isDark ? '#0f172a' : '#ffffff'}>
          <circle cx="28" cy="49" r="1.6" />
          <circle cx="47" cy="49" r="1.6" />
        </g>
      </g>
    </g>
  );
}

GeometricMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * Minimalist Continuous-Line & Starlight Mark (Variant B)
 * Aerodynamic single continuous stroke cart with embedded 8-point radiant starlight jewel.
 */
function MinimalMark({ uniqueId, isDark }) {
  const lineGradId = `minLineGrad_${uniqueId}`;
  const starGradId = `minStarGrad_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#0284c7'} />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={starGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Aerodynamic Continuous Single-Stroke Cart */}
      <path
        d="M10 16 H18 L25.5 39 C26.2 41.5 28.5 43 31.2 43 H48 C50.8 43 53 41.3 53.8 38.7 L58 24 H21"
        fill="none"
        stroke={`url(#${lineGradId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 8-Point Starlight Jewel in Basket */}
      <g transform="translate(37, 28)">
        {/* Cardinal Rays */}
        <polygon
          points="0,-11 2.5,-3 11,0 2.5,3 0,11 -2.5,3 -11,0 -2.5,-3"
          fill={`url(#${starGradId})`}
        />
        {/* Diagonal Micro Rays */}
        <polygon
          points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8"
          fill="#ffffff"
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f59e0b" />
      </g>

      {/* Wheels */}
      <circle
        cx="29"
        cy="51"
        r="4.2"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.8"
      />
      <circle cx="29" cy="51" r="1.4" fill={isDark ? '#38bdf8' : '#0284c7'} />

      <circle
        cx="49"
        cy="51"
        r="4.2"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.8"
      />
      <circle cx="49" cy="51" r="1.4" fill={isDark ? '#38bdf8' : '#0284c7'} />
    </g>
  );
}

MinimalMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * Archival Heritage Crest Mark (Variant C)
 * Hexagonal luxury shield crest with gold filigree cart lattice and star compass.
 */
function CrestMark({ uniqueId, isDark }) {
  const crestGoldId = `crestGold_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={crestGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Hexagonal Shield Outer Rim */}
      <polygon
        points="32,2 58,16 58,46 32,60 6,46 6,16"
        fill={isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.04)'}
        stroke={`url(#${crestGoldId})`}
        strokeWidth="2"
      />

      {/* Inset Double Rule */}
      <polygon
        points="32,6 54,18 54,44 32,56 10,44 10,18"
        fill="none"
        stroke={isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.18)'}
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Navigational Star Compass Crown */}
      <polygon
        points="32,10 34,16 40,18 34,20 32,26 30,20 24,18 30,16"
        fill={`url(#${crestGoldId})`}
      />

      {/* Filigree Archival Cart Body */}
      <path
        d="M17 29 H22 L27 43 H41 L45 32 H24"
        fill="none"
        stroke={isDark ? '#ffffff' : '#0f172a'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal lattice line */}
      <line
        x1="31"
        y1="32"
        x2="33"
        y2="43"
        stroke={`url(#${crestGoldId})`}
        strokeWidth="1.5"
      />
      <line
        x1="38"
        y1="32"
        x2="39"
        y2="43"
        stroke={`url(#${crestGoldId})`}
        strokeWidth="1.5"
      />

      {/* Crest Wheels */}
      <circle cx="27" cy="49" r="3.2" fill={`url(#${crestGoldId})`} />
      <circle cx="41" cy="49" r="3.2" fill={`url(#${crestGoldId})`} />
    </g>
  );
}

CrestMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * Main Logo Component
 * Renders one of the 3 modern brand logo variants.
 * Defaults to the active variant from BrandContext, or explicitly overridden via props.
 */
export function Logo({
  variant: propVariant,
  theme = 'light',
  showSubtitle = true,
  subtitle: customSubtitle,
  className = '',
  size = 'default',
}) {
  const brandContext = useContext(BrandContext);
  const activeVariant =
    propVariant || brandContext?.variant || 'geometric';
  const variantConfig =
    BRAND_VARIANTS[activeVariant] || BRAND_VARIANTS.geometric;

  const isDark = theme === 'dark';
  const subtitleText = customSubtitle || variantConfig.subtitle;
  const uniqueId = `${activeVariant}_${theme}_${size}`;

  // Wordmark typography colors
  const titleColor = isDark ? '#ffffff' : '#0f172a';
  const subtitleColor = isDark ? '#fbbf24' : '#d97706';

  return (
    <svg
      className={`brand-logo-svg brand-variant-${activeVariant} ${className}`.trim()}
      viewBox="0 0 340 76"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Cart Commerce - ${variantConfig.name}`}
      style={{ overflow: 'visible' }}
    >
      <title>{`Cart Commerce - ${variantConfig.name}`}</title>

      {/* Visual Mark per Variant */}
      {activeVariant === 'geometric' && (
        <GeometricMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'minimal' && (
        <MinimalMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'crest' && (
        <CrestMark uniqueId={uniqueId} isDark={isDark} />
      )}

      {/* Wordmark Typography */}
      <g transform="translate(82, 0)">
        {/* Main Title: CART COMMERCE */}
        <text
          x="0"
          y="37"
          fill={titleColor}
          fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif"
          fontSize="22"
          fontWeight="800"
          letterSpacing="0.14em"
        >
          CART COMMERCE
        </text>

        {/* Subtitle / Tagline */}
        {showSubtitle && (
          <text
            x="1"
            y="54"
            fill={subtitleColor}
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.28em"
          >
            {subtitleText}
          </text>
        )}
      </g>
    </svg>
  );
}

Logo.propTypes = {
  variant: PropTypes.oneOf(['geometric', 'minimal', 'crest']),
  theme: PropTypes.oneOf(['light', 'dark', 'auto']),
  showSubtitle: PropTypes.bool,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
};