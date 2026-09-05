import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

/**
 * Isometric3DHero
 *
 * Interactive 3D spatial showcase using CSS 3D transforms (preserve-3d).
 * Features mouse-tracking tilt, rotating multi-tier pedestal,
 * and 4 floating 3D layered luxury product cards with dynamic specular glare.
 */
export function Isometric3DHero({ className }) {
  const [rotation, setRotation] = useState({ x: 12, y: -15 });
  const [activeCard, setActiveCard] = useState(0);

  // Smooth mouse tilt handler
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    setRotation({
      x: 15 - ny * 30, // Tilt forward / backward
      y: -15 + nx * 35, // Tilt left / right
    });
  };

  const handleMouseLeave = () => {
    // Return to default isometric angle smoothly
    setRotation({ x: 14, y: -18 });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    {
      id: 'shoes',
      title: "Air Jordan 1 'Lost & Found'",
      subtitle: 'Footwear Collection',
      price: '$425.00',
      badge: 'Iconic',
      color: '#ef4444',
      icon: '👟',
      transform: 'translate3d(-140px, -40px, 60px) rotateY(-10deg)',
    },
    {
      id: 'mtg',
      title: 'Black Lotus Alpha 9.5',
      subtitle: 'Rare Collectibles',
      price: '$495,000',
      badge: 'Grail',
      color: '#b8860b',
      icon: '🎴',
      transform: 'translate3d(140px, -60px, 80px) rotateY(12deg)',
    },
    {
      id: 'instruments',
      title: "Fender '60s Custom Strat",
      subtitle: 'Musical Instruments',
      price: '$4,850',
      badge: 'Masterbuilt',
      color: '#38bdf8',
      icon: '🎸',
      transform: 'translate3d(-120px, 90px, 100px) rotateY(-8deg)',
    },
    {
      id: 'weights',
      title: 'Rogue Ohio Cerakote Bar',
      subtitle: 'Strength & Fitness',
      price: '$350.00',
      badge: 'Made in USA',
      color: '#10b981',
      icon: '🏋️',
      transform: 'translate3d(120px, 80px, 50px) rotateY(8deg)',
    },
  ];

  return (
    <div
      className={`${styles.iso3dViewport} ${className || ''}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Interactive 3D product showcase"
    >
      {/* 3D Scene Root */}
      <div
        className={styles.iso3dScene}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Base 3D Pedestal Stage */}
        <div className={styles.iso3dPedestal}>
          <div className={styles.pedestalTop}>
            <div className={styles.pedestalGlowRing} />
            <div className={styles.pedestalCore} />
          </div>
          <div className={styles.pedestalShadow} />
        </div>

        {/* Floating Center Hologram Sphere */}
        <div className={styles.iso3dCenterOrb}>
          <div className={styles.orbInnerGlow} />
          <div className={styles.orbRings}>
            <div className={styles.orbRing1} />
            <div className={styles.orbRing2} />
          </div>
        </div>

        {/* 4 Orbiting 3D Glass Cards */}
        {cards.map((card, index) => {
          const isSelected = activeCard === index;
          return (
            <div
              key={card.id}
              className={`${styles.isoCard} ${isSelected ? styles.isoCardFocused : ''}`}
              style={{
                transform: card.transform,
              }}
              onClick={() => setActiveCard(index)}
            >
              {/* Glass Reflection Glare */}
              <div
                className={styles.cardGlare}
                style={{
                  background: `linear-gradient(${135 + rotation.y * 2}deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
                }}
              />

              {/* Card Content */}
              <div className={styles.cardHeader}>
                <span className={styles.cardEmoji}>{card.icon}</span>
                <span
                  className={styles.cardBadge}
                  style={{
                    backgroundColor: `${card.color}22`,
                    color: card.color,
                    borderColor: `${card.color}44`,
                  }}
                >
                  {card.badge}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h4 className={styles.cardTitle}>{card.title}</h4>
                <p className={styles.cardSubtitle}>{card.subtitle}</p>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{card.price}</span>
                  <span className={styles.cardAction}>Inspect →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper text */}
      <div className={styles.iso3dHint}>
        <span>Interactive 3D • Move cursor to tilt</span>
      </div>
    </div>
  );
}
