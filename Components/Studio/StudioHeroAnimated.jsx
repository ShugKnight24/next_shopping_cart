import PropTypes from 'prop-types';
import { useState } from 'react';
import { BoxIcon, ShieldCheckIcon, SparklesIcon, TruckIcon } from '../Icons';
import { CartySvg, FoxSvg, LeoSvg, LunaSvg } from '../Mascot/MascotArtwork';
import styles from './StudioHeroAnimated.module.css';
import {
  StudioBookOpenSvg,
  StudioMagicWandSvg,
  StudioPaletteSvg,
  StudioQuillSvg,
} from './StudioSVGs';

export function StudioHeroAnimated({ onExploreWorkstations, onWatchTour }) {
  const [activeSpeech, setActiveSpeech] = useState('finley');

  const MASCOT_QUOTES = {
    leo: "Leo: Let's write an unforgettable hero tale!",
    luna: 'Luna: Every page deserves dazzling colors!',
    finley: 'Finley: Starlight shines brightest in the heart!',
    carty: 'Carty: Packed with heirloom care & love!',
    child: 'Adventurer: Look, I created my own book!',
  };

  return (
    <section className={styles.heroContainer} aria-label="Studio Workshop Hero">
      {/* Starlight Ambient Glow Backdrop */}
      <div className={styles.ambientBackdrop}>
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
      </div>

      <div className={styles.heroContent}>
        {/* Eyebrow Badge */}
        <div className={styles.heroBadge}>
          <SparklesIcon size={14} />
          <span>Interactive Web-to-Print Workshop</span>
        </div>

        {/* Hero Title and Subtitle */}
        <h1 className={styles.heroTitle}>The Custom Creation Studio</h1>

        <p className={styles.heroSubtitle}>
          Create one-of-a-kind personalized keepsakes for your children and
          home. Preview each page in real time and stamp custom emblems before
          we print and bind your heirloom.
        </p>

        {/* Primary and Secondary Call to Action Buttons */}
        <div className={styles.heroCtaRow}>
          <a
            href="#studio-workstations"
            className={styles.primaryCta}
            onClick={(e) => {
              if (onExploreWorkstations) {
                e.preventDefault();
                onExploreWorkstations();
              }
            }}
          >
            <StudioBookOpenSvg size={18} />
            <span>Start Creating Your Heirloom</span>
          </a>

          <a
            href="#video-tour"
            className={styles.secondaryCta}
            onClick={(e) => {
              if (onWatchTour) {
                e.preventDefault();
                onWatchTour();
              }
            }}
          >
            <span>Watch Artisan Workshop Tour →</span>
          </a>
        </div>

        {/* ANIMATED INTERACTIVE WORKSHOP STAGE */}
        <div className={styles.stageWrapper}>
          {/* Floating Craft Tools */}
          <div
            className={`${styles.floatingTool} ${styles.quillTool}`}
            title="Golden Craft Quill"
          >
            <StudioQuillSvg size={32} />
          </div>
          <div
            className={`${styles.floatingTool} ${styles.paletteTool}`}
            title="Artist Palette"
          >
            <StudioPaletteSvg size={30} />
          </div>
          <div
            className={`${styles.floatingTool} ${styles.starTool}`}
            title="Starlight Wand"
          >
            <StudioMagicWandSvg size={30} />
          </div>
          <div
            className={`${styles.floatingTool} ${styles.giftTool}`}
            title="Heirloom Binding"
          >
            <BoxIcon size={28} />
          </div>

          {/* Drafting Table Glow */}
          <div className={styles.draftingDeskGlow} />

          {/* Mascots Guiding the Child Avatar */}
          <div className={styles.mascotScene}>
            {/* Guide 1: Leo The Story Lion */}
            <div
              className={`${styles.characterGuide} ${styles.mascotLeo}`}
              onMouseEnter={() => setActiveSpeech('leo')}
              onClick={() => setActiveSpeech('leo')}
              title="Leo The Story Lion"
            >
              {activeSpeech === 'leo' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.leo}
                </div>
              )}
              <LeoSvg size={96} />
            </div>

            {/* Guide 2: Luna The Shepherd */}
            <div
              className={`${styles.characterGuide} ${styles.mascotLuna}`}
              onMouseEnter={() => setActiveSpeech('luna')}
              onClick={() => setActiveSpeech('luna')}
              title="Luna The Cosmic Shepherd"
            >
              {activeSpeech === 'luna' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.luna}
                </div>
              )}
              <LunaSvg size={102} />
            </div>

            {/* Central Star: The Child Avatar seated with glowing book */}
            <div
              className={`${styles.characterGuide} ${styles.childHero}`}
              onMouseEnter={() => setActiveSpeech('child')}
              onClick={() => setActiveSpeech('child')}
              title="Hero Child Creator"
            >
              {activeSpeech === 'child' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.child}
                </div>
              )}
              <svg
                width="112"
                height="112"
                viewBox="0 0 120 120"
                fill="none"
                role="img"
                aria-label="Child Hero Creator"
              >
                {/* Child character silhouette and glowing open book */}
                <ellipse
                  cx="60"
                  cy="110"
                  rx="42"
                  ry="8"
                  fill="rgba(15, 23, 42, 0.4)"
                />
                {/* Torso & Green/Navy Explorer Outfit */}
                <path
                  d="M42 75 C40 68 46 60 60 60 C74 60 80 68 78 75 L82 105 L38 105 Z"
                  fill="#2563eb"
                />
                {/* Arms holding the book */}
                <path
                  d="M38 75 Q46 88 56 86"
                  stroke="#fed7aa"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M82 75 Q74 88 64 86"
                  stroke="#fed7aa"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Head / Face */}
                <circle cx="60" cy="42" r="18" fill="#fed7aa" />
                {/* Cheerful Eyes & Smile */}
                <circle cx="54" cy="40" r="2.2" fill="#1e293b" />
                <circle cx="66" cy="40" r="2.2" fill="#1e293b" />
                <path
                  d="M55 48 Q60 53 65 48"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="50" cy="46" r="3" fill="rgba(244, 63, 94, 0.4)" />
                <circle cx="70" cy="46" r="3" fill="rgba(244, 63, 94, 0.4)" />
                {/* Hair - Playful curls */}
                <path
                  d="M42 36 C42 22 78 20 78 36 C78 30 72 26 60 26 C48 26 42 30 42 36 Z"
                  fill="#78350f"
                />
                <circle cx="44" cy="30" r="6" fill="#78350f" />
                <circle cx="76" cy="30" r="6" fill="#78350f" />
                <circle cx="60" cy="24" r="7" fill="#78350f" />
                {/* Open Storybook on desk */}
                <path
                  d="M44 92 L60 86 L76 92 L74 104 L60 98 L46 104 Z"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                <path d="M60 86 L60 98" stroke="#3b82f6" strokeWidth="2" />
                {/* Starlight sparkles rising from book */}
                <circle cx="56" cy="80" r="2" fill="#fbbf24" />
                <circle cx="64" cy="76" r="2.5" fill="#38bdf8" />
                <circle cx="60" cy="72" r="1.5" fill="#f43f5e" />
              </svg>
            </div>

            {/* Guide 3: Finley The Starlight Fox */}
            <div
              className={`${styles.characterGuide} ${styles.mascotFinley}`}
              onMouseEnter={() => setActiveSpeech('finley')}
              onClick={() => setActiveSpeech('finley')}
              title="Finley The Starlight Fox"
            >
              {activeSpeech === 'finley' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.finley}
                </div>
              )}
              <FoxSvg size={98} />
            </div>

            {/* Guide 4: Carty The Courier */}
            <div
              className={`${styles.characterGuide} ${styles.mascotCarty}`}
              onMouseEnter={() => setActiveSpeech('carty')}
              onClick={() => setActiveSpeech('carty')}
              title="Carty The Courier"
            >
              {activeSpeech === 'carty' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.carty}
                </div>
              )}
              <CartySvg size={96} />
            </div>
          </div>

          {/* Drafting Table Front Edge */}
          <div className={styles.draftingDesk} />

          {/* Studio Feature Chips */}
          <div className={styles.badgeStrip}>
            <div className={styles.sceneBadge}>
              <SparklesIcon size={14} />
              <span>Live 60 FPS Canvas Proofing</span>
            </div>
            <div className={styles.sceneBadge}>
              <StudioBookOpenSvg size={14} />
              <span>32-Page Hardcover Keepsakes</span>
            </div>
            <div className={styles.sceneBadge}>
              <ShieldCheckIcon size={14} />
              <span>100% Happiness Proof Guarantee</span>
            </div>
          </div>
        </div>

        {/* Workshop Trust Pillars */}
        <div className={styles.trustPillars}>
          <div className={styles.pillar}>
            <ShieldCheckIcon size={18} />
            <span>Handcrafted & Bound in the USA</span>
          </div>
          <div className={styles.pillar}>
            <BoxIcon size={18} />
            <span>FSC-Certified Archival Papers</span>
          </div>
          <div className={styles.pillar}>
            <TruckIcon size={18} />
            <span>Free Express Shipping Over $150</span>
          </div>
        </div>
      </div>
    </section>
  );
}

StudioHeroAnimated.propTypes = {
  onExploreWorkstations: PropTypes.func,
  onWatchTour: PropTypes.func,
};
