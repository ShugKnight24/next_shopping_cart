import PropTypes from 'prop-types';
import { useId } from 'react';
import { BRAND_COLORS, CART_MODEL, project } from '../Brand/cartGeometry';

/**
 * The Cart Commerce mark: a chrome wire cart in three-quarter view with a
 * gold grip, carrying what the store sells — a sneaker, headphones, a holo
 * card and a gift — the same cast as the 3D story above the hero.
 *
 * The wire is generated from a small 3D model and the brand's oblique
 * projection (Brand/cartGeometry), the same one the logo glyph and favicon
 * are drawn with, so every rod lines up the way a real cart's does.
 */

// Oblique projection: depth runs up and to the right.
const P = project;
const f = (n) => Math.round(n * 10) / 10;
const seg = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const { length: L, depth: W, height: H, rim: RIM } = CART_MODEL;
const FLOOR = RIM + H;
const [TUCK_HANDLE, TUCK] = CART_MODEL.floorTuck;
const [HANDLE_X, HANDLE_Y] = CART_MODEL.handle;

// Rim is the full box; the floor tucks in at the back like a real cart.
const rim = [
  [0, RIM, 0],
  [L, RIM, 0],
  [L, RIM, W],
  [0, RIM, W],
];
const floor = [
  [TUCK_HANDLE, FLOOR, TUCK],
  [L - TUCK, FLOOR, TUCK],
  [L - TUCK, FLOOR, W - TUCK],
  [TUCK_HANDLE, FLOOR, W - TUCK],
];

const faceWires = (a0, a1, b0, b1, n) =>
  Array.from({ length: n - 1 }, (_, i) => {
    const t = (i + 1) / n;
    return seg(P(...lerp3(a0, a1, t)), P(...lerp3(b0, b1, t)));
  }).join('');

const rails = (levels) =>
  levels
    .map((t) => {
      const ring = rim.map((r, i) => lerp3(floor[i], r, t));
      return ring
        .map((pt, i) => seg(P(...pt), P(...ring[(i + 1) % 4])))
        .join('');
    })
    .join('');

// Back and left faces sit behind the goods; front and right faces in front.
const BACK = [
  faceWires(floor[3], floor[2], rim[3], rim[2], 14),
  faceWires(floor[0], floor[3], rim[0], rim[3], 6),
  seg(P(...rim[3]), P(...rim[2])),
  seg(P(...rim[0]), P(...rim[3])),
  seg(P(...floor[3]), P(...floor[2])),
].join('');

const FRONT = [
  faceWires(floor[0], floor[1], rim[0], rim[1], 14),
  faceWires(floor[1], floor[2], rim[1], rim[2], 6),
  rails([0.34, 0.67]),
  floor.map((pt, i) => seg(P(...pt), P(...rim[i]))).join(''),
  seg(P(...floor[0]), P(...floor[1])),
  seg(P(...floor[1]), P(...floor[2])),
].join('');

const RIM_PATH = rim
  .map((pt, i) => seg(P(...pt), P(...rim[(i + 1) % 4])))
  .join('');

// Chassis, wheels and handle.
const LEG_Y = FLOOR + CART_MODEL.leg;
const legs = [
  [18, LEG_Y, 8],
  [L - 8, LEG_Y, 8],
  [L - 8, LEG_Y, W - 8],
  [18, LEG_Y, W - 8],
];
const CHASSIS = [
  ...legs.map((pt, i) => seg(P(...pt), P(...floor[i]))),
  seg(P(...legs[0]), P(...legs[1])),
  seg(P(...legs[3]), P(...legs[2])),
  seg(P(...legs[1]), P(...legs[2])),
].join('');
const handleA = P(HANDLE_X, RIM + HANDLE_Y, 2);
const handleB = P(HANDLE_X, RIM + HANDLE_Y, W - 2);
const HANDLE = seg(P(...rim[0]), handleA) + seg(P(...rim[3]), handleB);

export const CartCommerceMark = ({
  className = '',
  tagline = 'PREMIUM SHOPPING EXPERIENCE',
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = (name) => `${name}-${id}`;
  const wheel = (pt, key) => {
    const [x, y] = P(...pt);
    return (
      <g key={key}>
        <ellipse
          cx={x}
          cy={y + 9}
          rx="9.5"
          ry="9.5"
          fill={`url(#${u('tyre')})`}
        />
        <ellipse
          cx={x}
          cy={y + 9}
          rx="4"
          ry="4"
          fill={`url(#${u('chrome')})`}
        />
      </g>
    );
  };

  return (
    <div className={className}>
      <svg
        viewBox="-40 -10 340 196"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Cart Commerce"
      >
        <defs>
          <linearGradient id={u('chrome')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRAND_COLORS.chromeHi} />
            <stop offset="0.35" stopColor={BRAND_COLORS.chrome} />
            <stop offset="0.6" stopColor={BRAND_COLORS.chromeMid} />
            <stop offset="1" stopColor="#eef1f6" />
          </linearGradient>
          <linearGradient id={u('chromeBack')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9c1ce" />
            <stop offset="1" stopColor="#7d8798" />
          </linearGradient>
          <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={BRAND_COLORS.goldLight} />
            <stop offset="0.5" stopColor={BRAND_COLORS.gold} />
            <stop offset="1" stopColor={BRAND_COLORS.goldDeep} />
          </linearGradient>
          <radialGradient id={u('tyre')} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#4a4f5a" />
            <stop offset="1" stopColor="#15171c" />
          </radialGradient>
          <linearGradient id={u('holo')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffcf6b" />
            <stop offset="0.35" stopColor="#ff7eb3" />
            <stop offset="0.7" stopColor="#7ec8ff" />
            <stop offset="1" stopColor="#b28dff" />
          </linearGradient>
          <filter id={u('shadow')} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="2"
              dy="8"
              stdDeviation="7"
              floodColor="#020617"
              floodOpacity="0.45"
            />
          </filter>
          <filter id={u('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Floor shadow */}
        <ellipse
          cx={P(L / 2, LEG_Y, W / 2)[0]}
          cy={LEG_Y + 22}
          rx="112"
          ry="9"
          fill="#020617"
          opacity="0.35"
        />

        <g filter={`url(#${u('shadow')})`}>
          {/* Behind the goods: back and left faces, chassis */}
          <path
            d={BACK}
            stroke={`url(#${u('chromeBack')})`}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d={CHASSIS}
            stroke={`url(#${u('chrome')})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {legs.slice(2).map((pt, i) => wheel(pt, `back-${i}`))}

          {/* The goods */}
          <g
            transform={`translate(${P(40, RIM - 6, W * 0.6).join(' ')}) rotate(-10)`}
          >
            {/* Holo card in its slab */}
            <rect
              x="-2"
              y="-34"
              width="30"
              height="42"
              rx="3"
              fill="#ffffff"
              opacity="0.55"
            />
            <rect
              x="1"
              y="-31"
              width="24"
              height="36"
              rx="2"
              fill={`url(#${u('holo')})`}
            />
            <rect x="4" y="-27" width="18" height="16" rx="1" fill="#0f2744" />
            <path
              d="M13 -25l2 4 4.5.5-3.3 3 1 4.4-4.2-2.4-4.2 2.4 1-4.4-3.3-3 4.5-.5z"
              fill="#ffd36b"
            />
          </g>
          <g transform={`translate(${P(70, RIM + 2, W * 0.45).join(' ')})`}>
            {/* Headphones */}
            <path
              d="M0 0c0-22 40-22 40 0"
              stroke="#1b1d22"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M2 -2c2-17 34-17 36 0"
              stroke={`url(#${u('gold')})`}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <rect x="-6" y="-4" width="11" height="18" rx="5" fill="#1b1d22" />
            <rect x="35" y="-4" width="11" height="18" rx="5" fill="#1b1d22" />
            <rect
              x="-3"
              y="0"
              width="5"
              height="10"
              rx="2.5"
              fill={`url(#${u('gold')})`}
            />
            <rect
              x="38"
              y="0"
              width="5"
              height="10"
              rx="2.5"
              fill={`url(#${u('gold')})`}
            />
          </g>
          <g transform={`translate(${P(112, RIM - 4, W * 0.5).join(' ')})`}>
            {/* Gift box */}
            <rect x="0" y="0" width="30" height="24" rx="2" fill="#1e3a5f" />
            <rect x="-2" y="-6" width="34" height="8" rx="2" fill="#2d5a87" />
            <rect
              x="12"
              y="-6"
              width="6"
              height="30"
              fill={`url(#${u('gold')})`}
            />
            <path
              d="M15 -6c-10-12-20-4-8 0M15 -6c10-12 20-4 8 0"
              stroke={`url(#${u('gold')})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          <g
            transform={`translate(${P(18, RIM + 4, W * 0.15).join(' ')}) rotate(-6)`}
          >
            {/* Sneaker peeking over the rim */}
            <path
              d="M0 10c0-8 4-14 12-14l8 0c4 6 12 8 22 9 8 1 12 3 12 7z"
              fill="#f4f2ee"
            />
            <path
              d="M-2 10h58c1 3-1 5-4 5H1c-3 0-4-2-3-5z"
              fill="#ffffff"
              stroke="#cbd2dd"
              strokeWidth="0.8"
            />
            <path
              d="M10 6c10 0 22 1 32 3"
              stroke="#2457c5"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <rect
              x="-1"
              y="-3"
              width="7"
              height="12"
              rx="2"
              fill={`url(#${u('gold')})`}
            />
          </g>

          {/* In front of the goods: front and right faces, rim, handle */}
          <path
            d={FRONT}
            stroke={`url(#${u('chrome')})`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d={RIM_PATH}
            stroke={`url(#${u('chrome')})`}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d={HANDLE}
            stroke={`url(#${u('chrome')})`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d={seg(handleA, handleB)}
            stroke={`url(#${u('gold')})`}
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d={seg(handleA, handleB)}
            stroke="#fff6d6"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
            transform="translate(0 -1.6)"
          />

          {/* Brand plate on the long side, which faces the viewer square-on */}
          <rect
            x={L / 2 - 46}
            y={RIM + 26}
            width="92"
            height="20"
            rx="3"
            fill={`url(#${u('gold')})`}
          />
          <rect
            x={L / 2 - 43}
            y={RIM + 28.5}
            width="86"
            height="15"
            rx="2"
            fill="none"
            stroke="#0f2744"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
          <text
            x={L / 2}
            y={RIM + 39.2}
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            fontWeight="800"
            letterSpacing="1.2"
            fill="#0f2744"
            textAnchor="middle"
          >
            CART COMMERCE
          </text>

          {legs.slice(0, 2).map((pt, i) => wheel(pt, `front-${i}`))}
        </g>

        {/* A glint on the rim */}
        <circle
          cx={P(L * 0.72, RIM, 0)[0]}
          cy={P(L * 0.72, RIM, 0)[1]}
          r="3"
          fill="#ffffff"
          filter={`url(#${u('glow')})`}
        />

        {tagline && (
          <text
            x="130"
            y="184"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="9.5"
            fontWeight="600"
            fill="rgba(255,255,255,0.72)"
            textAnchor="middle"
            letterSpacing="3"
          >
            {tagline}
          </text>
        )}
      </svg>
    </div>
  );
};

CartCommerceMark.propTypes = {
  className: PropTypes.string,
  tagline: PropTypes.string,
};
