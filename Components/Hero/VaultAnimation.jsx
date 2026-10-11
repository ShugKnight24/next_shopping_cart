import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { CardSlabArt, GuitarArt, SneakerArt, useSvgIds } from './heroArt';
import styles from './VaultAnimation.module.css';

/**
 * Private Vault: a lit display vault. The round door swings open on a real
 * 3D hinge, a scan line authenticates the piece inside and a gold seal is
 * pressed on. Each cycle reveals the next curated piece from the catalogue.
 *
 * The door, scan and seal are HTML layers animated with transform/opacity.
 * The next piece is swapped in on the door animation's iteration event, so
 * the swap always happens while the door is shut.
 */

const PIECES = [
  {
    id: 'one-ring',
    name: 'The One Ring',
    edition: 'Magic: The Gathering · Serialized 001/001',
    price: '$2,000,000',
    serial: 'CC-VLT-0001',
    proof: ['Serial 001/001 verified', 'Graded & sealed'],
    Art: CardSlabArt,
    artProps: {
      art: 'ring',
      cardName: 'THE ONE RING',
      setName: 'SERIAL 001/001',
      grade: '10',
    },
    box: [-34, -80, 68, 86],
    h: 0.6,
  },
  {
    id: 'black-lotus',
    name: 'Black Lotus',
    edition: 'Magic: The Gathering · Alpha Limited Edition',
    price: '$495,000',
    serial: 'CC-VLT-0214',
    proof: ['Alpha print verified', 'Graded 9.5'],
    Art: CardSlabArt,
    artProps: {
      art: 'lotus',
      cardName: 'BLACK LOTUS',
      setName: 'ALPHA · GEM MINT',
      grade: '9.5',
    },
    box: [-34, -80, 68, 86],
    h: 0.6,
  },
  {
    id: 'strat',
    name: "Fender Custom Shop '60s Relic Stratocaster",
    edition: 'Olympic White · Masterbuilt',
    price: '$4,850',
    serial: 'CC-VLT-1960',
    proof: ['Builder certificate', 'Serial matched'],
    Art: GuitarArt,
    artProps: {},
    box: [-44, -156, 88, 162],
    h: 0.7,
  },
  {
    id: 'aj1',
    name: "Air Jordan 1 Retro High OG 'Lost & Found'",
    edition: 'Deadstock · Original box',
    price: '$425',
    serial: 'CC-VLT-0085',
    proof: ['Stitching inspected', 'Box & tags verified'],
    Art: SneakerArt,
    artProps: {},
    box: [-56, -66, 112, 72],
    h: 0.34,
  },
];

function VaultDoor() {
  const u = useSvgIds();
  const bolts = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2);
  return (
    <svg viewBox="-160 -160 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#c9d1de" />
          <stop offset="0.7" stopColor="#7d8798" />
          <stop offset="1" stopColor="#dfe4ec" />
        </linearGradient>
        <radialGradient id={u('face')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#2f5d8c" />
          <stop offset="0.6" stopColor="#163657" />
          <stop offset="1" stopColor="#0a1a2e" />
        </radialGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        <path id={u('arc')} d="M-104 0 A104 104 0 0 1 104 0" />
      </defs>
      <circle r="156" fill={`url(#${u('rim')})`} />
      <circle r="146" fill={`url(#${u('face')})`} />
      <circle
        r="146"
        fill="none"
        stroke="#020617"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      {bolts.map((a) => (
        <g
          key={a}
          transform={`translate(${Math.cos(a) * 134} ${Math.sin(a) * 134})`}
        >
          <circle r="5.6" fill={`url(#${u('rim')})`} />
          <circle cx="-1.4" cy="-1.4" r="1.6" fill="#ffffff" opacity="0.8" />
        </g>
      ))}
      <circle
        r="118"
        fill="none"
        stroke={`url(#${u('gold')})`}
        strokeWidth="1.6"
        opacity="0.8"
      />
      <circle
        r="90"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="14"
      />
      <text
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="800"
        letterSpacing="4"
        fill="#f6dd8a"
        fillOpacity="0.85"
      >
        <textPath href={`#${u('arc')}`} startOffset="50%" textAnchor="middle">
          CART COMMERCE · PRIVATE VAULT
        </textPath>
      </text>
      <path
        d="M-120 -70 A140 140 0 0 1 40 -132"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function VaultWheel() {
  const u = useSvgIds();
  return (
    <svg viewBox="-90 -90 180 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        <radialGradient id={u('hub')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#8a5f12" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <rect
            x="-3.5"
            y="-76"
            width="7"
            height="60"
            rx="3.5"
            fill={`url(#${u('gold')})`}
          />
          <circle cy="-78" r="8" fill={`url(#${u('hub')})`} />
        </g>
      ))}
      <circle r="28" fill={`url(#${u('hub')})`} />
      <circle
        r="20"
        fill="none"
        stroke="#0f2744"
        strokeOpacity="0.4"
        strokeWidth="1.4"
      />
      <text
        y="4"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#0f2744"
        textAnchor="middle"
      >
        CC
      </text>
    </svg>
  );
}

function VaultFrame() {
  const u = useSvgIds();
  return (
    <svg
      viewBox="0 0 400 400"
      className={styles.frameSvg}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={u('niche')} cx="0.5" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#21486f" />
          <stop offset="0.55" stopColor="#0d2038" />
          <stop offset="1" stopColor="#040b15" />
        </radialGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#8a5f12" />
        </linearGradient>
        <linearGradient id={u('steel')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1f6" />
          <stop offset="0.5" stopColor="#8d96a6" />
          <stop offset="1" stopColor="#c9d1de" />
        </linearGradient>
        <radialGradient id={u('halo')}>
          <stop offset="0.6" stopColor="#daa520" stopOpacity="0.25" />
          <stop offset="1" stopColor="#daa520" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u('plinth')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24507e" />
          <stop offset="1" stopColor="#0a1a2e" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill={`url(#${u('halo')})`} />
      <circle cx="200" cy="200" r="176" fill={`url(#${u('steel')})`} />
      <circle
        cx="200"
        cy="200"
        r="170"
        fill="none"
        stroke={`url(#${u('gold')})`}
        strokeWidth="8"
      />
      <circle cx="200" cy="200" r="160" fill={`url(#${u('niche')})`} />
      {/* Velvet ribs */}
      <g stroke="#ffffff" strokeOpacity="0.035" strokeWidth="10">
        {[-120, -80, -40, 0, 40, 80, 120].map((x) => (
          <path key={x} d={`M${200 + x} 40 V360`} />
        ))}
      </g>
      {/* Display pedestal */}
      <ellipse cx="200" cy="330" rx="86" ry="12" fill="#020617" opacity="0.6" />
      <path d="M138 296 H262 L254 330 H146 Z" fill={`url(#${u('plinth')})`} />
      <ellipse cx="200" cy="296" rx="62" ry="10" fill="#3a6a9a" />
      <ellipse
        cx="200"
        cy="296"
        rx="62"
        ry="10"
        fill="none"
        stroke={`url(#${u('gold')})`}
        strokeWidth="2"
      />
      {/* Hinge */}
      <rect
        x="18"
        y="140"
        width="16"
        height="36"
        rx="4"
        fill={`url(#${u('steel')})`}
      />
      <rect
        x="18"
        y="224"
        width="16"
        height="36"
        rx="4"
        fill={`url(#${u('steel')})`}
      />
    </svg>
  );
}

function Seal({ serial }) {
  const u = useSvgIds();
  const scallops = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return `${(Math.cos(a) * 30).toFixed(2)},${(Math.sin(a) * 30).toFixed(2)}`;
  });
  return (
    <svg viewBox="-40 -40 80 92" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2c2" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#8a5f12" />
        </linearGradient>
      </defs>
      <path d="M-12 18 L-20 50 L-10 44 L-4 52 L2 22 Z" fill="#1e3a5f" />
      <path d="M12 18 L20 50 L10 44 L4 52 L-2 22 Z" fill="#2d5a87" />
      {scallops.map((pt) => {
        const [x, y] = pt.split(',');
        return (
          <circle key={pt} cx={x} cy={y} r="6" fill={`url(#${u('gold')})`} />
        );
      })}
      <circle r="30" fill={`url(#${u('gold')})`} />
      <circle
        r="24"
        fill="none"
        stroke="#0f2744"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <text
        y="-8"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="5.4"
        fontWeight="800"
        letterSpacing="1"
        fill="#0f2744"
        textAnchor="middle"
      >
        AUTHENTIC
      </text>
      <path
        d="M-8 1 l5 5 l11 -12"
        stroke="#0f2744"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        y="16"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="4"
        fontWeight="700"
        letterSpacing="0.4"
        fill="#0f2744"
        textAnchor="middle"
      >
        {serial}
      </text>
    </svg>
  );
}
Seal.propTypes = { serial: PropTypes.string.isRequired };

export function VaultAnimation({ className }) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const rootRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const piece = PIECES[index];

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) =>
      setPaused(!entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleIteration = (e) => {
    if (e.target !== e.currentTarget) return;
    setIndex((i) => (i + 1) % PIECES.length);
  };

  const choose = (i) => {
    setIndex(i);
    // Re-key the animated layers so the reveal restarts for the chosen piece.
    setCycle((c) => c + 1);
  };

  const { Art, artProps, box, h } = piece;

  return (
    <div
      ref={rootRef}
      className={`${styles.vault} ${paused ? styles.paused : ''} ${className || ''}`.trim()}
    >
      <div
        className={styles.visual}
        role="img"
        aria-label={`Private vault opening to reveal ${piece.name}, authenticated with a Cart Commerce seal`}
      >
        <VaultFrame />
        <div className={styles.niche} key={`niche-${cycle}`}>
          <div className={styles.spot} />
          <div className={styles.piece} style={{ '--piece-h': `${h * 100}%` }}>
            <div className={styles.pieceFloat}>
              <svg
                viewBox={box.join(' ')}
                xmlns="http://www.w3.org/2000/svg"
                key={piece.id}
              >
                <Art {...artProps} />
              </svg>
            </div>
          </div>
          <div className={styles.scan} />
        </div>
        <div className={styles.seal} key={`seal-${cycle}`}>
          <Seal serial={piece.serial} />
        </div>
        <div className={styles.doorHinge}>
          <div
            className={styles.door}
            key={`door-${cycle}`}
            onAnimationIteration={handleIteration}
          >
            <VaultDoor />
            <div className={styles.wheel}>
              <VaultWheel />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.info} aria-live="polite">
        <div className={styles.infoInner} key={piece.id}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Vault {String(index + 1).padStart(2, '0')} · Authenticated
          </span>
          <h3 className={styles.name}>{piece.name}</h3>
          <p className={styles.edition}>{piece.edition}</p>
          <p className={styles.price}>{piece.price}</p>
          <ul className={styles.proof}>
            {piece.proof.map((p) => (
              <li key={p}>{p}</li>
            ))}
            <li>Insured white-glove delivery</li>
          </ul>
        </div>
        <div
          className={styles.dots}
          role="group"
          aria-label="Choose a vault piece"
        >
          {PIECES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              aria-label={`Show ${p.name}`}
              aria-pressed={i === index}
              onClick={() => choose(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

VaultAnimation.propTypes = {
  className: PropTypes.string,
};
