import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * Vector renders of real Cart Commerce catalogue items and Studio creations,
 * shared by every hero showcase mode.
 *
 * Each art piece is an SVG <g> drawn in its own local box: centred on x = 0,
 * sitting on y = 0 (its "floor"), lit from the top left. Gradient ids are
 * scoped per instance with useId so the same piece can appear many times on
 * the page next to the logo and other SVGs.
 */

export function useSvgIds() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (name) => `${name}-${id}`;
}

const artPropTypes = {
  transform: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Oblique projection shared with the brand mark: depth runs up and right.
export const P = (x, y, z) => [x + z * 0.42, y - z * 0.3];
const f = (n) => Math.round(n * 10) / 10;
export const poly = (pts) =>
  `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;

/* -------------------------------------------------------------------------- */
/* Air Jordan 1 Retro High OG 'Lost & Found'                                  */
/* -------------------------------------------------------------------------- */

export function SneakerArt({ transform, className, style }) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('leather')} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1eee8" />
          <stop offset="1" stopColor="#d4cfc6" />
        </linearGradient>
        <linearGradient id={u('red')} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#e2343f" />
          <stop offset="1" stopColor="#9e1222" />
        </linearGradient>
        <linearGradient id={u('black')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3d44" />
          <stop offset="1" stopColor="#0d0e11" />
        </linearGradient>
        <linearGradient id={u('mid')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6edd6" />
          <stop offset="1" stopColor="#d6c49b" />
        </linearGradient>
      </defs>
      {/* Contact shadow */}
      <ellipse cx="2" cy="0.5" rx="50" ry="3.2" fill="#020617" opacity="0.35" />
      {/* Outsole + midsole */}
      <path
        d="M-47 -8 Q-48 0 -40 0 L41 0 Q50 0 50 -7 L50 -9 L-47 -9 Z"
        fill={`url(#${u('red')})`}
      />
      <path
        d="M-47 -8.5 L50 -8.5 Q51 -13.5 47 -15 L-45.5 -15 Q-48.5 -13 -47 -8.5 Z"
        fill={`url(#${u('mid')})`}
      />
      <path
        d="M-44 -11.6 L46 -11.6"
        stroke="#b9a67c"
        strokeWidth="0.6"
        opacity="0.7"
      />
      {/* Upper */}
      <path
        d="M-45.5 -15 C-49 -28 -48 -42 -43 -52 C-41 -55.5 -36 -56.5 -30 -55.5 L-16 -52.5 L-12.5 -59 L-3.5 -58 C-2 -50 2 -42 8 -36.5 C18 -30.5 32 -26.5 42 -22.5 C48 -20.5 50.5 -17.5 47 -15 Z"
        fill={`url(#${u('leather')})`}
      />
      {/* Mudguard */}
      <path
        d="M-12 -15 L47 -15 C50.5 -17.5 48 -20.5 42 -22.5 C36 -24.6 30 -25.6 26 -24.6 C21 -22.6 15 -21.6 9 -21.4 C1 -21.2 -7 -19.4 -12 -15 Z"
        fill={`url(#${u('red')})`}
      />
      {/* Heel counter */}
      <path
        d="M-45.5 -15 C-49 -26 -48 -36 -45.6 -42 C-38 -40.5 -31 -34 -28.6 -26 C-27.6 -21 -26.6 -17.6 -24 -15 Z"
        fill={`url(#${u('red')})`}
      />
      {/* Eyestay */}
      <path
        d="M-16 -52.5 L-5.6 -54.6 C-3 -47 1.6 -40 8 -36.5 L3 -32.4 C-3.6 -37 -9.6 -44 -16 -52.5 Z"
        fill={`url(#${u('red')})`}
      />
      {/* Collar wing */}
      <path
        d="M-43 -52 C-41 -55.5 -36 -56.5 -30 -55.5 L-16 -52.5 C-19.6 -46 -24 -42 -30 -40.5 C-36 -41.2 -41 -45.6 -43 -52 Z"
        fill={`url(#${u('black')})`}
      />
      {/* Tongue + label */}
      <path
        d="M-12.5 -59 L-3.5 -58 L-5.6 -54.6 L-14.6 -53.4 Z"
        fill="#f7f5f1"
      />
      <rect
        x="-11.4"
        y="-58.2"
        width="5.4"
        height="3.2"
        rx="0.6"
        fill="#c21f2e"
        transform="rotate(6 -8.7 -56.6)"
      />
      {/* Swoosh */}
      <path
        d="M-35 -21.5 C-21 -29.5 0 -38 23 -40.5 C6 -34 -9 -26.5 -19 -20.5 C-25.5 -17 -33.5 -16.5 -35 -21.5 Z"
        fill={`url(#${u('black')})`}
      />
      {/* Laces */}
      <g stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round">
        <path d="M-12.4 -50 L-6.4 -51.4" />
        <path d="M-9.8 -45.4 L-3.6 -47" />
        <path d="M-6.6 -41 L-0.6 -42.8" />
        <path d="M-3 -36.8 L2.6 -38.8" />
      </g>
      {/* Stitching */}
      <g
        stroke="#000000"
        strokeOpacity="0.28"
        strokeWidth="0.5"
        strokeDasharray="1.4 1.2"
        fill="none"
      >
        <path d="M-10 -17 C-4 -20.4 3 -22.4 10 -22.6 C17 -22.8 22 -24 26 -25.8" />
        <path d="M-27.4 -17 C-29 -26 -33 -34 -43.6 -39.6" />
        <path d="M-15.2 -50.6 C-10 -43 -5 -37.6 2.4 -33.6" />
      </g>
      {/* Key light */}
      <path
        d="M-44 -48 C-46 -38 -46.6 -28 -45 -20"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 -27 C30 -27 38 -24.6 44 -21.6"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
SneakerArt.propTypes = artPropTypes;

/* -------------------------------------------------------------------------- */
/* Sony WH-1000XM5                                                            */
/* -------------------------------------------------------------------------- */

export function HeadphonesArt({ transform, className, style }) {
  const u = useSvgIds();
  const cup = (side) => {
    const s = side === 'left' ? -1 : 1;
    return (
      <g>
        {/* Slider rod */}
        <path
          d={`M${s * 29} -36 L${s * 29.5} -28`}
          stroke={`url(#${u('steel')})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Cup shell */}
        <ellipse
          cx={s * 28}
          cy="-15"
          rx="12"
          ry="16.5"
          fill={`url(#${u('shell')})`}
          transform={`rotate(${s * -8} ${s * 28} -15)`}
        />
        {/* Cushion seen from the inside */}
        <ellipse
          cx={s * 23.5}
          cy="-15"
          rx="6"
          ry="14"
          fill={`url(#${u('cushion')})`}
          transform={`rotate(${s * -8} ${s * 23.5} -15)`}
        />
        {/* Shell rim light */}
        <path
          d={
            side === 'left'
              ? 'M-36 -24 C-35 -29 -31.6 -31.2 -27.6 -31'
              : 'M24.4 -30 C28.6 -31.4 32.4 -30 34.6 -26.4'
          }
          stroke="#c9d1de"
          strokeOpacity="0.75"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mic port */}
        <circle cx={s * 32} cy="-6" r="0.9" fill="#5b616d" />
      </g>
    );
  };
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('band')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b505b" />
          <stop offset="1" stopColor="#16181d" />
        </linearGradient>
        <radialGradient id={u('shell')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#4c525e" />
          <stop offset="0.55" stopColor="#23262d" />
          <stop offset="1" stopColor="#0c0d10" />
        </radialGradient>
        <linearGradient id={u('cushion')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2d313a" />
          <stop offset="1" stopColor="#0a0b0d" />
        </linearGradient>
        <linearGradient id={u('steel')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f6" />
          <stop offset="1" stopColor="#8d96a6" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="0.5" rx="40" ry="3" fill="#020617" opacity="0.35" />
      {/* Headband */}
      <path
        d="M-29 -34 C-31 -64 31 -64 29 -34"
        stroke={`url(#${u('band')})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-25 -42 C-22 -58 10 -61 20 -52"
        stroke="#9ea6b4"
        strokeOpacity="0.6"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {cup('left')}
      {cup('right')}
    </g>
  );
}
HeadphonesArt.propTypes = artPropTypes;

/* -------------------------------------------------------------------------- */
/* Graded Magic: The Gathering slab (Mox Diamond, Stronghold)                 */
/* -------------------------------------------------------------------------- */

export function CardSlabArt({
  transform,
  className,
  style,
  cardName = 'MOX DIAMOND',
  setName = 'STRONGHOLD · GEM MT',
  grade = '10',
  art = 'mox',
}) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('acrylic')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#dce6f5" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={u('frame')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a39a8a" />
          <stop offset="1" stopColor="#6d665a" />
        </linearGradient>
        <linearGradient id={u('art')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d2a52" />
          <stop offset="0.5" stopColor="#3b2a6b" />
          <stop offset="1" stopColor="#0f1a33" />
        </linearGradient>
        <linearGradient id={u('gem')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#bfe8ff" />
          <stop offset="1" stopColor="#8f7bff" />
        </linearGradient>
        <linearGradient id={u('sheen')} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="0.62" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dd8a" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
      </defs>
      <ellipse cx="1" cy="0.5" rx="24" ry="2.4" fill="#020617" opacity="0.35" />
      {/* Slab */}
      <rect
        x="-24"
        y="-68"
        width="48"
        height="68"
        rx="4"
        fill={`url(#${u('acrylic')})`}
        stroke="#ffffff"
        strokeOpacity="0.75"
        strokeWidth="1"
      />
      <rect
        x="-22"
        y="-66"
        width="44"
        height="64"
        rx="3"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
        strokeWidth="0.6"
      />
      {/* Grade label */}
      <rect x="-21" y="-64.5" width="42" height="13" rx="1.4" fill="#f5f6f9" />
      <rect
        x="-21"
        y="-64.5"
        width="42"
        height="13"
        rx="1.4"
        fill="none"
        stroke={`url(#${u('gold')})`}
        strokeWidth="1"
      />
      <text
        x="-18.5"
        y="-59.4"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="3.6"
        fontWeight="800"
        fill="#0f2744"
      >
        {cardName}
      </text>
      <text
        x="-18.5"
        y="-54.6"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="2.8"
        fontWeight="600"
        fill="#5b6475"
      >
        {setName}
      </text>
      <text
        x="18.5"
        y="-53.8"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="900"
        fill="#0f2744"
        textAnchor="end"
      >
        {grade}
      </text>
      {/* Card */}
      <rect x="-18" y="-49" width="36" height="46" rx="2" fill="#101114" />
      <rect
        x="-16"
        y="-47"
        width="32"
        height="42"
        rx="1.2"
        fill={`url(#${u('frame')})`}
      />
      <rect x="-15" y="-46" width="30" height="4" rx="0.8" fill="#e3dccb" />
      <rect x="-14" y="-44.7" width="12" height="1.2" fill="#3a352d" />
      <rect x="-15" y="-41" width="30" height="18" fill={`url(#${u('art')})`} />
      {art === 'mox' && (
        <g>
          <path d="M0 -38 L7 -32 L0 -25 L-7 -32 Z" fill={`url(#${u('gem')})`} />
          <path
            d="M0 -38 L2.4 -32 L0 -25 M-7 -32 L7 -32 M0 -38 L-2.4 -32 L0 -25"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="0.4"
            fill="none"
          />
          <circle cx="-2.6" cy="-34.4" r="1.2" fill="#ffffff" opacity="0.9" />
        </g>
      )}
      {art === 'lotus' && (
        <g transform="translate(0 -31)">
          {[-60, -30, 0, 30, 60].map((r) => (
            <path
              key={r}
              d="M0 1 C-3.4 -2 -3 -7 0 -9.5 C3 -7 3.4 -2 0 1 Z"
              fill="#1a1022"
              stroke="#f6dd8a"
              strokeWidth="0.45"
              transform={`rotate(${r})`}
            />
          ))}
          <circle r="1.6" fill={`url(#${u('gold')})`} />
          <path
            d="M-12 4 C-6 2 6 2 12 4"
            stroke="#3e7a5a"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}
      {art === 'ring' && (
        <g transform="translate(0 -32)">
          <ellipse
            rx="8"
            ry="5.6"
            fill="none"
            stroke={`url(#${u('gold')})`}
            strokeWidth="2.4"
          />
          <ellipse
            rx="8"
            ry="5.6"
            fill="none"
            stroke="#fff6d6"
            strokeWidth="0.5"
            strokeOpacity="0.8"
            transform="translate(-0.4 -0.8)"
          />
          <path
            d="M-6 -1 C-3 -3 3 -3 6 -1"
            stroke="#ff9a3c"
            strokeWidth="0.5"
            strokeOpacity="0.9"
            fill="none"
          />
        </g>
      )}
      <rect x="-15" y="-22" width="30" height="3" rx="0.6" fill="#e3dccb" />
      <rect x="-15" y="-18" width="30" height="12" rx="0.8" fill="#ece6d7" />
      <g stroke="#9c9381" strokeWidth="0.6">
        <path d="M-12.5 -14.6 H12.5" />
        <path d="M-12.5 -12 H10" />
        <path d="M-12.5 -9.4 H7" />
      </g>
      {/* Acrylic sheen */}
      <rect
        x="-24"
        y="-68"
        width="48"
        height="68"
        rx="4"
        fill={`url(#${u('sheen')})`}
      />
      <path
        d="M-21.5 -60 V-8"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </g>
  );
}
CardSlabArt.propTypes = {
  ...artPropTypes,
  cardName: PropTypes.string,
  setName: PropTypes.string,
  grade: PropTypes.string,
  art: PropTypes.oneOf(['mox', 'lotus', 'ring']),
};

/* -------------------------------------------------------------------------- */
/* Fender Custom Shop '60s Relic Stratocaster, Olympic White                  */
/* -------------------------------------------------------------------------- */

export function GuitarArt({ transform, className, style }) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('body')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf8f0" />
          <stop offset="0.55" stopColor="#ece5d3" />
          <stop offset="1" stopColor="#c8bfa8" />
        </linearGradient>
        <linearGradient id={u('tort')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a3b1c" />
          <stop offset="0.4" stopColor="#4a1a0b" />
          <stop offset="0.7" stopColor="#7a3216" />
          <stop offset="1" stopColor="#2a0e06" />
        </linearGradient>
        <linearGradient id={u('maple')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1d39a" />
          <stop offset="1" stopColor="#c99a55" />
        </linearGradient>
        <linearGradient id={u('chrome')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#b9c1ce" />
          <stop offset="1" stopColor="#eef1f6" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="0.5" rx="28" ry="2.6" fill="#020617" opacity="0.35" />
      {/* Neck + fretboard */}
      <rect
        x="-4.2"
        y="-120"
        width="8.4"
        height="74"
        rx="1.6"
        fill={`url(#${u('maple')})`}
      />
      <rect x="-3.4" y="-118" width="6.8" height="70" fill="#3d2214" />
      <g stroke="#d9dee6" strokeWidth="0.45">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M-3.4 ${-114 + i * 4.6} H3.4`} />
        ))}
      </g>
      <g fill="#f4efe2">
        <circle cx="0" cy="-102" r="0.8" />
        <circle cx="0" cy="-93" r="0.8" />
        <circle cx="0" cy="-84" r="0.8" />
        <circle cx="-1.4" cy="-70" r="0.7" />
        <circle cx="1.4" cy="-70" r="0.7" />
      </g>
      {/* Headstock */}
      <path
        d="M-4 -119 C-6.4 -125 -7.4 -130 -5.6 -136 C-3.6 -142 2 -148 7 -147 C10.4 -146.4 9.6 -142 6.4 -140 C5 -134 6 -126 4 -119 Z"
        fill={`url(#${u('maple')})`}
      />
      <g fill={`url(#${u('chrome')})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={-6.8 + i * 0.25} cy={-124 - i * 3.8} r="1.5" />
        ))}
      </g>
      <rect x="-4" y="-120" width="8" height="1.4" fill="#f5f0e2" />
      {/* Body */}
      <path
        d="M0 0 C-16 0 -27 -6 -27 -18 C-27 -28 -20.5 -32 -20.5 -38 C-20.5 -44 -27 -50 -25 -58 C-24 -63 -18.5 -64 -15.5 -60 C-12.5 -55 -9 -50 -5 -50 L5 -50 C9 -50 11 -54 14 -57 C17 -60 21.5 -59 21.5 -55 C21.5 -49 18.5 -44 19.5 -39 C20.5 -33 27 -29 27 -18 C27 -6 16 0 0 0 Z"
        fill={`url(#${u('body')})`}
        stroke="#a99f88"
        strokeWidth="0.6"
      />
      {/* Pickguard */}
      <path
        d="M-5 -50.5 L5 -50.5 C9 -50.5 10.5 -46.5 12.5 -42 C10.5 -36 15 -29 14.5 -22 C11 -14 4 -12 -4 -14 C-10 -15.5 -14.5 -22 -16.5 -30 C-17.5 -38 -14.5 -46 -9 -50 Z"
        fill={`url(#${u('tort')})`}
        stroke="#f4efe2"
        strokeWidth="0.7"
      />
      {/* Pickups */}
      <g fill="#f5f0e0" stroke="#bdb39b" strokeWidth="0.4">
        <rect x="-6" y="-43" width="12" height="3.4" rx="1.6" />
        <rect x="-6" y="-35" width="12" height="3.4" rx="1.6" />
        <rect
          x="-6"
          y="-27"
          width="12"
          height="3.4"
          rx="1.6"
          transform="rotate(-8 0 -25.3)"
        />
      </g>
      {/* Bridge, knobs, strings */}
      <rect
        x="-6.5"
        y="-19"
        width="13"
        height="4"
        rx="0.8"
        fill={`url(#${u('chrome')})`}
      />
      <g fill="#f5f0e0" stroke="#bdb39b" strokeWidth="0.4">
        <circle cx="10" cy="-21" r="2" />
        <circle cx="12" cy="-15" r="2" />
        <circle cx="8" cy="-11" r="2" />
      </g>
      <g stroke="#eef1f6" strokeWidth="0.3" strokeOpacity="0.8">
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => (
          <path key={x} d={`M${x} -17 L${x * 0.85} -119`} />
        ))}
      </g>
      {/* Key light on the bass horn */}
      <path
        d="M-24 -56 C-24.6 -50 -21 -44 -20 -40"
        stroke="#ffffff"
        strokeOpacity="0.8"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
GuitarArt.propTypes = artPropTypes;

/* -------------------------------------------------------------------------- */
/* Gift box — oblique, navy with a gold ribbon                                */
/* -------------------------------------------------------------------------- */

export function GiftBoxArt({ transform, className, style, size = 1 }) {
  const u = useSvgIds();
  const w = 40 * size;
  const d = 26 * size;
  const h = 28 * size;
  const lid = 7 * size;
  const front = poly([P(0, 0, 0), P(w, 0, 0), P(w, -h, 0), P(0, -h, 0)]);
  const side = poly([P(w, 0, 0), P(w, 0, d), P(w, -h, d), P(w, -h, 0)]);
  const lidFront = poly([
    P(-2, -h + 1, -1.5),
    P(w + 2, -h + 1, -1.5),
    P(w + 2, -h - lid, -1.5),
    P(-2, -h - lid, -1.5),
  ]);
  const lidSide = poly([
    P(w + 2, -h + 1, -1.5),
    P(w + 2, -h + 1, d + 1.5),
    P(w + 2, -h - lid, d + 1.5),
    P(w + 2, -h - lid, -1.5),
  ]);
  const lidTop = poly([
    P(-2, -h - lid, -1.5),
    P(w + 2, -h - lid, -1.5),
    P(w + 2, -h - lid, d + 1.5),
    P(-2, -h - lid, d + 1.5),
  ]);
  const rw = 5 * size;
  const ribbonFront = poly([
    P(w / 2 - rw / 2, 0, 0),
    P(w / 2 + rw / 2, 0, 0),
    P(w / 2 + rw / 2, -h - lid, -1.5),
    P(w / 2 - rw / 2, -h - lid, -1.5),
  ]);
  const ribbonSide = poly([
    P(w, 0, d / 2 - rw / 2),
    P(w, 0, d / 2 + rw / 2),
    P(w + 2, -h - lid, d / 2 + rw / 2),
    P(w + 2, -h - lid, d / 2 - rw / 2),
  ]);
  const ribbonTopA = poly([
    P(w / 2 - rw / 2, -h - lid, -1.5),
    P(w / 2 + rw / 2, -h - lid, -1.5),
    P(w / 2 + rw / 2, -h - lid, d + 1.5),
    P(w / 2 - rw / 2, -h - lid, d + 1.5),
  ]);
  const ribbonTopB = poly([
    P(-2, -h - lid, d / 2 - rw / 2),
    P(w + 2, -h - lid, d / 2 - rw / 2),
    P(w + 2, -h - lid, d / 2 + rw / 2),
    P(-2, -h - lid, d / 2 + rw / 2),
  ]);
  const [bx, by] = P(w / 2, -h - lid, d / 2);
  const s = size;
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('navy')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#2d5a87" />
          <stop offset="1" stopColor="#0f2744" />
        </linearGradient>
        <linearGradient id={u('navySide')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#163456" />
          <stop offset="1" stopColor="#081a2f" />
        </linearGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
      </defs>
      <ellipse
        cx={w / 2 + 6 * s}
        cy={1}
        rx={w * 0.72}
        ry={3.4 * s}
        fill="#020617"
        opacity="0.35"
      />
      <path d={front} fill={`url(#${u('navy')})`} />
      <path d={side} fill={`url(#${u('navySide')})`} />
      <path d={ribbonFront} fill={`url(#${u('gold')})`} />
      <path d={ribbonSide} fill={`url(#${u('gold')})`} opacity="0.85" />
      <path d={lidFront} fill={`url(#${u('navy')})`} />
      <path d={lidSide} fill={`url(#${u('navySide')})`} />
      <path d={lidTop} fill="#3a6a9a" />
      <path d={ribbonTopA} fill={`url(#${u('gold')})`} />
      <path d={ribbonTopB} fill={`url(#${u('gold')})`} />
      <path
        d={`M${P(-2, -h - lid, -1.5).join(' ')}L${P(w + 2, -h - lid, -1.5).join(' ')}`}
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      {/* Bow */}
      <g transform={`translate(${f(bx)} ${f(by)}) scale(${s})`}>
        <path
          d="M0 0 C-7 -11 -17 -10 -15 -3 C-13.6 1.6 -6 1.6 0 0 Z"
          fill={`url(#${u('gold')})`}
        />
        <path
          d="M0 0 C7 -11 17 -10 15 -3 C13.6 1.6 6 1.6 0 0 Z"
          fill={`url(#${u('gold')})`}
        />
        <path
          d="M-1 1 L-6 9 M1 1 L6 9"
          stroke="#c08a22"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <ellipse cx="0" cy="0" rx="3.2" ry="2.6" fill="#f6d77a" />
        <path
          d="M-12.6 -5 C-10 -8.6 -6 -8 -3.6 -4.4"
          stroke="#fff6d6"
          strokeOpacity="0.8"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
GiftBoxArt.propTypes = { ...artPropTypes, size: PropTypes.number };

/* -------------------------------------------------------------------------- */
/* Gold Cart Commerce card (drawn from its top-left corner, 48 × 30)          */
/* -------------------------------------------------------------------------- */

export function GoldCardArt({ transform, className, style }) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.45" stopColor="#d9a62e" />
          <stop offset="0.75" stopColor="#f0cf6e" />
          <stop offset="1" stopColor="#9c6c15" />
        </linearGradient>
        <linearGradient id={u('chip')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c9" />
          <stop offset="1" stopColor="#b8892a" />
        </linearGradient>
      </defs>
      <rect
        x="1.5"
        y="2.5"
        width="48"
        height="30"
        rx="3.4"
        fill="#020617"
        opacity="0.3"
      />
      <rect width="48" height="30" rx="3.4" fill={`url(#${u('gold')})`} />
      <rect
        x="0.6"
        y="0.6"
        width="46.8"
        height="28.8"
        rx="3"
        fill="none"
        stroke="#fff6d6"
        strokeOpacity="0.6"
        strokeWidth="0.6"
      />
      <rect
        x="6"
        y="9"
        width="9"
        height="7"
        rx="1.3"
        fill={`url(#${u('chip')})`}
      />
      <path
        d="M6 12.5 H15 M10.5 9 V16"
        stroke="#9c6c15"
        strokeWidth="0.4"
        strokeOpacity="0.7"
      />
      <g
        stroke="#0f2744"
        strokeOpacity="0.7"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M38 9.4 C39.6 11 39.6 14 38 15.6" />
        <path d="M40.4 7.8 C42.8 10.4 42.8 14.6 40.4 17.2" />
      </g>
      <text
        x="6"
        y="25"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="3.4"
        fontWeight="800"
        letterSpacing="0.6"
        fill="#0f2744"
        fillOpacity="0.85"
      >
        CART COMMERCE
      </text>
      <path d="M4 3 L22 3 L10 27 L4 27 Z" fill="#ffffff" opacity="0.16" />
    </g>
  );
}
GoldCardArt.propTypes = artPropTypes;

/* -------------------------------------------------------------------------- */
/* Studio creations                                                           */
/* -------------------------------------------------------------------------- */

/** A small, friendly cast member from the shopper's Studio cast. */
function CastFace({ x, y, r, skin, hair, u, kind = 'kid' }) {
  if (kind === 'fox') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path
          d={`M${-r} ${-r * 0.2} L${-r * 0.8} ${-r * 1.4} L${-r * 0.2} ${-r * 0.7} Z`}
          fill="#e8793a"
        />
        <path
          d={`M${r} ${-r * 0.2} L${r * 0.8} ${-r * 1.4} L${r * 0.2} ${-r * 0.7} Z`}
          fill="#e8793a"
        />
        <circle r={r} fill="#f08a45" />
        <path
          d={`M${-r * 0.9} ${r * 0.1} Q0 ${r * 1.3} ${r * 0.9} ${r * 0.1} Q0 ${r * 0.5} ${-r * 0.9} ${r * 0.1} Z`}
          fill="#fff3e6"
        />
        <circle cx={-r * 0.36} cy={-r * 0.12} r={r * 0.12} fill="#1b1d22" />
        <circle cx={r * 0.36} cy={-r * 0.12} r={r * 0.12} fill="#1b1d22" />
        <circle cx="0" cy={r * 0.32} r={r * 0.12} fill="#1b1d22" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={skin} />
      <path
        d={`M${-r} ${-r * 0.05} C${-r} ${-r * 1.25} ${r} ${-r * 1.25} ${r} ${-r * 0.05} C${r * 0.5} ${-r * 0.6} ${-r * 0.4} ${-r * 0.7} ${-r} ${-r * 0.05} Z`}
        fill={hair}
      />
      <circle cx={-r * 0.36} cy={r * 0.1} r={r * 0.11} fill="#1b1d22" />
      <circle cx={r * 0.36} cy={r * 0.1} r={r * 0.11} fill="#1b1d22" />
      <path
        d={`M${-r * 0.3} ${r * 0.42} Q0 ${r * 0.66} ${r * 0.3} ${r * 0.42}`}
        stroke="#1b1d22"
        strokeWidth={r * 0.09}
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={-r * 0.6}
        cy={r * 0.36}
        r={r * 0.16}
        fill="#ff8fa3"
        opacity="0.5"
      />
      <circle
        cx={r * 0.6}
        cy={r * 0.36}
        r={r * 0.16}
        fill="#ff8fa3"
        opacity="0.5"
      />
      <circle
        cx={-r * 0.35}
        cy={-r * 0.5}
        r={r * 0.22}
        fill={`url(#${u('faceLight')})`}
      />
    </g>
  );
}
CastFace.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  r: PropTypes.number.isRequired,
  skin: PropTypes.string,
  hair: PropTypes.string,
  u: PropTypes.func.isRequired,
  kind: PropTypes.oneOf(['kid', 'fox']),
};

function faceLightDef(u) {
  return (
    <radialGradient id={u('faceLight')}>
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
  );
}

/** Personalised hardcover storybook, standing at three-quarter view. */
export function StorybookArt({
  transform,
  className,
  style,
  title = 'Mia & the Moon Fox',
}) {
  const u = useSvgIds();
  const [line1, line2] = title.includes('&')
    ? [title.split('&')[0].trim() + ' &', title.split('&')[1].trim()]
    : [title, ''];
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('cover')} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#24507e" />
          <stop offset="1" stopColor="#0c2240" />
        </linearGradient>
        <radialGradient id={u('moon')} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff7d9" />
          <stop offset="1" stopColor="#f0c75e" />
        </radialGradient>
        <linearGradient id={u('pages')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f8f3e6" />
          <stop offset="1" stopColor="#d9cfb8" />
        </linearGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        {faceLightDef(u)}
      </defs>
      <ellipse cx="4" cy="0.5" rx="34" ry="3" fill="#020617" opacity="0.35" />
      {/* Page block */}
      <path d="M26 -2 L32 -6 L32 -70 L26 -66 Z" fill={`url(#${u('pages')})`} />
      <path d="M-28 -66 L-22 -70 L32 -70 L26 -66 Z" fill="#efe7d4" />
      {/* Cover */}
      <rect
        x="-30"
        y="-66"
        width="56"
        height="66"
        rx="2"
        fill={`url(#${u('cover')})`}
      />
      <rect x="-30" y="-66" width="6" height="66" rx="1.5" fill="#0a1c34" />
      <path d="M-24 -66 V0" stroke="#3f72a6" strokeWidth="0.6" />
      {/* Night sky */}
      <circle cx="12" cy="-50" r="8" fill={`url(#${u('moon')})`} />
      <g fill="#fbe7a1">
        <circle cx="-14" cy="-56" r="0.9" />
        <circle cx="-4" cy="-60" r="0.6" />
        <circle cx="20" cy="-36" r="0.7" />
        <circle cx="-16" cy="-42" r="0.6" />
      </g>
      {/* Hill + cast */}
      <path
        d="M-24 -18 C-12 -30 10 -30 26 -20 L26 -14 L-24 -14 Z"
        fill="#163b62"
      />
      <CastFace x={-6} y={-30} r={6} skin="#f2c7a5" hair="#5b3a29" u={u} />
      <CastFace x={8} y={-28} r={5} kind="fox" u={u} />
      {/* Title */}
      <text
        x="1"
        y="-9"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="5.6"
        fontWeight="700"
        fill={`url(#${u('gold')})`}
        textAnchor="middle"
      >
        {line1}
      </text>
      {line2 && (
        <text
          x="1"
          y="-3"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="5"
          fontWeight="700"
          fill={`url(#${u('gold')})`}
          textAnchor="middle"
        >
          {line2}
        </text>
      )}
      {/* Gloss */}
      <path d="M-22 -64 L-4 -64 L-22 -30 Z" fill="#ffffff" opacity="0.08" />
    </g>
  );
}
StorybookArt.propTypes = { ...artPropTypes, title: PropTypes.string };

/** Framed poster of the shopper's cast. */
export function PosterArt({ transform, className, style }) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('frame')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#c9952a" />
          <stop offset="1" stopColor="#8a5f12" />
        </linearGradient>
        <linearGradient id={u('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb36b" />
          <stop offset="0.55" stopColor="#ff7e8a" />
          <stop offset="1" stopColor="#7a5bb5" />
        </linearGradient>
        {faceLightDef(u)}
      </defs>
      <ellipse cx="3" cy="0.5" rx="32" ry="3" fill="#020617" opacity="0.35" />
      <rect
        x="-30"
        y="-80"
        width="60"
        height="80"
        rx="1.5"
        fill={`url(#${u('frame')})`}
      />
      <rect x="-26" y="-76" width="52" height="72" fill="#f7f3ea" />
      <rect x="-21" y="-71" width="42" height="52" fill={`url(#${u('sky')})`} />
      <circle cx="0" cy="-42" r="11" fill="#ffe3a3" opacity="0.9" />
      <path
        d="M-21 -30 L-8 -44 L2 -34 L10 -42 L21 -30 L21 -19 L-21 -19 Z"
        fill="#3b2f6b"
      />
      <path d="M-21 -24 C-8 -30 8 -30 21 -24 V-19 H-21 Z" fill="#241c48" />
      <CastFace x={-10} y={-28} r={4.4} skin="#8d5a3b" hair="#1b1d22" u={u} />
      <CastFace x={0} y={-30} r={5} skin="#f2c7a5" hair="#c9763a" u={u} />
      <CastFace x={10} y={-28} r={4} kind="fox" u={u} />
      <text
        x="0"
        y="-10"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="5.2"
        fontWeight="700"
        fill="#0f2744"
        textAnchor="middle"
      >
        Our Crew
      </text>
      <text
        x="0"
        y="-6"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="2.4"
        fontWeight="600"
        letterSpacing="0.8"
        fill="#8a5f12"
        textAnchor="middle"
      >
        EST. 2024
      </text>
      <path d="M-26 -76 L-6 -76 L-26 -40 Z" fill="#ffffff" opacity="0.14" />
    </g>
  );
}
PosterArt.propTypes = artPropTypes;

/** Navy hoodie with the shopper's character printed in gold. */
export function HoodieArt({ transform, className, style, name = 'TEAM LEO' }) {
  const u = useSvgIds();
  return (
    <g transform={transform} className={className} style={style}>
      <defs>
        <linearGradient id={u('fleece')} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#2f5d8c" />
          <stop offset="1" stopColor="#0f2744" />
        </linearGradient>
        <linearGradient id={u('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        {faceLightDef(u)}
      </defs>
      <ellipse cx="0" cy="0.5" rx="40" ry="3" fill="#020617" opacity="0.35" />
      {/* Sleeves */}
      <path
        d="M-22 -58 C-32 -54 -38 -40 -40 -10 L-31 -8 C-30 -26 -27 -38 -22 -44 Z"
        fill={`url(#${u('fleece')})`}
      />
      <path
        d="M22 -58 C32 -54 38 -40 40 -10 L31 -8 C30 -26 27 -38 22 -44 Z"
        fill={`url(#${u('fleece')})`}
      />
      <path
        d="M22 -58 C32 -54 38 -40 40 -10 L31 -8 C30 -26 27 -38 22 -44 Z"
        fill={`url(#${u('shade')})`}
      />
      <rect x="-41" y="-12" width="10" height="5" rx="2" fill="#0c213b" />
      <rect x="31" y="-12" width="10" height="5" rx="2" fill="#0c213b" />
      {/* Body */}
      <path
        d="M-22 -58 C-14 -62 14 -62 22 -58 C25 -40 25 -20 24 -4 L-24 -4 C-25 -20 -25 -40 -22 -58 Z"
        fill={`url(#${u('fleece')})`}
      />
      <rect x="-24" y="-6" width="48" height="6" rx="2" fill="#0c213b" />
      {/* Hood */}
      <path
        d="M-14 -60 C-16 -72 -6 -78 0 -78 C6 -78 16 -72 14 -60 C8 -56 -8 -56 -14 -60 Z"
        fill="#24507e"
      />
      <path
        d="M-9 -60 C-8 -68 8 -68 9 -60 C4 -57 -4 -57 -9 -60 Z"
        fill="#0a1c34"
      />
      <path
        d="M-3 -57 L-4 -46 M3 -57 L4 -46"
        stroke="#f4efe2"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Pocket */}
      <path
        d="M-14 -20 L14 -20 L18 -8 L-18 -8 Z"
        fill="#000000"
        opacity="0.16"
      />
      {/* Print */}
      <circle
        cx="0"
        cy="-36"
        r="9.5"
        fill="none"
        stroke={`url(#${u('gold')})`}
        strokeWidth="1"
      />
      <CastFace x={0} y={-36} r={6.5} skin="#f2c7a5" hair="#5b3a29" u={u} />
      <text
        x="0"
        y="-23.4"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="3.6"
        fontWeight="800"
        letterSpacing="0.8"
        fill={`url(#${u('gold')})`}
        textAnchor="middle"
      >
        {name}
      </text>
      <path
        d="M-19 -54 C-21 -40 -21 -24 -20 -10"
        stroke="#ffffff"
        strokeOpacity="0.14"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
HoodieArt.propTypes = { ...artPropTypes, name: PropTypes.string };

/* -------------------------------------------------------------------------- */
/* Registry + standalone wrapper                                              */
/* -------------------------------------------------------------------------- */

export const ART = {
  sneaker: { Art: SneakerArt, box: [-52, -62, 104, 66] },
  headphones: { Art: HeadphonesArt, box: [-44, -62, 88, 66] },
  slab: { Art: CardSlabArt, box: [-30, -72, 60, 76] },
  guitar: { Art: GuitarArt, box: [-40, -150, 80, 154] },
  gift: { Art: GiftBoxArt, box: [-6, -66, 72, 70] },
  storybook: { Art: StorybookArt, box: [-36, -74, 72, 78] },
  poster: { Art: PosterArt, box: [-36, -84, 72, 88] },
  hoodie: { Art: HoodieArt, box: [-44, -82, 88, 86] },
};

/** Renders one art piece as a standalone, self-sizing <svg>. */
export function ProductArt({ kind, className, title }) {
  const { Art, box } = ART[kind];
  return (
    <svg
      viewBox={box.join(' ')}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Art />
    </svg>
  );
}
ProductArt.propTypes = {
  kind: PropTypes.oneOf(Object.keys(ART)).isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
};
