import { useContext } from 'react';
import { trackAddToCart } from '../../analytics/google';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import products from '../../data/products.json';
import { CartIcon, SparklesIcon } from '../Icons';
import { useToast } from '../UI/Toast';
import { CinematicVideoPlayer } from './CinematicVideoPlayer';
import styles from './EcommerceSizzleReel.module.css';

const SIZZLE_CHAPTERS = [
  {
    timestamp: 0,
    title: 'NYC Flagship Concept Tour',
    desc: 'SoHo Concept Space • Sustainable Architecture & Heritage Gallery',
    hotspot: null,
  },
  {
    timestamp: 25,
    title: 'Air Pulse Sneaker Vault',
    desc: 'Limited Archive Footwear • Carbon Fiber Support & Italian Leather',
    hotspot: {
      itemid: 'SNEAKER-01',
      title: 'Air Pulse High Top',
      price: 189,
      category: 'Footwear',
      x: 65,
      y: 42,
    },
  },
  {
    timestamp: 50,
    title: 'Hi-Fi Audio Engineering Lab',
    desc: 'Acoustic Precision • Studio Grade Transducers & Shielded Wiring',
    hotspot: {
      itemid: 'SM57',
      title: 'Shure SM57 Dynamic Mic',
      price: 99,
      category: 'Pro Audio',
      x: 35,
      y: 48,
    },
  },
  {
    timestamp: 75,
    title: 'Luxury Chronograph Workshop',
    desc: 'Mechanical Timepieces • Sapphire Crystal & 316L Stainless Steel',
    hotspot: {
      itemid: 'WATCH-01',
      title: 'Heritage Chronograph',
      price: 349,
      category: 'Timepieces',
      x: 70,
      y: 52,
    },
  },
];

export function EcommerceSizzleReel() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const handleHotspotAdd = (hotspot) => {
    // Find catalog item or craft item
    const catalogItem = products.find((p) => p.itemid === hotspot.itemid) || {
      itemid: hotspot.itemid,
      productName: hotspot.title,
      price: hotspot.price,
      image: '/images/products/featured.png',
      manufacturer: 'Cart Commerce Flagship',
      quantity: 1,
      available: 50,
    };

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: { ...catalogItem, quantity: 1 } },
    });

    trackAddToCart(catalogItem, 1);
    showToast(`"${hotspot.title}" added from the video scene!`, 'success');
    setIsCartOpen(true);
    speak(
      `Nice catch! You just shopped "${hotspot.title}" directly from the reel!`,
      'celebrating'
    );
  };

  return (
    <section
      className={styles.sizzleSection}
      aria-label="Brand Sizzle Reel Showcase"
    >
      <div className={styles.sizzleHeader}>
        <div className={styles.eyebrowBadge}>
          <SparklesIcon size={14} />
          <span>Cinematic Flagship Experience</span>
        </div>
        <h2 className={styles.sizzleTitle}>Experience The Collection</h2>
        <p className={styles.sizzleSubtitle}>
          Step inside our flagship gallery and craftsmanship vaults. Watch the
          reel and tap interactive product hotspots to shop the scene in real
          time.
        </p>
      </div>

      <div className={styles.playerWrapper}>
        <CinematicVideoPlayer
          title="Cart Commerce | Flagship Sizzle Reel"
          subtitle="4K Master • SoHo Flagship & Artisanal Vaults"
          duration={90}
          chapters={SIZZLE_CHAPTERS}
          accentColor="#38bdf8"
          renderOverlay={({ activeChapter }) => {
            const hotspot = activeChapter?.hotspot;
            if (!hotspot) return null;

            return (
              <div
                className={styles.hotspotAnchor}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                {/* Pulsating Ping Beacon */}
                <div className={styles.hotspotBeacon}>
                  <span className={styles.pingRing} />
                  <span className={styles.pingCore}>+</span>
                </div>

                {/* Floating Hotspot Card */}
                <div className={styles.hotspotCard}>
                  <span className={styles.hotspotTag}>Shop The Scene</span>
                  <strong className={styles.hotspotTitle}>
                    {hotspot.title}
                  </strong>
                  <div className={styles.hotspotBottomRow}>
                    <span className={styles.hotspotPrice}>
                      ${hotspot.price}
                    </span>
                    <button
                      type="button"
                      className={styles.quickAddBtn}
                      onClick={() => handleHotspotAdd(hotspot)}
                      aria-label={`Shop ${hotspot.title} for $${hotspot.price}`}
                    >
                      <CartIcon size={12} />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Chapters Quick Jump Bar */}
      <div className={styles.chaptersBar}>
        <span className={styles.jumpLabel}>Jump to Scene:</span>
        <div className={styles.chaptersGrid}>
          {SIZZLE_CHAPTERS.map((ch, idx) => (
            <div key={ch.timestamp} className={styles.chapterCard}>
              <div className={styles.chapterCardTop}>
                <span className={styles.chapterNum}>0{idx + 1}</span>
                <span className={styles.chapterTime}>
                  {Math.floor(ch.timestamp / 60)}:
                  {ch.timestamp % 60 < 10 ? '0' : ''}
                  {ch.timestamp % 60}
                </span>
              </div>
              <strong className={styles.chapterCardTitle}>{ch.title}</strong>
              <p className={styles.chapterCardDesc}>{ch.desc.split('•')[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
