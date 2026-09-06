import PropTypes from 'prop-types';

/**
 * High-Precision Vector SVG Icon & Illustration Library for Web-to-Print Studio.
 * Eliminates all emojis in favor of crisp, scalable vector artwork.
 */

const baseSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'currentColor',
  stroke: 'none',
};

// ==========================================
// 1. CUTE COMPANIONS / MASCOTS
// ==========================================

export function MascotLunaSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Helmet glow */}
      <circle cx="20" cy="18" r="16" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      <path d="M12 12 Q 20 6 28 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Shepherd ears inside helmet */}
      <ellipse cx="11" cy="14" rx="3.5" ry="6" transform="rotate(-20 11 14)" fill="#b45309" />
      <ellipse cx="29" cy="14" rx="3.5" ry="6" transform="rotate(20 29 14)" fill="#b45309" />
      {/* Fur face */}
      <circle cx="20" cy="19" r="11" fill="#f59e0b" />
      {/* Charcoal muzzle mask */}
      <ellipse cx="20" cy="22" rx="6" ry="5" fill="#292524" />
      {/* Eyes */}
      <circle cx="16.5" cy="17" r="1.8" fill="#78350f" />
      <circle cx="23.5" cy="17" r="1.8" fill="#78350f" />
      <circle cx="17.2" cy="16.5" r="0.7" fill="#ffffff" />
      <circle cx="24.2" cy="16.5" r="0.7" fill="#ffffff" />
      {/* Pink nose blaze */}
      <ellipse cx="20" cy="20.5" rx="1.6" ry="1" fill="#fbcfe8" />
      {/* Nose */}
      <circle cx="20" cy="22" r="1.4" fill="#000000" />
      {/* Spacesuit collar & star */}
      <path d="M10 32 Q 20 37 30 32 L 28 39 Q 20 41 12 39 Z" fill="#0284c7" />
      <polygon points="20,33 21.2,36 24,36.2 21.8,38 22.5,40.8 20,39.2 17.5,40.8 18.2,38 16,36.2 18.8,36" fill="#fbbf24" />
    </svg>
  );
}

export function MascotFinleySvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Fox ears */}
      <polygon points="9,21 6,4 19,13" fill="#ea580c" />
      <polygon points="9,18 8,7 16,14" fill="#ffedd5" />
      <polygon points="31,21 34,4 21,13" fill="#ea580c" />
      <polygon points="31,18 32,7 24,14" fill="#ffedd5" />
      {/* Fox head */}
      <polygon points="7,20 33,20 20,34" fill="#ea580c" />
      {/* White cheeks */}
      <polygon points="7,20 16,24 20,33 13,29" fill="#fff7ed" />
      <polygon points="33,20 24,24 20,33 27,29" fill="#fff7ed" />
      {/* Fox Eyes */}
      <ellipse cx="15" cy="18" rx="2" ry="1.4" transform="rotate(-15 15 18)" fill="#1c1917" />
      <ellipse cx="25" cy="18" rx="2" ry="1.4" transform="rotate(15 25 18)" fill="#1c1917" />
      {/* Nose */}
      <circle cx="20" cy="31.5" r="1.5" fill="#0f172a" />
      {/* Blue starry scarf */}
      <rect x="12" y="33" width="16" height="6" rx="3" fill="#0284c7" />
      <polygon points="24,36 29,40 27,41 23,37" fill="#0369a1" />
      <circle cx="16" cy="36" r="1" fill="#fde047" />
    </svg>
  );
}

export function MascotLeoSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Sunburst lion mane */}
      <circle cx="20" cy="20" r="16" fill="#d97706" />
      {/* Mane scallops */}
      <path
        d="M20 3 Q 23 7 26 4 Q 29 8 33 6 Q 34 11 38 11 Q 37 16 40 19 Q 37 22 39 26 Q 35 28 35 32 Q 30 33 28 37 Q 24 35 20 38 Q 16 35 12 37 Q 10 33 5 32 Q 5 28 1 26 Q 3 22 0 19 Q 3 16 2 11 Q 6 11 7 6 Q 11 8 14 4 Z"
        fill="#b45309"
      />
      {/* Lion face */}
      <circle cx="20" cy="20" r="11" fill="#fcd34d" />
      {/* Ears */}
      <circle cx="12" cy="11" r="3" fill="#d97706" />
      <circle cx="28" cy="11" r="3" fill="#d97706" />
      <circle cx="12" cy="11" r="1.6" fill="#fef3c7" />
      <circle cx="28" cy="11" r="1.6" fill="#fef3c7" />
      {/* Red artist beret */}
      <ellipse cx="17" cy="9" rx="8" ry="3.5" transform="rotate(-15 17 9)" fill="#dc2626" />
      <rect x="15" y="4.5" width="1.5" height="2.5" fill="#991b1b" />
      {/* Eyes */}
      <circle cx="16" cy="19" r="1.8" fill="#451a03" />
      <circle cx="24" cy="19" r="1.8" fill="#451a03" />
      {/* Muzzle */}
      <ellipse cx="20" cy="23.5" rx="5" ry="3.5" fill="#fffbeb" />
      <polygon points="18.5,22 21.5,22 20,24" fill="#92400e" />
      <path d="M18 24.5 Q 19 26 20 25 Q 21 26 22 24.5" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function MascotPennySvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Golden curls background */}
      <circle cx="12" cy="17" r="7" fill="#fde047" />
      <circle cx="28" cy="17" r="7" fill="#fde047" />
      <circle cx="20" cy="12" r="10" fill="#fde047" />
      {/* Princess Face */}
      <circle cx="20" cy="21" r="9.5" fill="#fed7aa" />
      {/* Cheeks */}
      <circle cx="15" cy="23.5" r="2.2" fill="#f472b6" opacity="0.6" />
      <circle cx="25" cy="23.5" r="2.2" fill="#f472b6" opacity="0.6" />
      {/* Eyes */}
      <ellipse cx="16.5" cy="19" rx="1.6" ry="2" fill="#0369a1" />
      <ellipse cx="23.5" cy="19" rx="1.6" ry="2" fill="#0369a1" />
      <circle cx="17" cy="18.5" r="0.6" fill="#ffffff" />
      <circle cx="24" cy="18.5" r="0.6" fill="#ffffff" />
      {/* Smile */}
      <path d="M18 24 Q 20 26 22 24" stroke="#e11d48" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Tiara */}
      <polygon points="12,14 15,7 20,11 25,7 28,14" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <circle cx="20" cy="8" r="1.5" fill="#ec4899" />
      {/* Royal gown collar */}
      <path d="M12 30 Q 20 35 28 30 L 31 39 L 9 39 Z" fill="#ec4899" />
    </svg>
  );
}

export function MascotDexterSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Back dino crest spines */}
      <polygon points="14,9 18,3 21,9" fill="#047857" />
      <polygon points="21,7 25,2 28,8" fill="#047857" />
      {/* Dino head */}
      <ellipse cx="20" cy="20" rx="12" ry="10" fill="#10b981" />
      <path d="M13 22 Q 8 23 9 27 Q 15 31 22 28" fill="#34d399" />
      {/* Dino nose nostrils */}
      <circle cx="11" cy="25" r="1.2" fill="#065f46" />
      {/* Explorer Spectacles */}
      <circle cx="17" cy="18" r="4.2" fill="rgba(255,255,255,0.7)" stroke="#d97706" strokeWidth="1.6" />
      <circle cx="26" cy="18" r="4.2" fill="rgba(255,255,255,0.7)" stroke="#d97706" strokeWidth="1.6" />
      <line x1="21.2" y1="18" x2="21.8" y2="18" stroke="#d97706" strokeWidth="1.6" />
      {/* Friendly pupil */}
      <circle cx="17" cy="18" r="1.8" fill="#064e3b" />
      <circle cx="26" cy="18" r="1.8" fill="#064e3b" />
      {/* Pith safari tie */}
      <polygon points="17,30 20,38 23,30" fill="#f59e0b" />
    </svg>
  );
}

export function MascotCartySvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Robot Antenna */}
      <line x1="20" y1="4" x2="20" y2="9" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="4" r="2.2" fill="#38bdf8" />
      {/* Cart robot basket / head */}
      <rect x="8" y="9" width="24" height="19" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Visor display */}
      <rect x="11" y="12" width="18" height="9" rx="2.5" fill="#0284c7" />
      {/* Glowing friendly eyes */}
      <circle cx="16" cy="16.5" r="2.2" fill="#38bdf8" />
      <circle cx="24" cy="16.5" r="2.2" fill="#38bdf8" />
      {/* Wireframe basket pattern */}
      <line x1="12" y1="24" x2="28" y2="24" stroke="#475569" strokeWidth="1.2" />
      <line x1="16" y1="21" x2="16" y2="28" stroke="#475569" strokeWidth="1.2" />
      <line x1="24" y1="21" x2="24" y2="28" stroke="#475569" strokeWidth="1.2" />
      {/* Chassis & Wheels */}
      <rect x="11" y="29" width="18" height="3" rx="1.5" fill="#64748b" />
      <circle cx="14" cy="34" r="3.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="26" cy="34" r="3.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

export function MascotSparkySvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Little dragon horns */}
      <polygon points="12,12 11,4 17,10" fill="#f59e0b" />
      <polygon points="28,12 29,4 23,10" fill="#f59e0b" />
      {/* Emerald head */}
      <circle cx="20" cy="19" r="11" fill="#059669" />
      {/* Snout */}
      <ellipse cx="20" cy="24" rx="7" ry="5" fill="#34d399" />
      <circle cx="18" cy="23" r="1" fill="#065f46" />
      <circle cx="22" cy="23" r="1" fill="#065f46" />
      {/* Cute eyes */}
      <circle cx="16" cy="17" r="2.2" fill="#1e1b4b" />
      <circle cx="24" cy="17" r="2.2" fill="#1e1b4b" />
      <circle cx="16.7" cy="16.3" r="0.8" fill="#ffffff" />
      <circle cx="24.7" cy="16.3" r="0.8" fill="#ffffff" />
      {/* Tiny fire puff */}
      <path d="M21 27 Q 25 32 23 35 Q 21 34 20 37 Q 19 33 21 27 Z" fill="#f97316" />
      <circle cx="21.5" cy="33" r="1.5" fill="#fde047" />
      {/* Wings */}
      <path d="M7 16 Q 1 12 4 21 Q 8 20 9 17 Z" fill="#f59e0b" />
      <path d="M33 16 Q 39 12 36 21 Q 32 20 31 17 Z" fill="#f59e0b" />
    </svg>
  );
}

// ==========================================
// 2. STORY BADGES & CRESTS
// ==========================================

export function BadgeHeroSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Ornate Gold Shield */}
      <path
        d="M20 3 L34 8 C34 22 28 32 20 37 C12 32 6 22 6 8 Z"
        fill="#1e1b4b"
        stroke="#f59e0b"
        strokeWidth="2.5"
      />
      <path
        d="M20 6 L31 10 C31 20 26 29 20 33 C14 29 9 20 9 10 Z"
        fill="#1e293b"
      />
      {/* Golden Star in center */}
      <polygon
        points="20,11 22.8,17.2 29.5,17.6 24.3,21.8 26,28.4 20,24.6 14,28.4 15.7,21.8 10.5,17.6 17.2,17.2"
        fill="#fbbf24"
        stroke="#d97706"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function BadgeBraveSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Scalloped Gold & Ruby Medal */}
      <circle cx="20" cy="20" r="16" fill="#e11d48" stroke="#fde047" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="12" fill="#881337" />
      {/* Courage Heart in center */}
      <path
        d="M20 26 C20 26 13 21 13 16 C13 13.5 15 12 17 12 C18.5 12 19.5 13 20 14 C20.5 13 21.5 12 23 12 C25 12 27 13.5 27 16 C27 21 20 26 20 26 Z"
        fill="#f43f5e"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {/* Laurel leaves */}
      <path d="M8 20 Q 9 28 20 30" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 20 Q 31 28 20 30" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BadgeStarlightSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Deep Navy Astrological Roundel */}
      <circle cx="20" cy="20" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />
      {/* Four-point Starlight */}
      <path d="M20 8 Q 20 20 8 20 Q 20 20 20 32 Q 20 20 32 20 Q 20 20 20 8 Z" fill="#38bdf8" />
      <circle cx="20" cy="20" r="2" fill="#ffffff" />
      {/* Tiny constellation dots */}
      <circle cx="14" cy="13" r="1.2" fill="#fde047" />
      <circle cx="26" cy="27" r="1.2" fill="#fde047" />
    </svg>
  );
}

export function BadgeCertifiedSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Ribbon tails */}
      <polygon points="14,28 10,38 17,34 20,38 18,28" fill="#b45309" />
      <polygon points="26,28 30,38 23,34 20,38 22,28" fill="#92400e" />
      {/* Wax / Gold Seal */}
      <circle cx="20" cy="18" r="13" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      <circle cx="20" cy="18" r="10" fill="#fbbf24" />
      {/* Verification Checkmark */}
      <polyline points="15,18 18.5,21.5 25,14" fill="none" stroke="#1e1b4b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BadgeDinoScoutSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Scout diamond / rounded shield */}
      <path d="M20 4 L34 14 L28 34 L12 34 L6 14 Z" fill="#065f46" stroke="#fbbf24" strokeWidth="2" />
      {/* Dinosaur Paw Print */}
      <ellipse cx="20" cy="24" rx="4.5" ry="3.5" fill="#fef08a" />
      <ellipse cx="14" cy="17" rx="1.8" ry="3" transform="rotate(-25 14 17)" fill="#fef08a" />
      <ellipse cx="20" cy="15" rx="1.8" ry="3" fill="#fef08a" />
      <ellipse cx="26" cy="17" rx="1.8" ry="3" transform="rotate(25 26 17)" fill="#fef08a" />
    </svg>
  );
}

// ==========================================
// 3. STORY PROPS & WONDERS
// ==========================================

export function BubblePropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Comic dialogue speech bubble with pointer tail */}
      <path
        d="M8 8 C8 8 7 8 7 14 L7 22 C7 26 10 28 15 28 L17 28 L14 34 L23 28 L31 28 C36 28 38 26 38 21 L38 14 C38 8 36 8 31 8 Z"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Text lines indicator */}
      <line x1="14" y1="15" x2="31" y2="15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="25" y2="20" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function RosePropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Glass Bell Jar Dome */}
      <path d="M12 33 L12 18 C12 10 16 6 20 6 C24 6 28 10 28 18 L28 33 Z" fill="rgba(224, 242, 254, 0.4)" stroke="#38bdf8" strokeWidth="1.6" />
      <rect x="9" y="33" width="22" height="4" rx="2" fill="#78350f" />
      {/* Glowing Prince Rose */}
      <path d="M20 28 Q 19 24 20 18" stroke="#15803d" strokeWidth="2" fill="none" />
      <ellipse cx="17" cy="23" rx="2.5" ry="1.2" transform="rotate(-30 17 23)" fill="#22c55e" />
      <circle cx="20" cy="16" r="4.2" fill="#e11d48" />
      <circle cx="19" cy="15" r="2.5" fill="#f43f5e" />
      <circle cx="20" cy="14" r="1.2" fill="#fda4af" />
    </svg>
  );
}

export function CompassPropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Top ring */}
      <circle cx="20" cy="5" r="3.5" stroke="#d97706" strokeWidth="2" fill="none" />
      {/* Brass casing */}
      <circle cx="20" cy="22" r="15" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" />
      <circle cx="20" cy="22" r="12" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
      {/* Cardinal marks */}
      <line x1="20" y1="11" x2="20" y2="13" stroke="#92400e" strokeWidth="1.5" />
      <line x1="20" y1="31" x2="20" y2="33" stroke="#92400e" strokeWidth="1.5" />
      <line x1="9" y1="22" x2="11" y2="22" stroke="#92400e" strokeWidth="1.5" />
      <line x1="29" y1="22" x2="31" y2="22" stroke="#92400e" strokeWidth="1.5" />
      {/* Magnetic Needles */}
      <polygon points="20,13 22.5,22 17.5,22" fill="#dc2626" />
      <polygon points="20,31 22.5,22 17.5,22" fill="#1e293b" />
      <circle cx="20" cy="22" r="2" fill="#fbbf24" />
    </svg>
  );
}

export function WandPropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Wand shaft */}
      <line x1="8" y1="32" x2="25" y2="15" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="32" x2="14" y2="26" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" />
      {/* Magic Star Top */}
      <polygon
        points="27,6 29.5,12 36,12.5 31,16.5 32.5,23 27,19 21.5,23 23,16.5 18,12.5 24.5,12"
        fill="#fde047"
        stroke="#f59e0b"
        strokeWidth="1.2"
      />
      {/* Sparkles */}
      <circle cx="15" cy="10" r="1.5" fill="#38bdf8" />
      <circle cx="34" cy="27" r="1.2" fill="#c084fc" />
    </svg>
  );
}

export function ChestPropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Treasure chest base */}
      <rect x="7" y="18" width="26" height="15" rx="3" fill="#854d0e" stroke="#ca8a04" strokeWidth="2" />
      {/* Curved Lid */}
      <path d="M7 18 Q 20 8 33 18 Z" fill="#a16207" stroke="#ca8a04" strokeWidth="2" />
      {/* Gold bands & latch */}
      <line x1="13" y1="11" x2="13" y2="33" stroke="#facc15" strokeWidth="2" />
      <line x1="27" y1="11" x2="27" y2="33" stroke="#facc15" strokeWidth="2" />
      <circle cx="20" cy="21" r="2.5" fill="#facc15" />
      {/* Glowing jewels peeking */}
      <circle cx="17" cy="18" r="1.8" fill="#38bdf8" />
      <circle cx="23" cy="18" r="1.8" fill="#ef4444" />
    </svg>
  );
}

export function PlanetPropSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Planet sphere */}
      <circle cx="20" cy="20" r="10" fill="#f59e0b" />
      {/* Surface stripes */}
      <path d="M12 18 Q 20 22 28 18" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M11 22 Q 20 26 29 22" stroke="#b45309" strokeWidth="1.8" fill="none" opacity="0.6" />
      {/* Saturn rings */}
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="6"
        transform="rotate(-25 20 20)"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeDasharray="50 15"
      />
    </svg>
  );
}

// ==========================================
// 4. CLASSIC STAMPS
// ==========================================

export function StarStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <polygon
        points="20,4 24.8,14.5 36,15.5 27.5,23 30.2,34.5 20,28.5 9.8,34.5 12.5,23 4,15.5 15.2,14.5"
        fill="#fbbf24"
        stroke="#d97706"
        strokeWidth="1.5"
      />
      {/* Inner facet facet shading */}
      <polygon points="20,4 20,28.5 30.2,34.5 27.5,23 36,15.5 24.8,14.5" fill="#f59e0b" opacity="0.4" />
    </svg>
  );
}

export function RocketStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Rocket flames */}
      <polygon points="16,30 20,38 24,30" fill="#f97316" />
      <polygon points="18,30 20,35 22,30" fill="#fde047" />
      {/* Fins */}
      <polygon points="13,24 6,28 13,29" fill="#dc2626" />
      <polygon points="27,24 34,28 27,29" fill="#dc2626" />
      {/* Rocket body */}
      <path d="M14 26 L14 18 C14 10 20 4 20 4 C20 4 26 10 26 18 L26 26 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Porthole */}
      <circle cx="20" cy="15" r="3.5" fill="#0284c7" stroke="#e2e8f0" strokeWidth="1.2" />
    </svg>
  );
}

export function CrownStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M8 28 L6 13 L13 18 L20 8 L27 18 L34 13 L32 28 Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="2"
      />
      <rect x="7" y="28" width="26" height="4" rx="1.5" fill="#b45309" />
      {/* Jewels */}
      <circle cx="6" cy="13" r="1.8" fill="#ef4444" />
      <circle cx="20" cy="8" r="2.2" fill="#3b82f6" />
      <circle cx="34" cy="13" r="1.8" fill="#ef4444" />
      <circle cx="20" cy="23" r="2" fill="#ec4899" />
    </svg>
  );
}

export function SneakerStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Sneaker silhouette */}
      <path
        d="M8 22 L14 14 L20 14 L23 19 L32 21 C34 22 35 24 35 26 L8 26 Z"
        fill="#ef4444"
        stroke="#b91c1c"
        strokeWidth="1.5"
      />
      {/* Sole */}
      <rect x="6" y="26" width="30" height="5" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Swoosh / stripe */}
      <path d="M12 21 Q 20 23 28 17" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 3 Q 20 20 3 20 Q 20 20 20 37 Q 20 20 37 20 Q 20 20 20 3 Z"
        fill="#a855f7"
        stroke="#7e22ce"
        strokeWidth="1.2"
      />
      <circle cx="20" cy="20" r="3" fill="#ffffff" />
    </svg>
  );
}

export function HeartStampSvg({ size = 24, className = '' }) {
  return (
    <svg {...baseSvgProps} width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 34 C20 34 7 24.5 7 15.5 C7 10 11.5 6 16.5 6 C18.8 6 20 7.5 20 7.5 C20 7.5 21.2 6 23.5 6 C28.5 6 33 10 33 15.5 C33 24.5 20 34 20 34 Z"
        fill="#f43f5e"
        stroke="#e11d48"
        strokeWidth="1.5"
      />
      {/* Soft highlight */}
      <ellipse cx="14" cy="12" rx="3.5" ry="2" transform="rotate(-30 14 12)" fill="#fda4af" opacity="0.7" />
    </svg>
  );
}

// ==========================================
// 5. STUDIO UI & TOOL ICONS
// ==========================================

export function FullscreenIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function ExitFullscreenIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4v6m0 0h6m-6 0l7-7M10 4v6m0 0H4m6 0L3 3" />
    </svg>
  );
}

export function UndoIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

export function RedoIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  );
}

export function FlipHorizontalIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v18" strokeDasharray="3 3" />
      <polygon points="8,7 2,12 8,17" />
      <polygon points="16,7 22,12 16,17" />
    </svg>
  );
}

export function FlipVerticalIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 12h18" strokeDasharray="3 3" />
      <polygon points="7,8 12,2 17,8" />
      <polygon points="7,16 12,22 17,16" />
    </svg>
  );
}

export function LayerFrontIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function DuplicateIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function TrashIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function BookOpenIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function TemplateToolIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export function SceneBackgroundIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export function TextToolIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

export function EyePreviewIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function AddPageIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

const propTypesCommon = {
  size: PropTypes.number,
  className: PropTypes.string,
};

MascotLunaSvg.propTypes = propTypesCommon;
MascotFinleySvg.propTypes = propTypesCommon;
MascotLeoSvg.propTypes = propTypesCommon;
MascotPennySvg.propTypes = propTypesCommon;
MascotDexterSvg.propTypes = propTypesCommon;
MascotCartySvg.propTypes = propTypesCommon;
MascotSparkySvg.propTypes = propTypesCommon;
BadgeHeroSvg.propTypes = propTypesCommon;
BadgeBraveSvg.propTypes = propTypesCommon;
BadgeStarlightSvg.propTypes = propTypesCommon;
BadgeCertifiedSvg.propTypes = propTypesCommon;
BadgeDinoScoutSvg.propTypes = propTypesCommon;
BubblePropSvg.propTypes = propTypesCommon;
RosePropSvg.propTypes = propTypesCommon;
CompassPropSvg.propTypes = propTypesCommon;
WandPropSvg.propTypes = propTypesCommon;
ChestPropSvg.propTypes = propTypesCommon;
PlanetPropSvg.propTypes = propTypesCommon;
StarStampSvg.propTypes = propTypesCommon;
RocketStampSvg.propTypes = propTypesCommon;
CrownStampSvg.propTypes = propTypesCommon;
SneakerStampSvg.propTypes = propTypesCommon;
SparkleStampSvg.propTypes = propTypesCommon;
HeartStampSvg.propTypes = propTypesCommon;
FullscreenIcon.propTypes = propTypesCommon;
ExitFullscreenIcon.propTypes = propTypesCommon;
UndoIcon.propTypes = propTypesCommon;
RedoIcon.propTypes = propTypesCommon;
FlipHorizontalIcon.propTypes = propTypesCommon;
FlipVerticalIcon.propTypes = propTypesCommon;
LayerFrontIcon.propTypes = propTypesCommon;
DuplicateIcon.propTypes = propTypesCommon;
BookOpenIcon.propTypes = propTypesCommon;
TemplateToolIcon.propTypes = propTypesCommon;
SceneBackgroundIcon.propTypes = propTypesCommon;
TextToolIcon.propTypes = propTypesCommon;
EyePreviewIcon.propTypes = propTypesCommon;
AddPageIcon.propTypes = propTypesCommon;
