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

/**
 * Princess Penny - Fairytale & Enchanted Kingdoms Guide
 * 100% Vector SVG with golden crown tiara, star wand, flowing locks, and waving hand.
 */
export function PennySvg({ className = '', size = 120 }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Princess Penny Mascot"
    >
      <defs>
        <linearGradient id="pennyGownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="pennyHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="pennyCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="150" rx="38" ry="7" fill="rgba(219, 39, 119, 0.18)" />

      <g className={styles.floatBody}>
        {/* Flowing Royal Hair Behind Head */}
        <path d="M42 60 C30 85 36 125 48 135 C54 125 50 85 54 65 Z" fill="url(#pennyHairGrad)" />
        <path d="M118 60 C130 85 124 125 112 135 C106 125 110 85 106 65 Z" fill="url(#pennyHairGrad)" />

        {/* Royal Gown (Skirt) */}
        <path d="M56 108 L42 144 C42 146 118 146 118 144 L104 108 Z" fill="url(#pennyGownGrad)" stroke="#be185d" strokeWidth="1.5" />
        {/* Gown Lace Frill */}
        <path d="M42 144 Q80 148 118 144" stroke="#ffffff" strokeWidth="2.5" fill="none" />
        <ellipse cx="80" cy="120" rx="8" ry="4" fill="#ffffff" opacity="0.4" />

        {/* Bodice */}
        <path d="M62 90 L60 110 L100 110 L98 90 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" />
        {/* Heart Brooch */}
        <circle cx="80" cy="98" r="4" fill="#be185d" />

        {/* Head */}
        <circle cx="80" cy="65" r="28" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />

        {/* Front Hair Bangs */}
        <path d="M54 58 C62 48 98 48 106 58 C96 52 64 52 54 58 Z" fill="url(#pennyHairGrad)" />

        {/* Expressive Blinking Eyes */}
        <g className={styles.blinkingEyes}>
          <ellipse cx="70" cy="64" rx="5.5" ry="7" fill="#1e293b" />
          <circle cx="72" cy="62" r="2" fill="#ffffff" />
          <circle cx="69" cy="66" r="1" fill="#ffffff" />

          <ellipse cx="90" cy="64" rx="5.5" ry="7" fill="#1e293b" />
          <circle cx="92" cy="62" r="2" fill="#ffffff" />
          <circle cx="89" cy="66" r="1" fill="#ffffff" />
        </g>

        {/* Rosy Cheeks */}
        <ellipse cx="62" cy="71" rx="4" ry="2.5" fill="#f472b6" opacity="0.7" />
        <ellipse cx="98" cy="71" rx="4" ry="2.5" fill="#f472b6" opacity="0.7" />

        {/* Cute Smile */}
        <path d="M76 73 Q80 77 84 73" stroke="#be185d" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Golden Tiara / Crown */}
        <polygon points="62,44 68,34 74,40 80,30 86,40 92,34 98,44" fill="url(#pennyCrownGrad)" stroke="#b45309" strokeWidth="1.5" />
        {/* Crown Ruby Gem */}
        <circle cx="80" cy="37" r="3" fill="#dc2626" />

        {/* Left Arm Holding Star Magic Wand */}
        <path d="M62 94 Q48 104 54 116" stroke="#fef3c7" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Wand Stick */}
        <line x1="48" y1="126" x2="38" y2="86" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
        {/* Wand Star Head */}
        <polygon points="38,82 41,88 47,88 42,92 44,98 38,94 32,98 34,92 29,88 35,88" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        <circle cx="38" cy="90" r="1.5" fill="#ffffff" />

        {/* Right Arm (Waving Royal Hand) */}
        <g className={styles.wavingArm}>
          <path d="M98 94 Q114 90 120 78" stroke="#fef3c7" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="120" cy="78" r="4" fill="#fef3c7" />
        </g>
      </g>
    </svg>
  );
}

PennySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Dexter The Dino Explorer - Prehistoric & Space Adventure Guide
 * 100% Vector SVG with explorer hat, smiling jaw, tail spikes, and waving claw.
 */
export function DexterSvg({ className = '', size = 120 }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dexter The Dino Explorer Mascot"
    >
      <defs>
        <linearGradient id="dexterSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="dexterHatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="150" rx="42" ry="7" fill="rgba(5, 150, 105, 0.18)" />

      <g className={styles.floatBody}>
        {/* Tail */}
        <path d="M46 124 Q24 130 18 116 Q26 110 44 114 Z" fill="url(#dexterSkinGrad)" />
        {/* Tail Spikes */}
        <polygon points="26,114 30,108 34,115" fill="#facc15" />
        <polygon points="36,116 40,110 44,117" fill="#facc15" />

        {/* Back Dorsal Spikes */}
        <polygon points="44,82 40,74 46,78" fill="#facc15" />
        <polygon points="48,96 44,88 50,92" fill="#facc15" />

        {/* Torso */}
        <path d="M50 88 C50 78 106 78 106 88 L108 136 C108 142 50 142 50 136 Z" fill="url(#dexterSkinGrad)" stroke="#047857" strokeWidth="2" />

        {/* Explorer Utility Vest */}
        <path d="M54 98 L72 98 L70 128 L54 128 Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
        <path d="M88 98 L106 98 L106 128 L90 128 Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
        {/* Light Belly Plate */}
        <ellipse cx="80" cy="120" rx="8" ry="12" fill="#d1fae5" />

        {/* Head / Cute Rounded Dino Snout */}
        <path d="M52 54 C52 38 108 38 114 54 C116 66 112 76 96 78 C80 80 52 74 52 54 Z" fill="url(#dexterSkinGrad)" stroke="#047857" strokeWidth="2" />

        {/* Big Dino Jaw / Smile */}
        <path d="M68 68 Q88 78 108 68" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cute Baby Tooth */}
        <polygon points="86,69 88,74 90,69" fill="#ffffff" />

        {/* Nostril Dots */}
        <circle cx="102" cy="58" r="1.5" fill="#047857" />
        <circle cx="107" cy="58" r="1.5" fill="#047857" />

        {/* Big Curious Blinking Eyes */}
        <g className={styles.blinkingEyes}>
          <ellipse cx="68" cy="48" rx="7" ry="8.5" fill="#1e293b" />
          <circle cx="70" cy="46" r="2.5" fill="#ffffff" />
          <circle cx="67" cy="51" r="1" fill="#ffffff" />

          <ellipse cx="90" cy="48" rx="7" ry="8.5" fill="#1e293b" />
          <circle cx="92" cy="46" r="2.5" fill="#ffffff" />
          <circle cx="89" cy="51" r="1" fill="#ffffff" />
        </g>

        {/* Explorer Safari Hat */}
        <ellipse cx="80" cy="38" rx="38" ry="8" fill="url(#dexterHatGrad)" stroke="#92400e" strokeWidth="1.5" />
        <path d="M62 38 C62 24 98 24 98 38 Z" fill="url(#dexterHatGrad)" stroke="#92400e" strokeWidth="1.5" />
        {/* Hat Flashlight / Compass Badge */}
        <circle cx="80" cy="32" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />

        {/* Left Arm Resting on Hip */}
        <path d="M52 102 Q42 110 48 120" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="48" cy="120" r="4" fill="#34d399" />

        {/* Right Arm (Waving Dino Claw) */}
        <g className={styles.wavingPaw}>
          <path d="M106 102 Q122 96 126 86" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="126" cy="86" r="4" fill="#34d399" />
          <circle cx="128" cy="83" r="1.5" fill="#ffffff" />
        </g>

        {/* Feet */}
        <ellipse cx="64" cy="142" rx="10" ry="6" fill="#34d399" stroke="#047857" strokeWidth="1.5" />
        <ellipse cx="96" cy="142" rx="10" ry="6" fill="#34d399" stroke="#047857" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

DexterSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Sparky The Sneaker Hound - Streetwear & Hype Drop Specialist
 * 100% Vector SVG with backward snapback cap, shades, and high-top kick crest.
 */
export function SparkySvg({ className = '', size = 120 }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sparky The Sneaker Hound Mascot"
    >
      <defs>
        <linearGradient id="sparkyFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="sparkyCap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="150" rx="40" ry="7" fill="rgba(220, 38, 38, 0.18)" />

      <g className={styles.floatBody}>
        {/* Floppy Hound Ears */}
        <path d="M48 60 C32 74 34 104 44 108 C48 100 48 80 54 68 Z" fill="#9a3412" />
        <path d="M112 60 C128 74 126 104 116 108 C112 100 112 80 106 68 Z" fill="#9a3412" />

        {/* Torso with Streetwear Hoodie */}
        <path d="M52 98 L48 138 C48 142 112 142 112 138 L108 98 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

        {/* High-Top Sneaker Crest on Chest */}
        <rect x="70" y="112" width="20" height="12" rx="3" fill="#dc2626" />
        <rect x="68" y="122" width="24" height="4" rx="1" fill="#ffffff" />
        <circle cx="80" cy="116" r="2" fill="#ffffff" />

        {/* Hound Head */}
        <circle cx="80" cy="68" r="30" fill="url(#sparkyFur)" stroke="#9a3412" strokeWidth="2" />

        {/* Muzzle */}
        <ellipse cx="80" cy="78" rx="16" ry="11" fill="#ffedd5" />
        <ellipse cx="80" cy="73" rx="6" ry="4" fill="#0f172a" />
        <path d="M80 77 L80 82 M76 82 Q80 86 84 82" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

        {/* Cool Streetwear Shades / Visor */}
        <rect x="52" y="54" width="26" height="16" rx="4" fill="#0f172a" />
        <rect x="82" y="54" width="26" height="16" rx="4" fill="#0f172a" />
        <line x1="78" y1="60" x2="82" y2="60" stroke="#0f172a" strokeWidth="3" />
        {/* Shades Reflections */}
        <line x1="56" y1="58" x2="68" y2="66" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
        <line x1="86" y1="58" x2="98" y2="66" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />

        {/* Backward Snapback Cap */}
        <path d="M54 54 C54 36 106 36 106 54 Z" fill="url(#sparkyCap)" stroke="#7f1d1d" strokeWidth="2" />
        {/* Backward Cap Brim */}
        <ellipse cx="80" cy="38" rx="16" ry="5" fill="#991b1b" />

        {/* Left Arm */}
        <path d="M52 106 Q40 116 46 128" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="128" r="4" fill="#ea580c" />

        {/* Right Arm (Waving Paw with Wristband) */}
        <g className={styles.wavingPaw}>
          <path d="M108 106 Q122 100 126 90" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="126" cy="90" r="5" fill="#ea580c" />
          {/* Gold Wristband */}
          <rect x="116" y="94" width="6" height="4" rx="1" fill="#facc15" />
        </g>

        {/* Paws Base */}
        <ellipse cx="68" cy="142" rx="8" ry="5" fill="#ea580c" />
        <ellipse cx="92" cy="142" rx="8" ry="5" fill="#ea580c" />
      </g>
    </svg>
  );
}

SparkySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

