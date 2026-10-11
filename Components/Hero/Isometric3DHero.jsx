import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { ProductArt } from './heroArt';
import styles from './Isometric3DHero.module.css';

/**
 * Studio Gallery: a slow 3D carousel that pairs curated catalogue pieces
 * with things shoppers make in the Custom Creation Studio — a personalised
 * storybook, a framed poster and a hoodie starring their own cast.
 *
 * The ring turns with a CSS transition; pointer tilt and glare are written
 * straight to CSS variables from a requestAnimationFrame loop that only runs
 * while the pointer is moving, so React never re-renders on mousemove.
 */

const CARDS = [
  {
    id: 'storybook',
    kind: 'storybook',
    source: 'studio',
    title: 'Mia & the Moon Fox',
    subtitle: 'Personalised storybook starring your cast',
    price: 'from $39',
    cta: 'Design yours',
  },
  {
    id: 'aj1',
    kind: 'sneaker',
    source: 'curated',
    title: "Air Jordan 1 'Lost & Found'",
    subtitle: 'Footwear · Deadstock, authenticated',
    price: '$425',
    cta: 'View piece',
  },
  {
    id: 'poster',
    kind: 'poster',
    source: 'studio',
    title: 'Our Crew',
    subtitle: 'Framed poster of your family as characters',
    price: 'from $59',
    cta: 'Design yours',
  },
  {
    id: 'xm5',
    kind: 'headphones',
    source: 'curated',
    title: 'Sony WH-1000XM5',
    subtitle: 'Audio · Wireless noise cancelling',
    price: '$398',
    cta: 'View piece',
  },
  {
    id: 'hoodie',
    kind: 'hoodie',
    source: 'studio',
    title: 'Team Leo Hoodie',
    subtitle: 'Apparel · Your character in gold foil',
    price: 'from $49',
    cta: 'Design yours',
  },
  {
    id: 'strat',
    kind: 'guitar',
    source: 'curated',
    title: "Fender '60s Relic Strat",
    subtitle: 'Instruments · Custom Shop, Olympic White',
    price: '$4,850',
    cta: 'View piece',
  },
];

const AUTO_MS = 3800;
const mod = (n, m) => ((n % m) + m) % m;
// Signed distance of card i from the front for a given step: -3 … 2.
const offsetOf = (i, step) =>
  mod(i - step + Math.floor(CARDS.length / 2), CARDS.length) -
  Math.floor(CARDS.length / 2);

export function Isometric3DHero({ className }) {
  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const prevStep = useRef(0);
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const active = mod(step, CARDS.length);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (hold || !visible || reduced) return undefined;
    const timer = setInterval(() => setStep((s) => s + 1), AUTO_MS);
    return () => clearInterval(timer);
  }, [hold, visible, reduced]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useEffect(() => {
    prevStep.current = step;
  }, [step]);

  const tick = () => {
    const c = current.current;
    const t = target.current;
    c.x += (t.x - c.x) * 0.12;
    c.y += (t.y - c.y) * 0.12;
    const el = tiltRef.current;
    if (el) {
      el.style.setProperty('--tilt-x', `${(-c.y * 10).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(c.x * 14).toFixed(2)}deg`);
      el.style.setProperty('--glare-x', `${(50 + c.x * 60).toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${(30 + c.y * 50).toFixed(1)}%`);
    }
    if (Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.001) {
      frame.current = requestAnimationFrame(tick);
    } else {
      frame.current = 0;
    }
  };

  const kick = () => {
    if (!frame.current && !reduced) frame.current = requestAnimationFrame(tick);
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    target.current = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    };
    kick();
  };

  const handlePointerLeave = () => {
    target.current = { x: 0, y: 0 };
    setHold(false);
    kick();
  };

  const goTo = (i) => setStep((s) => s + offsetOf(i, s));

  const card = CARDS[active];

  return (
    <div
      ref={rootRef}
      className={`${styles.gallery} ${reduced ? styles.still : ''} ${className || ''}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      role="region"
      aria-label="Studio gallery: curated pieces and custom creations in 3D"
    >
      <div className={styles.viewport}>
        <div ref={tiltRef} className={styles.tilt}>
          <div className={styles.floor} />
          {CARDS.map((c, i) => {
            const off = offsetOf(i, step);
            const prevOff = offsetOf(i, prevStep.current);
            // A card wrapping from one end to the other jumps while hidden.
            const wrapping = Math.abs(off - prevOff) > 1;
            const dist = Math.abs(off);
            const isActive = off === 0;
            return (
              <div
                key={c.id}
                className={`${styles.slot} ${dist > 2 ? styles.slotHidden : ''}`}
                style={{
                  '--off': off,
                  '--dist': dist,
                  transition: wrapping ? 'none' : undefined,
                }}
              >
                <button
                  type="button"
                  className={`${styles.card} ${styles[c.source]} ${isActive ? styles.cardActive : ''}`}
                  onClick={() => goTo(i)}
                  aria-pressed={isActive}
                  aria-label={`${c.title}, ${c.price}`}
                  tabIndex={dist > 1 ? -1 : 0}
                >
                  <span className={styles.cardTop}>
                    <span className={styles.badge}>
                      {c.source === 'studio' ? 'Studio' : 'Curated'}
                    </span>
                    <span className={styles.price}>{c.price}</span>
                  </span>
                  <span className={styles.artPanel}>
                    <span className={styles.artHalo} />
                    <ProductArt kind={c.kind} className={styles.art} />
                  </span>
                  <span className={styles.title}>{c.title}</span>
                  <span className={styles.subtitle}>{c.subtitle}</span>
                  <span className={styles.cta}>{c.cta} →</span>
                  <span className={styles.glare} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => setStep((s) => s - 1)}
          aria-label="Previous piece"
        >
          ‹
        </button>
        <span className={styles.caption} aria-live="polite">
          <span className={styles.captionSource}>
            {card.source === 'studio'
              ? 'Custom Creation Studio'
              : 'Curated catalogue'}
          </span>
          <span className={styles.captionTitle}>{card.title}</span>
        </span>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => setStep((s) => s + 1)}
          aria-label="Next piece"
        >
          ›
        </button>
      </div>
    </div>
  );
}

Isometric3DHero.propTypes = {
  className: PropTypes.string,
};
