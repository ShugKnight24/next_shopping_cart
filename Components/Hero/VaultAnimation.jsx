import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

/**
 * VaultAnimation
 *
 * 2D vector animation in the matching luxury commerce style.
 * Features an animated iris security vault, laser scanning beams,
 * and levitating holographic luxury items (Sneaker, MTG Card, Guitar, Barbell).
 */
export function VaultAnimation({ className }) {
  const [activeItem, setActiveItem] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${styles.vaultContainer} ${className || ''}`.trim()}>
      <svg
        viewBox="0 0 600 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.vaultSvg}
        aria-label="Luxury vault showcase animation"
      >
        <defs>
          {/* Gold gradients */}
          <linearGradient id="vaultGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#daa520" />
            <stop offset="50%" stopColor="#f4d03f" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>

          <linearGradient id="vaultNavy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="50%" stopColor="#142c4a" />
            <stop offset="100%" stopColor="#0a1829" />
          </linearGradient>

          <radialGradient id="vaultCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#daa520" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="scannerBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Card Hologram Gradient */}
          <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#daa520" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>

          <filter id="vaultGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="300" cy="190" r="150" fill="url(#vaultCoreGlow)" />

        {/* Base Pedestal & Cylindrical Vault Structure */}
        <g className={styles.vaultStructure}>
          {/* Base shadow */}
          <ellipse cx="300" cy="335" rx="200" ry="24" fill="rgba(0,0,0,0.35)" />

          {/* Lower Stage Tier */}
          <path
            d="M120 310 L180 340 L420 340 L480 310 Z"
            fill="url(#vaultNavy)"
            stroke="url(#vaultGold)"
            strokeWidth="2"
          />

          {/* Stage Front Rim */}
          <ellipse
            cx="300"
            cy="310"
            rx="180"
            ry="22"
            fill="#0f2744"
            stroke="rgba(218,165,32,0.4)"
            strokeWidth="2"
          />

          {/* Concentric Energy Rings */}
          <ellipse
            cx="300"
            cy="310"
            rx="150"
            ry="18"
            fill="none"
            stroke="url(#vaultGold)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            className={styles.spinRingSlow}
          />
          <ellipse
            cx="300"
            cy="310"
            rx="120"
            ry="14"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={styles.spinRingReverse}
          />

          {/* Cylindrical Portal Pillars */}
          <path
            d="M130 310 L130 90 Q145 80 160 90 L160 310 Z"
            fill="url(#vaultNavy)"
            stroke="rgba(218,165,32,0.6)"
            strokeWidth="2"
          />
          <path
            d="M440 310 L440 90 Q455 80 470 90 L470 310 Z"
            fill="url(#vaultNavy)"
            stroke="rgba(218,165,32,0.6)"
            strokeWidth="2"
          />

          {/* Top Arch Rim */}
          <path
            d="M130 90 Q300 20 470 90"
            fill="none"
            stroke="url(#vaultGold)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M160 100 Q300 35 440 100"
            fill="none"
            stroke="rgba(56, 189, 248, 0.5)"
            strokeWidth="2"
          />
        </g>

        {/* Vault Core Hologram Generator */}
        <g className={styles.hologramCore}>
          {/* Vertical Containment Beam */}
          <rect
            x="200"
            y="70"
            width="200"
            height="240"
            fill="url(#scannerBeam)"
            opacity="0.25"
            className={styles.containmentBeam}
          />

          {/* Horizontal Scanner Laser sweeping up/down */}
          <line
            x1="180"
            y1="190"
            x2="420"
            y2="190"
            stroke="#38bdf8"
            strokeWidth="3"
            filter="url(#vaultGlow)"
            className={styles.scanningLaser}
          />

          {/* Levitating Centerpiece Items */}
          {/* Item 0: Air Jordan Sneaker Silhouette */}
          <g
            className={`${styles.vaultItem} ${activeItem === 0 ? styles.vaultItemActive : ''}`}
            transform="translate(240, 130)"
          >
            {/* Sneaker Outline SVG */}
            <path
              d="M15 65 L40 65 Q70 65 90 55 L105 45 Q115 35 110 20 L105 10 Q100 0 85 5 L65 15 L50 25 L30 40 L10 48 Q0 52 5 62 Q8 65 15 65 Z"
              fill="url(#vaultGold)"
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#vaultGlow)"
            />
            {/* Swoosh Accent */}
            <path
              d="M35 52 Q60 52 80 35 Q55 42 40 45 Z"
              fill="#1e3a5f"
            />
            <text x="60" y="85" textAnchor="middle" fill="#daa520" fontSize="11" fontWeight="700" letterSpacing="1">
              AIR JORDAN 1
            </text>
          </g>

          {/* Item 1: MTG Black Lotus Foil Card */}
          <g
            className={`${styles.vaultItem} ${activeItem === 1 ? styles.vaultItemActive : ''}`}
            transform="translate(260, 110)"
          >
            <rect
              x="0"
              y="0"
              width="80"
              height="115"
              rx="6"
              fill="url(#holoGradient)"
              stroke="url(#vaultGold)"
              strokeWidth="2"
              filter="url(#vaultGlow)"
            />
            <rect x="8" y="8" width="64" height="60" rx="3" fill="#0f2744" opacity="0.8" />
            {/* Lotus Blossom */}
            <path
              d="M40 30 C30 15 20 35 40 50 C60 35 50 15 40 30 Z"
              fill="#b8860b"
            />
            <circle cx="40" cy="38" r="4" fill="#38bdf8" />
            <text x="40" y="90" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
              BLACK LOTUS
            </text>
            <text x="40" y="103" textAnchor="middle" fill="#daa520" fontSize="8" fontWeight="600">
              ALPHA 9.5
            </text>
          </g>

          {/* Item 2: Custom Shop Stratocaster Guitar */}
          <g
            className={`${styles.vaultItem} ${activeItem === 2 ? styles.vaultItemActive : ''}`}
            transform="translate(250, 100)"
          >
            {/* Guitar Body */}
            <path
              d="M50 140 C25 140 20 115 35 95 C25 80 35 60 50 70 L50 20 L58 20 L58 70 C75 60 85 80 75 95 C90 115 85 140 60 140 Z"
              fill="url(#vaultGold)"
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#vaultGlow)"
            />
            {/* Guitar Neck */}
            <rect x="52" y="5" width="4" height="65" fill="#ffffff" />
            <text x="54" y="155" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">
              FENDER '60S STRAT
            </text>
          </g>

          {/* Item 3: Olympic Barbell & Weights */}
          <g
            className={`${styles.vaultItem} ${activeItem === 3 ? styles.vaultItemActive : ''}`}
            transform="translate(230, 130)"
          >
            {/* Barbell Bar */}
            <rect x="0" y="28" width="140" height="6" rx="2" fill="#ffffff" filter="url(#vaultGlow)" />
            {/* Outer Plates Left */}
            <rect x="18" y="5" width="8" height="52" rx="3" fill="url(#vaultGold)" stroke="#ffffff" strokeWidth="1" />
            <rect x="28" y="12" width="6" height="38" rx="2" fill="#38bdf8" />
            {/* Outer Plates Right */}
            <rect x="106" y="12" width="6" height="38" rx="2" fill="#38bdf8" />
            <rect x="114" y="5" width="8" height="52" rx="3" fill="url(#vaultGold)" stroke="#ffffff" strokeWidth="1" />
            <text x="70" y="80" textAnchor="middle" fill="#daa520" fontSize="10" fontWeight="700">
              ROGUE OHIO BAR (20KG)
            </text>
          </g>
        </g>

        {/* Floating Quantum Particles */}
        <g className={styles.vaultParticles}>
          <circle cx="210" cy="160" r="2.5" fill="#daa520" className={styles.particleP1} />
          <circle cx="390" cy="140" r="2" fill="#38bdf8" className={styles.particleP2} />
          <circle cx="280" cy="90" r="1.5" fill="#ffffff" className={styles.particleP3} />
          <circle cx="330" cy="220" r="2" fill="#daa520" className={styles.particleP4} />
          <circle cx="230" cy="240" r="1.5" fill="#38bdf8" className={styles.particleP5} />
        </g>

        {/* Telemetry HUD Elements */}
        <g className={styles.vaultHud} opacity="0.75">
          <text x="145" y="120" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="monospace">
            VAULT://SECURE_INDEX
          </text>
          <text x="145" y="132" fill="#38bdf8" fontSize="8" fontFamily="monospace">
            STATUS: AUTHENTICATED
          </text>
          <text x="400" y="120" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="monospace">
            ENCRYPTION: QUANTUM
          </text>
          <text x="400" y="132" fill="#daa520" fontSize="8" fontFamily="monospace">
            TIER: ULTRA_PREMIUM
          </text>
        </g>
      </svg>
    </div>
  );
}
