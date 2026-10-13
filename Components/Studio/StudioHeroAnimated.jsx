import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '../../utils/cartUtils';
import { BoxIcon, ShieldCheckIcon, SparklesIcon, TruckIcon } from '../Icons';
import { CartySvg, FoxSvg, LeoSvg, LunaSvg } from '../Mascot/MascotArtwork';
import { svgDataUrl } from './cast/castRaster';
import { PERSON_PRESETS, personArt } from './cast/castRig';
import styles from './StudioHeroAnimated.module.css';
import {
  StudioBookOpenSvg,
  StudioMagicWandSvg,
  StudioPaletteSvg,
  StudioQuillSvg,
} from './StudioSVGs';

/**
 * The family at the centre of the stage, drawn by the same cast rig the
 * editors use. Built after mount: the data URLs are tens of kilobytes and
 * do not belong in every server-rendered page.
 */
const familyArt = () =>
  [
    [PERSON_PRESETS.adult, { pose: 'stand', mood: 'soft', prop: 'book' }],
    [
      {
        ...PERSON_PRESETS.kid,
        hair: 'buns',
        hairColor: 'espresso',
        skin: 'caramel',
        topColor: 'mustard',
        pattern: 'stars',
        bottom: 'overalls',
      },
      { pose: 'cheer', mood: 'laugh' },
    ],
    [PERSON_PRESETS.toddler, { pose: 'stand', mood: 'grin', prop: 'teddy' }],
  ].map(([person, placement]) => {
    const art = personArt(person, placement);
    // One scale for everyone, so the grown-up is taller than the little one.
    return { src: svgDataUrl(art.svg), height: Math.round(art.height * 0.62) };
  });

export function StudioHeroAnimated({ onExploreWorkstations, onWatchTour }) {
  const [activeSpeech, setActiveSpeech] = useState('finley');
  const [family, setFamily] = useState([]);
  useEffect(() => setFamily(familyArt()), []);

  const MASCOT_QUOTES = {
    leo: "Leo: Let's write an unforgettable hero tale!",
    luna: 'Luna: Every page deserves dazzling colors!',
    finley: 'Finley: Starlight shines brightest in the heart!',
    carty: 'Carty: Packed with heirloom care & love!',
    child: 'Maya: We made ourselves into a storybook!',
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
            {/* The bubbles are visual; this reads the open one aloud. */}
            <p className={styles.srOnly} aria-live="polite">
              {MASCOT_QUOTES[activeSpeech]}
            </p>
            {/* Guide 1: Leo The Story Lion */}
            <button
              type="button"
              className={`${styles.characterGuide} ${styles.mascotLeo}`}
              onMouseEnter={() => setActiveSpeech('leo')}
              onFocus={() => setActiveSpeech('leo')}
              onClick={() => setActiveSpeech('leo')}
              aria-pressed={activeSpeech === 'leo'}
              aria-label="Leo The Story Lion"
              title="Leo The Story Lion"
            >
              {activeSpeech === 'leo' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.leo}
                </div>
              )}
              <LeoSvg size={96} />
            </button>

            {/* Guide 2: Luna The Shepherd */}
            <button
              type="button"
              className={`${styles.characterGuide} ${styles.mascotLuna}`}
              onMouseEnter={() => setActiveSpeech('luna')}
              onFocus={() => setActiveSpeech('luna')}
              onClick={() => setActiveSpeech('luna')}
              aria-pressed={activeSpeech === 'luna'}
              aria-label="Luna The Cosmic Shepherd"
              title="Luna The Cosmic Shepherd"
            >
              {activeSpeech === 'luna' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.luna}
                </div>
              )}
              <LunaSvg size={102} />
            </button>

            {/* Central Star: The Child Avatar seated with glowing book */}
            <button
              type="button"
              className={`${styles.characterGuide} ${styles.childHero}`}
              onMouseEnter={() => setActiveSpeech('child')}
              onFocus={() => setActiveSpeech('child')}
              onClick={() => setActiveSpeech('child')}
              aria-pressed={activeSpeech === 'child'}
              aria-label="Hero Child Creator"
              title="Hero Child Creator"
            >
              {activeSpeech === 'child' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.child}
                </div>
              )}
              <div
                className={styles.castFamily}
                role="img"
                aria-label="A family made in the studio: a grown-up reading, a kid cheering and a little one with a teddy"
              >
                {family.map(({ src, height }, i) => (
                  <img
                    // Fixed order and length: the index is a stable key.
                    key={i}
                    src={src}
                    alt=""
                    style={{ '--h': `${height}px` }}
                    draggable={false}
                  />
                ))}
              </div>
            </button>

            {/* Guide 3: Finley The Starlight Fox */}
            <button
              type="button"
              className={`${styles.characterGuide} ${styles.mascotFinley}`}
              onMouseEnter={() => setActiveSpeech('finley')}
              onFocus={() => setActiveSpeech('finley')}
              onClick={() => setActiveSpeech('finley')}
              aria-pressed={activeSpeech === 'finley'}
              aria-label="Finley The Starlight Fox"
              title="Finley The Starlight Fox"
            >
              {activeSpeech === 'finley' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.finley}
                </div>
              )}
              <FoxSvg size={98} />
            </button>

            {/* Guide 4: Carty The Courier */}
            <button
              type="button"
              className={`${styles.characterGuide} ${styles.mascotCarty}`}
              onMouseEnter={() => setActiveSpeech('carty')}
              onFocus={() => setActiveSpeech('carty')}
              onClick={() => setActiveSpeech('carty')}
              aria-pressed={activeSpeech === 'carty'}
              aria-label="Carty The Courier"
              title="Carty The Courier"
            >
              {activeSpeech === 'carty' && (
                <div className={styles.characterBubble}>
                  {MASCOT_QUOTES.carty}
                </div>
              )}
              <CartySvg size={96} />
            </button>
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
            <span>Free Shipping Over ${FREE_SHIPPING_THRESHOLD}</span>
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
