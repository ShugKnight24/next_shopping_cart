import PropTypes from 'prop-types';
import styles from './MascotArtwork.module.css';

/**
 * Carty The Courier - Anthropomorphic Courier Robot
 * 100% Vector SVG with animated visor eyes, pulsing beacon antenna, and waving arm.
 */
export function CartySvg({ className = '', size = 120 }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Carty The Courier Mascot"
    >
      <defs>
        <radialGradient id="cartyHeadGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cartyChassis" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="cartyAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="cartyVisor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="cartyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="150" rx="42" ry="7" fill="rgba(15, 23, 42, 0.15)" />

      {/* Floating Body / Chassis */}
      <g className={styles.floatBody}>
        {/* Antenna Pole & Beacon */}
        <line x1="80" y1="42" x2="80" y2="22" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="18" r="7" fill="url(#cartyAccent)" />
        <circle cx="80" cy="18" r="11" fill="url(#cartyHeadGlow)" className={styles.pulseBeacon} />

        {/* Head Pod */}
        <rect x="42" y="36" width="76" height="58" rx="20" fill="url(#cartyChassis)" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Head Side Accents (Ears/Sensors) */}
        <rect x="36" y="52" width="6" height="24" rx="3" fill="url(#cartyAccent)" />
        <rect x="118" y="52" width="6" height="24" rx="3" fill="url(#cartyAccent)" />

        {/* Visor Screen */}
        <rect x="48" y="44" width="64" height="42" rx="14" fill="url(#cartyVisor)" stroke="#334155" strokeWidth="1.5" />

        {/* Visor Glowing Eyes (Animated Blink) */}
        <g className={styles.blinkingEyes} filter="url(#cartyGlow)">
          <ellipse cx="64" cy="62" rx="7" ry="9" fill="#38bdf8" />
          <circle cx="66" cy="59" r="2.5" fill="#ffffff" />
          <ellipse cx="96" cy="62" rx="7" ry="9" fill="#38bdf8" />
          <circle cx="98" cy="59" r="2.5" fill="#ffffff" />
        </g>

        {/* Visor Friendly Smile */}
        <path d="M72 74 Q80 80 88 74" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Neck Joint */}
        <rect x="73" y="93" width="14" height="6" rx="2" fill="#64748b" />

        {/* Torso */}
        <rect x="48" y="98" width="64" height="38" rx="14" fill="url(#cartyChassis)" stroke="#94a3b8" strokeWidth="2.5" />

        {/* Courier Package Pouch / Chest Pocket */}
        <rect x="58" y="105" width="44" height="22" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M68 111 L80 120 L92 111" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="80" cy="116" r="3" fill="#2563eb" />

        {/* Left Arm (Resting on Hip) */}
        <path d="M48 106 Q34 114 42 126" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="43" cy="126" r="4" fill="url(#cartyAccent)" />

        {/* Right Arm (Waving Hand Animated) */}
        <g className={styles.wavingArm}>
          <path d="M112 106 Q124 100 128 88" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="129" cy="86" r="5" fill="url(#cartyAccent)" />
        </g>

        {/* Twin Base Hover Thrusters */}
        <ellipse cx="64" cy="138" rx="10" ry="4" fill="#64748b" />
        <ellipse cx="96" cy="138" rx="10" ry="4" fill="#64748b" />
        <path d="M58 140 Q64 146 70 140" fill="#38bdf8" opacity="0.8" />
        <path d="M90 140 Q96 146 102 140" fill="#38bdf8" opacity="0.8" />
      </g>
    </svg>
  );
}

CartySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Leo The Story Lion - Anthropomorphic Lion Cub Companion
 * 100% Vector SVG with soft mane, painter's beret, blinking eyes, and waving paw.
 */
export function LeoSvg({ className = '', size = 120 }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Leo The Story Lion Mascot"
    >
      <defs>
        <radialGradient id="leoManeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="leoSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id="leoBeretGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="150" rx="38" ry="7" fill="rgba(180, 83, 9, 0.18)" />

      <g className={styles.floatBody}>
        {/* Soft Lion Mane Fluff */}
        <circle cx="80" cy="68" r="46" fill="url(#leoManeGrad)" />
        {/* Mane Tuft Accents */}
        <circle cx="48" cy="46" r="14" fill="#d97706" />
        <circle cx="112" cy="46" r="14" fill="#d97706" />
        <circle cx="40" cy="74" r="14" fill="#b45309" />
        <circle cx="120" cy="74" r="14" fill="#b45309" />
        <circle cx="54" cy="98" r="12" fill="#b45309" />
        <circle cx="106" cy="98" r="12" fill="#b45309" />

        {/* Ears */}
        <circle cx="50" cy="38" r="12" fill="#f59e0b" />
        <circle cx="50" cy="38" r="7" fill="#f472b6" />
        <circle cx="110" cy="38" r="12" fill="#f59e0b" />
        <circle cx="110" cy="38" r="7" fill="#f472b6" />

        {/* Cub Head */}
        <circle cx="80" cy="72" r="34" fill="url(#leoSkinGrad)" stroke="#f59e0b" strokeWidth="2" />

        {/* Painter's Beret (Creative Flair) */}
        <ellipse cx="64" cy="36" rx="20" ry="10" fill="url(#leoBeretGrad)" transform="rotate(-15 64 36)" />
        <circle cx="58" cy="26" r="3" fill="#b91c1c" />

        {/* Expressive Big Eyes (Animated Blink) */}
        <g className={styles.blinkingEyes}>
          {/* Left Eye */}
          <ellipse cx="68" cy="68" rx="6.5" ry="8" fill="#1e293b" />
          <circle cx="70" cy="65" r="2.5" fill="#ffffff" />
          <circle cx="66" cy="71" r="1" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="92" cy="68" rx="6.5" ry="8" fill="#1e293b" />
          <circle cx="94" cy="65" r="2.5" fill="#ffffff" />
          <circle cx="90" cy="71" r="1" fill="#ffffff" />
        </g>

        {/* Snout / Muzzle */}
        <ellipse cx="80" cy="80" rx="14" ry="10" fill="#fffbeb" />
        {/* Nose */}
        <polygon points="76,75 84,75 80,80" fill="#78350f" />
        {/* Mouth */}
        <path d="M76 82 Q80 86 84 82" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Whisker Dots */}
        <circle cx="73" cy="81" r="1" fill="#b45309" />
        <circle cx="71" cy="83" r="1" fill="#b45309" />
        <circle cx="87" cy="81" r="1" fill="#b45309" />
        <circle cx="89" cy="83" r="1" fill="#b45309" />

        {/* Rosy Cheeks */}
        <ellipse cx="58" cy="77" rx="5" ry="3" fill="#f472b6" opacity="0.6" />
        <ellipse cx="102" cy="77" rx="5" ry="3" fill="#f472b6" opacity="0.6" />

        {/* Torso */}
        <path d="M60 106 C60 98 100 98 100 106 L104 138 C104 142 56 142 56 138 Z" fill="url(#leoSkinGrad)" stroke="#f59e0b" strokeWidth="2" />
        {/* Belly Patch */}
        <ellipse cx="80" cy="122" rx="14" ry="14" fill="#fffbeb" />

        {/* Left Arm Holding Wooden Palette / Paintbrush */}
        <path d="M60 110 Q46 118 52 130" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="52" cy="130" r="5" fill="#fcd34d" />
        {/* Paintbrush Tip */}
        <line x1="48" y1="126" x2="38" y2="114" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 114 Q35 110 39 108 Q43 112 38 114 Z" fill="#3b82f6" />

        {/* Right Arm (Waving Paw Animated) */}
        <g className={styles.wavingPaw}>
          <path d="M100 110 Q116 104 122 94" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="122" cy="94" r="6" fill="#fcd34d" />
          <circle cx="122" cy="94" r="3" fill="#f472b6" />
        </g>

        {/* Paws Base */}
        <ellipse cx="68" cy="142" rx="8" ry="5" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5" />
        <ellipse cx="92" cy="142" rx="8" ry="5" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

LeoSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};
