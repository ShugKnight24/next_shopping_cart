import { useMascot } from '../../context/MascotProvider';
import { CinematicVideoPlayer } from './CinematicVideoPlayer';
import { SparklesIcon } from '../Icons';
import styles from './KidsStudioVideoTour.module.css';

const STUDIO_TOUR_CHAPTERS = [
  {
    timestamp: 0,
    title: 'From Digital Canvas to Print Proof',
    desc: 'Custom Typography & Real-Time Color Profile Rendering',
    fact: 'Every book begins right here in our interactive studio, configured to exact 300-DPI press standards!',
  },
  {
    timestamp: 25,
    title: 'Artisan Giclée Pigment Printing',
    desc: '12-Color Archival Pigments on 250gsm Sustainable Cotton Rag',
    fact: 'We use museum-grade mineral pigment inks tested to maintain vivid colors for more than 100 years without fading!',
  },
  {
    timestamp: 50,
    title: 'Hand-Sewn Smythed Hardcover Binding',
    desc: 'Traditional Section-Sewn Signatures with Lay-Flat Spine',
    fact: 'Each chapter is hand-bound with high-tensile cotton thread so your child can open every page flat on the bed!',
  },
  {
    timestamp: 75,
    title: '24k Gold Foil Stamping & Heirloom Presentation',
    desc: 'Heated Brass Dies & Embossed Keepsake Gift Boxes',
    fact: 'Our heated stamping press presses genuine gold foil directly into the hardcover at 300°F for a timeless royal shine!',
  },
];

export function KidsStudioVideoTour() {
  const { currentCompanion } = useMascot();

  return (
    <section className={styles.tourSection} aria-label="Behind the scenes bookmaking workshop tour">
      <div className={styles.tourHeader}>
        <div className={styles.badgeRow}>
          <span className={styles.atelierBadge}>
            <SparklesIcon size={14} />
            <span>Behind The Print Atelier</span>
          </span>
        </div>
        <h2 className={styles.tourTitle}>The Making of a Keepsake Heirloom</h2>
        <p className={styles.tourSubtitle}>
          Watch how our master bookbinders and craftspeople transform your child's story into a museum-quality
          hardcover book bound to last generations.
        </p>
      </div>

      <div className={styles.playerWrapper}>
        <CinematicVideoPlayer
          title="The Artisan Atelier | Storybook Craft Tour"
          subtitle="Behind The Scenes in our Oregon & Vermont Print Bindery"
          duration={90}
          chapters={STUDIO_TOUR_CHAPTERS}
          accentColor="#f59e0b"
          renderOverlay={({ activeChapter }) => (
            <div className={styles.mascotDialogueOverlay}>
              <div className={styles.mascotSpeechBubble}>
                <div className={styles.bubbleSpeakerRow}>
                  <span className={styles.speakerAvatar}>
                    {currentCompanion?.name?.split(' ')[0] || 'Leo'}
                  </span>
                  <span className={styles.speakerRole}>Studio Guide Fact:</span>
                </div>
                <p className={styles.bubbleText}>{activeChapter?.fact}</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Craft Pillars */}
      <div className={styles.craftPillarsGrid}>
        <div className={styles.craftCard}>
          <div className={styles.craftCardIcon}>1</div>
          <strong className={styles.craftCardHeading}>100% Archival Paper</strong>
          <p className={styles.craftCardDesc}>
            FSC-certified acid-free cotton paper prevents yellowing or brittleness over decades.
          </p>
        </div>

        <div className={styles.craftCard}>
          <div className={styles.craftCardIcon}>2</div>
          <strong className={styles.craftCardHeading}>Reinforced Stitching</strong>
          <p className={styles.craftCardDesc}>
            Durable casebound hardcover with cloth spine reinforcement withstands curious little hands.
          </p>
        </div>

        <div className={styles.craftCard}>
          <div className={styles.craftCardIcon}>3</div>
          <strong className={styles.craftCardHeading}>Non-Toxic Inks</strong>
          <p className={styles.craftCardDesc}>
            Eco-friendly, odorless vegetable-based inks safe for bedtime reading and toddler snuggles.
          </p>
        </div>
      </div>
    </section>
  );
}
