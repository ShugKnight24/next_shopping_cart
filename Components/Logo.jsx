import PropTypes from 'prop-types';
import { useContext } from 'react';
import { BrandContext, BRAND_VARIANTS } from './Brand/BrandContext';

/**
 * 1. Favicon Badge Mark (Primary / Default)
 * The exact high-contrast sapphire squircle badge, gold shopping cart,
 * and radiant starlight jewel from public/favicon.svg that matches the browser tab.
 */
function FaviconBadgeMark({ uniqueId, isDark }) {
  const navyGradId = `favNavy_${uniqueId}`;
  const goldGradId = `favGold_${uniqueId}`;
  const glowId = `favGlow_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={navyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.5"
            floodColor="#000000"
            floodOpacity={isDark ? 0.6 : 0.35}
          />
        </filter>
      </defs>

      {/* Solid Sapphire Navy Squircle Badge (Direct Favicon Translation) */}
      <rect width="64" height="64" rx="16" fill={`url(#${navyGradId})`} />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        fill="none"
        stroke={`url(#${goldGradId})`}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* High-Precision Cart Emblem with Starlight */}
      <g filter={`url(#${glowId})`}>
        {/* Cart Basket & Handle */}
        <path
          d="M14 19 H21 L26.5 38 A2.5 2.5 0 0 0 28.9 40 H44.5 A2.5 2.5 0 0 0 46.9 38.1 L50 24 H23"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Radiant Starlight Jewel */}
        <polygon
          points="36,22 37.5,25.5 41,27 37.5,28.5 36,32 34.5,28.5 31,27 34.5,25.5"
          fill="#ffffff"
        />
        <polygon
          points="36,24 37,26 39,27 37,28 36,30 35,28 33,27 35,26"
          fill="#fde047"
        />

        {/* Wheels */}
        <circle cx="28.5" cy="48" r="3.5" fill={`url(#${goldGradId})`} />
        <circle cx="28.5" cy="48" r="1.2" fill="#0f172a" />
        <circle cx="44.5" cy="48" r="3.5" fill={`url(#${goldGradId})`} />
        <circle cx="44.5" cy="48" r="1.2" fill="#0f172a" />
      </g>
    </g>
  );
}

FaviconBadgeMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * 2. Floating Cart Mark (Clean / Borderless)
 * The exact cart and starlight jewel from the favicon, but floating cleanly without the squircle box.
 */
function FloatingCartMark({ uniqueId, isDark }) {
  const goldGradId = `floatGold_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Cart Basket & Handle */}
      <path
        d="M12 18 H20 L26 39 A3 3 0 0 0 28.8 41 H46 A3 3 0 0 0 48.8 38.8 L52 23 H22"
        fill="none"
        stroke={isDark ? `url(#${goldGradId})` : '#0f172a'}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radiant Starlight Jewel */}
      <g transform="translate(36, 28)">
        <polygon
          points="0,-11 2.5,-3 11,0 2.5,3 0,11 -2.5,3 -11,0 -2.5,-3"
          fill={`url(#${goldGradId})`}
        />
        <polygon
          points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5"
          fill="#ffffff"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f59e0b" />
      </g>

      {/* Wheels */}
      <circle cx="28.5" cy="49" r="4" fill={`url(#${goldGradId})`} />
      <circle cx="28.5" cy="49" r="1.5" fill={isDark ? '#0f172a' : '#ffffff'} />
      <circle cx="46.5" cy="49" r="4" fill={`url(#${goldGradId})`} />
      <circle cx="46.5" cy="49" r="1.5" fill={isDark ? '#0f172a' : '#ffffff'} />
    </g>
  );
}

FloatingCartMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * 3. Soviet Constructivist Mark
 * Bold geometric poster art: 45° diagonal dynamic, industrial gear wheels, constructivist red star.
 */
function SovietMark({ uniqueId, isDark }) {
  const redGradId = `sovietRed_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={redGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* Constructivist Dynamic Diagonal Wedge Badge */}
      <polygon
        points="0,8 56,0 64,56 8,64"
        fill={isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.08)'}
        stroke={isDark ? '#ef4444' : '#dc2626'}
        strokeWidth="2"
      />

      {/* Inner Accent Line */}
      <line
        x1="6"
        y1="14"
        x2="52"
        y2="6"
        stroke={isDark ? '#ffffff' : '#dc2626'}
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Five-Point Constructivist Star */}
      <polygon
        points="32,9 34.5,16 42,16 36,20.5 38.5,27.5 32,23 25.5,27.5 28,20.5 22,16 29.5,16"
        fill={`url(#${redGradId})`}
        stroke={isDark ? '#ffffff' : '#18181b'}
        strokeWidth="1"
      />

      {/* Angular Constructivist Cart Wagon */}
      <path
        d="M10 28 H20 L27 45 H49 L54 29 H21"
        fill="none"
        stroke={isDark ? '#ffffff' : '#18181b'}
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* Diagonal Internal Strut (Constructivist Truss) */}
      <line
        x1="27"
        y1="45"
        x2="48"
        y2="29"
        stroke={`url(#${redGradId})`}
        strokeWidth="2.5"
      />

      {/* Heavy Industrial Gear Wheels */}
      <circle cx="27" cy="51" r="5" fill={`url(#${redGradId})`} />
      <circle cx="27" cy="51" r="2" fill={isDark ? '#18181b' : '#ffffff'} />
      <rect x="25.5" y="44.5" width="3" height="13" fill={isDark ? '#ffffff' : '#18181b'} />
      <rect x="20.5" y="49.5" width="13" height="3" fill={isDark ? '#ffffff' : '#18181b'} />
      <circle cx="27" cy="51" r="3.2" fill={`url(#${redGradId})`} />

      <circle cx="48" cy="51" r="5" fill={`url(#${redGradId})`} />
      <circle cx="48" cy="51" r="2" fill={isDark ? '#18181b' : '#ffffff'} />
      <rect x="46.5" y="44.5" width="3" height="13" fill={isDark ? '#ffffff' : '#18181b'} />
      <rect x="41.5" y="49.5" width="13" height="3" fill={isDark ? '#ffffff' : '#18181b'} />
      <circle cx="48" cy="51" r="3.2" fill={`url(#${redGradId})`} />
    </g>
  );
}

SovietMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * 4. Dark & Edgy Mark
 * Cyber-industrial streetwear aesthetic: razor-sharp angles, matte obsidian, acid-lime laser slash.
 */
function EdgyMark({ uniqueId, isDark }) {
  const limeColor = '#ccff00';
  const chassisStroke = isDark ? '#ffffff' : '#09090b';

  return (
    <g transform="translate(6, 6)">
      <defs>
        <filter id={`edgyGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={limeColor} floodOpacity={0.6} />
        </filter>
      </defs>

      {/* Stealth Octagonal Shield Frame */}
      <polygon
        points="16,0 48,0 64,16 64,48 48,64 16,64 0,48 0,16"
        fill={isDark ? '#09090b' : '#18181b'}
        stroke={limeColor}
        strokeWidth="1.8"
      />

      {/* Cyber Corner Grid Ticks */}
      <line x1="6" y1="6" x2="14" y2="6" stroke={limeColor} strokeWidth="1.2" />
      <line x1="6" y1="6" x2="6" y2="14" stroke={limeColor} strokeWidth="1.2" />
      <line x1="58" y1="58" x2="50" y2="58" stroke={limeColor} strokeWidth="1.2" />
      <line x1="58" y1="58" x2="58" y2="50" stroke={limeColor} strokeWidth="1.2" />

      {/* Razor-Edge Angular Cart Chassis */}
      <path
        d="M11 18 H20 L27 40 H48 L55 22 H24"
        fill="none"
        stroke={chassisStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />

      {/* High-Voltage Toxic Acid Laser Slash */}
      <g filter={`url(#edgyGlow_${uniqueId})`}>
        <polygon
          points="32,16 41,25 36,27 44,36 30,33 34,29 27,24"
          fill={limeColor}
        />
      </g>

      {/* Dual Turbine Hex-Bolt Wheels */}
      <polygon
        points="28,45 33,48 33,54 28,57 23,54 23,48"
        fill={limeColor}
      />
      <circle cx="28" cy="51" r="2" fill="#09090b" />

      <polygon
        points="48,45 53,48 53,54 48,57 43,54 43,48"
        fill={limeColor}
      />
      <circle cx="48" cy="51" r="2" fill="#09090b" />
    </g>
  );
}

EdgyMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * 5. Lighthearted Pop Mark
 * Playful & bubbly: soft rounded curves, cheerful bounce tilt, warm sunset palette, joy burst.
 */
function LightheartedMark({ uniqueId, isDark }) {
  const popGradId = `popGrad_${uniqueId}`;

  return (
    <g transform="translate(6, 6)">
      <defs>
        <linearGradient id={popGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
      </defs>

      {/* Jaunty Bouncy Tilt Group */}
      <g transform="rotate(-3.5 32 32)">
        {/* Soft Puffy Cloud-Squircle Background */}
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="22"
          fill={isDark ? 'rgba(251, 113, 133, 0.12)' : '#fff1f2'}
          stroke={`url(#${popGradId})`}
          strokeWidth="2"
        />

        {/* Bubbly Joyful Burst springing from the cart */}
        <path
          d="M34 11 Q36 17 41 18 Q36 19 35 25 Q33 19 28 18 Q33 17 34 11 Z"
          fill="#fde047"
          stroke="#f97316"
          strokeWidth="1"
        />
        <circle cx="43" cy="13" r="2" fill="#fb7185" />
        <circle cx="26" cy="14" r="1.5" fill="#f97316" />

        {/* Soft Bubbly Rounded Cart Basket */}
        <path
          d="M13 22 Q18 22 20 25 L26 40 Q28 43 32 43 H46 Q50 43 52 39 L56 26 Q57 23 53 23 H22"
          fill="none"
          stroke={isDark ? '#ffffff' : '#0f172a'}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Motion lines indicating fun speed */}
        <line x1="8" y1="30" x2="13" y2="30" stroke="#fb7185" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="36" x2="14" y2="36" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />

        {/* Plump Balloon Wheels */}
        <circle cx="29" cy="51" r="5" fill={`url(#${popGradId})`} />
        <circle cx="29" cy="51" r="2" fill="#ffffff" />
        <circle cx="48" cy="51" r="5" fill={`url(#${popGradId})`} />
        <circle cx="48" cy="51" r="2" fill="#ffffff" />
      </g>
    </g>
  );
}

LightheartedMark.propTypes = {
  uniqueId: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/**
 * Main Logo Component
 * Renders one of the brand logo variants:
 * - 'favicon' | 'geometric' | 'badge' (Favicon Badge - Default, 100% matched to favicon)
 * - 'floating' (Floating Minimal Cart)
 * - 'soviet' (Soviet Constructivist)
 * - 'edgy' (Dark & Edgy)
 * - 'lighthearted' (Lighthearted Pop)
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

  // Normalize variant name (map legacy or aliases)
  let rawVariant = propVariant || brandContext?.variant || 'geometric';
  if (rawVariant === 'sleek' || rawVariant === 'badge' || rawVariant === 'favicon') {
    rawVariant = 'geometric';
  }

  const activeVariant = BRAND_VARIANTS[rawVariant] ? rawVariant : 'geometric';
  const variantConfig = BRAND_VARIANTS[activeVariant];

  const isDark = theme === 'dark';
  const subtitleText = customSubtitle || variantConfig.subtitle;
  const uniqueId = `${activeVariant}_${theme}_${size}`;

  // Wordmark typography adjustments per aesthetic
  let titleColor = isDark ? '#ffffff' : '#0f172a';
  let subtitleColor = isDark ? '#fbbf24' : '#d97706';
  let titleFontWeight = '800';
  let titleLetterSpacing = '0.14em';
  let subtitleLetterSpacing = '0.24em';

  if (activeVariant === 'soviet') {
    titleColor = isDark ? '#ffffff' : '#18181b';
    subtitleColor = isDark ? '#ef4444' : '#dc2626';
    titleFontWeight = '900';
    titleLetterSpacing = '0.1em';
    subtitleLetterSpacing = '0.2em';
  } else if (activeVariant === 'edgy') {
    titleColor = isDark ? '#ffffff' : '#09090b';
    subtitleColor = '#a3e635';
    titleFontWeight = '900';
    titleLetterSpacing = '0.22em';
    subtitleLetterSpacing = '0.28em';
  } else if (activeVariant === 'lighthearted') {
    titleColor = isDark ? '#ffffff' : '#0f172a';
    subtitleColor = isDark ? '#fb7185' : '#e11d48';
    titleFontWeight = '800';
    titleLetterSpacing = '0.08em';
    subtitleLetterSpacing = '0.18em';
  }

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

      {/* Visual Mark */}
      {activeVariant === 'geometric' && (
        <FaviconBadgeMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'floating' && (
        <FloatingCartMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'soviet' && (
        <SovietMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'edgy' && (
        <EdgyMark uniqueId={uniqueId} isDark={isDark} />
      )}
      {activeVariant === 'lighthearted' && (
        <LightheartedMark uniqueId={uniqueId} isDark={isDark} />
      )}

      {/* Wordmark Typography */}
      <g transform="translate(84, 0)">
        <text
          x="0"
          y="37"
          fill={titleColor}
          fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif"
          fontSize="22"
          fontWeight={titleFontWeight}
          letterSpacing={titleLetterSpacing}
        >
          CART COMMERCE
        </text>

        {showSubtitle && (
          <text
            x="1"
            y="54"
            fill={subtitleColor}
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif"
            fontSize="9"
            fontWeight="700"
            letterSpacing={subtitleLetterSpacing}
          >
            {subtitleText}
          </text>
        )}
      </g>
    </svg>
  );
}

Logo.propTypes = {
  variant: PropTypes.oneOf(['geometric', 'badge', 'favicon', 'sleek', 'floating', 'soviet', 'edgy', 'lighthearted']),
  theme: PropTypes.oneOf(['light', 'dark', 'auto']),
  showSubtitle: PropTypes.bool,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
};