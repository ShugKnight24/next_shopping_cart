import PropTypes from 'prop-types';
import { useId } from 'react';
import styles from './MascotArtwork.module.css';

/*
 * Mascot family design system
 * ---------------------------
 * Every character shares one 160x160 chibi skeleton so the family reads as a set:
 * - Head centred near (80, 60), ~68px wide: a 1:1 head-to-body ratio.
 * - Torso 88-140, feet resting on y=141, ground shadow on y=149.
 * - One key light from the top-left (gradients run light -> dark towards the
 *   bottom-right), a warm gold rim light on the lower-right edge of each head.
 * - Silhouette outlines are OUTLINE wide, interior details DETAIL wide, and each
 *   character's ink is a deep shade of its own main colour.
 * - Shared glossy eyes, blush and open smile so expressions stay consistent.
 * Gradient/clip ids are namespaced per instance with useId to avoid collisions.
 */

const OUTLINE = 2.4;
const DETAIL = 1.4;
const MIRROR = 'matrix(-1 0 0 1 160 0)';
const RIM = '#fff1c2';
const GOLD_STOPS = [
  ['0', '#ffe9a3'],
  ['0.5', '#e7b53c'],
  ['1', '#b8860b'],
];

const TORSO =
  'M57 101 C57 93 67 88 80 88 C93 88 103 93 103 101 L105 128 C105 136 97 140 80 140 C63 140 55 136 55 128 Z';

function useSvgIds() {
  const base = `mascot-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const id = (name) => `${base}-${name}`;
  const url = (name) => `url(#${id(name)})`;
  return { id, url };
}

function animClass(animated, name) {
  return animated ? styles[name] : undefined;
}

function Stops({ stops }) {
  return stops.map(([offset, color, opacity]) => (
    <stop
      key={offset}
      offset={offset}
      stopColor={color}
      stopOpacity={opacity === undefined ? 1 : opacity}
    />
  ));
}

function Linear({ id, stops, vertical = false }) {
  return (
    <linearGradient
      id={id}
      x1={vertical ? '0' : '0.2'}
      y1="0"
      x2={vertical ? '0' : '0.8'}
      y2="1"
    >
      <Stops stops={stops} />
    </linearGradient>
  );
}

function Radial({ id, stops, cx = '0.38', cy = '0.32', r = '0.75' }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      <Stops stops={stops} />
    </radialGradient>
  );
}

/** Elliptical arc helper, angles in degrees (0 = right, 90 = down). */
function arc(cx, cy, rx, ry, a0, a1) {
  const p = (a) => {
    const rad = (a * Math.PI) / 180;
    return `${(cx + rx * Math.cos(rad)).toFixed(2)} ${(cy + ry * Math.sin(rad)).toFixed(2)}`;
  };
  return `M${p(a0)} A${rx} ${ry} 0 0 1 ${p(a1)}`;
}

/** Scalloped ring (lion mane, lace hems). Deterministic, so SSR-safe. */
function scallop(cx, cy, rx, ry, bumps, depth) {
  const pt = (a, k) =>
    `${(cx + (rx + k) * Math.cos(a)).toFixed(2)} ${(cy + (ry + k) * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let i = 0; i < bumps; i += 1) {
    const a0 = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / bumps) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) d += `M${pt(a0, 0)}`;
    d += ` Q${pt((a0 + a1) / 2, depth * 2)} ${pt(a1, 0)}`;
  }
  return `${d} Z`;
}

function Gloss({ cx = 66, cy = 42, rx = 13, ry = 7, rotate = -24 }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#ffffff"
      opacity="0.3"
      transform={`rotate(${rotate} ${cx} ${cy})`}
    />
  );
}

function Rim({ d }) {
  return (
    <path
      d={d}
      stroke={RIM}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.75"
    />
  );
}

/** Shared glossy eye: dark lens, coloured iris glow, key + bounce highlights. */
function Eyes({
  cy,
  gap = 14,
  rx = 5.4,
  ry = 6.4,
  iris,
  lens = '#1d1520',
  animated,
  lashes,
}) {
  return (
    <g className={animClass(animated, 'blinkingEyes')}>
      {[-1, 1].map((side) => {
        const x = 80 + side * gap;
        return (
          <g key={side}>
            {lashes && (
              <path
                d={`M${x + side * rx * 0.55} ${cy - ry * 0.78} l${side * 3.2} -2.6`}
                stroke={lashes}
                strokeWidth={DETAIL + 0.4}
                strokeLinecap="round"
              />
            )}
            <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill={lens} />
            <ellipse
              cx={x}
              cy={cy + ry * 0.34}
              rx={rx * 0.68}
              ry={ry * 0.48}
              fill={iris}
              opacity="0.9"
            />
            <circle
              cx={x - rx * 0.3}
              cy={cy - ry * 0.34}
              r={rx * 0.44}
              fill="#ffffff"
            />
            <circle
              cx={x + rx * 0.4}
              cy={cy + ry * 0.36}
              r={rx * 0.17}
              fill="#ffffff"
              opacity="0.85"
            />
          </g>
        );
      })}
    </g>
  );
}

function Brows({ cy, gap = 14, color, lift = 0 }) {
  return [-1, 1].map((side) => {
    const x = 80 + side * gap;
    return (
      <path
        key={side}
        d={`M${x - 3.8} ${cy + 1 - side * lift} Q${x} ${cy - 1.8} ${x + 3.8} ${cy + 1 + side * lift}`}
        stroke={color}
        strokeWidth={DETAIL + 0.4}
        strokeLinecap="round"
      />
    );
  });
}

function Blush({ cy, gap = 23, color = '#ff8f9c' }) {
  return [-1, 1].map((side) => (
    <ellipse
      key={side}
      cx={80 + side * gap}
      cy={cy}
      rx="5.2"
      ry="3"
      fill={color}
      opacity="0.42"
    />
  ));
}

/** Shared open happy smile with tongue. */
function Smile({ cy, w = 6, h = 5, ink, inner = '#5b2130' }) {
  const mouth = `M${80 - w} ${cy} Q80 ${cy + h * 0.35} ${80 + w} ${cy} Q80 ${cy + h * 1.9} ${80 - w} ${cy} Z`;
  const tongue = `M${80 - w * 0.52} ${cy + h * 0.62} Q80 ${cy + h * 0.22} ${80 + w * 0.52} ${cy + h * 0.62} Q80 ${cy + h * 1.24} ${80 - w * 0.52} ${cy + h * 0.62} Z`;
  return (
    <g>
      <path
        d={mouth}
        fill={inner}
        stroke={ink}
        strokeWidth={DETAIL}
        strokeLinejoin="round"
      />
      <path d={tongue} fill="#f4899a" />
    </g>
  );
}

/** Capsule limb pointing "down" before rotation, with an optional paw. */
function Limb({
  x,
  y,
  angle,
  length = 24,
  width = 12,
  fill,
  stroke,
  paw,
  pawR = 6.6,
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect
        x={-width / 2}
        y={-width / 2}
        width={width}
        height={length}
        rx={width / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={OUTLINE}
      />
      {paw && (
        <circle
          cx="0"
          cy={length - width / 2}
          r={pawR}
          fill={paw}
          stroke={stroke}
          strokeWidth={OUTLINE}
        />
      )}
    </g>
  );
}

function Foot({ fill, stroke, x = 68 }) {
  return (
    <ellipse
      cx={x}
      cy="140.5"
      rx="11"
      ry="6.4"
      fill={fill}
      stroke={stroke}
      strokeWidth={OUTLINE}
    />
  );
}

function Sparkle({ x, y, r, fill }) {
  return (
    <path
      d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`}
      fill={fill}
    />
  );
}

function Star({ x, y, r, fill, stroke }) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.48;
    pts.push(
      `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`
    );
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={fill}
      stroke={stroke}
      strokeWidth={DETAIL}
      strokeLinejoin="round"
    />
  );
}

function MascotFrame({ className, size, label, children }) {
  return (
    <svg
      className={`${styles.mascotSvg} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      <ellipse
        className={styles.groundShadow}
        cx="80"
        cy="149"
        rx="34"
        ry="4.6"
        fill="#0f2744"
        opacity="0.18"
      />
      {children}
    </svg>
  );
}

MascotFrame.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const artPropTypes = { animated: PropTypes.bool };

/* ------------------------------------------------------------------------- */

/**
 * Luna The Cosmic Shepherd - Anatolian Shepherd Astronaut
 * Modeled after user's beloved Anatolian Shepherd:
 * - Warm golden-fawn fur, cream neck/chest, dark charcoal muzzle mask
 * - Distinctive pinkish/white marking across top of nose leather
 * - Folded drop ears, gentle loving amber eyes, curled upward tail
 * - Futuristic white & navy spacesuit with gold trim and "LUNA" name patch
 */
function LunaArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const furInk = '#7a4a22';
  const suitInk = '#2b3f5e';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('fur')}
          stops={[
            ['0', '#f8d39b'],
            ['0.55', '#dfa560'],
            ['1', '#bb7b3d'],
          ]}
        />
        <Linear
          id={id('ear')}
          vertical
          stops={[
            ['0', '#b47a40'],
            ['1', '#4d3526'],
          ]}
        />
        <Linear
          id={id('tail')}
          vertical
          stops={[
            ['0', '#f2c584'],
            ['1', '#c58a48'],
          ]}
        />
        <Radial
          id={id('mask')}
          cx="0.5"
          cy="0.5"
          r="0.5"
          stops={[
            ['0', '#2a2320'],
            ['0.7', '#2f2724', 0.96],
            ['1', '#3a2f28', 0],
          ]}
        />
        <Linear
          id={id('suit')}
          stops={[
            ['0', '#ffffff'],
            ['0.6', '#eaeff6'],
            ['1', '#c3cedd'],
          ]}
        />
        <Linear
          id={id('navy')}
          vertical
          stops={[
            ['0', '#2d5a87'],
            ['1', '#0f2744'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
        <Radial
          id={id('glass')}
          cx="0.5"
          cy="0.45"
          r="0.55"
          stops={[
            ['0', '#dff1ff', 0],
            ['0.75', '#c6e6ff', 0.08],
            ['1', '#9fd2ff', 0.32],
          ]}
        />
      </defs>

      {/* Curled upward tail */}
      <g
        className={animClass(animated, 'waggingTail')}
        style={{ transformOrigin: '60px 124px' }}
      >
        <path
          d="M62 124 C44 127 33 116 36 102 C38 93 47 90 51 96"
          stroke={furInk}
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d="M62 124 C44 127 33 116 36 102 C38 93 47 90 51 96"
          stroke={url('tail')}
          strokeWidth="8.4"
          strokeLinecap="round"
        />
        <path
          d="M37.5 99 C40 93 47 91 51 96"
          stroke="#fff3df"
          strokeWidth="8.4"
          strokeLinecap="round"
        />
      </g>

      {/* Spacesuit torso */}
      <path
        d={TORSO}
        fill={url('suit')}
        stroke={suitInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M56.4 127 C64 132.5 96 132.5 103.6 127"
        stroke={url('gold')}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect
        x="66"
        y="108"
        width="28"
        height="13"
        rx="4"
        fill={url('navy')}
        stroke={url('gold')}
        strokeWidth="1.3"
      />
      <text
        x="80"
        y="117.4"
        fill="#f6cf62"
        fontSize="7.4"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        textAnchor="middle"
        letterSpacing="0.9"
      >
        LUNA
      </text>
      <Rim d="M101 104 L102.6 126" />

      {/* Moon boots */}
      <Foot fill={url('navy')} stroke={suitInk} />
      <Foot fill={url('navy')} stroke={suitInk} x={92} />
      <path
        d="M60 143.5 Q68 146 76 143.5 M84 143.5 Q92 146 100 143.5"
        stroke={url('gold')}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Resting arm */}
      <Limb
        x={60}
        y={104}
        angle={20}
        fill={url('suit')}
        stroke={suitInk}
        paw={url('navy')}
      />

      {/* Drop ears behind the cheeks */}
      {['', MIRROR].map((t) => (
        <path
          key={t || 'l'}
          transform={t || undefined}
          d="M56 36 C45 34 37 44 38 58 C38.6 67 43 74 49 73.6 C55 73 57.6 64 58.6 54 C59.4 46 60 39 56 36 Z"
          fill={url('ear')}
          stroke={furInk}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      ))}

      {/* Head */}
      <path
        d="M80 28 C101 28 114 42 114 61 C114 80 100 92 80 92 C60 92 46 80 46 61 C46 42 59 28 80 28 Z"
        fill={url('fur')}
        stroke={furInk}
        strokeWidth={OUTLINE}
      />
      <path
        d="M56 80 C62 88 70 91 80 91 C90 91 98 88 104 80 C98 84 90 86 80 86 C70 86 62 84 56 80 Z"
        fill="#fff1dc"
        opacity="0.75"
      />
      <Gloss cx={64} cy={41} />
      <Rim d={arc(80, 61, 30.5, 27.5, 18, 62)} />

      {/* Charcoal Anatolian mask */}
      <ellipse cx="80" cy="71" rx="25" ry="21" fill={url('mask')} />
      <ellipse cx="80" cy="79.5" rx="11.5" ry="8.4" fill="#2e2622" />
      <ellipse
        cx="76"
        cy="75.4"
        rx="5"
        ry="2.2"
        fill="#ffffff"
        opacity="0.08"
      />
      <Brows cy={55} color="#e9b77a" lift={0.6} />
      <Eyes cy={64} iris="#f2a93b" lens="#140f0d" animated={animated} />

      {/* Nose with Luna's pink blaze */}
      <path
        d="M74 74.5 C74 71.5 86 71.5 86 74.5 C86 78 82.4 80 80 80 C77.6 80 74 78 74 74.5 Z"
        fill="#120d0b"
      />
      <ellipse cx="80" cy="73.4" rx="4.4" ry="1.5" fill="#f6c3cc" />
      <path d="M80 80 V82.4" stroke="#6f5d55" strokeWidth={DETAIL} />
      <Smile cy={82.6} w={5.4} h={4.4} ink="#6f5d55" inner="#3b1a20" />

      {/* Helmet bubble */}
      <circle
        cx="80"
        cy="60"
        r="44"
        fill={url('glass')}
        stroke="#cfe8ff"
        strokeWidth="1.6"
        opacity="0.95"
      />
      <path
        className={animClass(animated, 'cosmicGlow')}
        d={arc(80, 60, 44, 44, 15, 65)}
        stroke="#7cc8ff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M47 42 C52 32 61 25 73 22.4"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="44.6" cy="50" r="1.8" fill="#ffffff" opacity="0.8" />

      {/* Gold helmet collar */}
      <ellipse
        cx="80"
        cy="98"
        rx="27"
        ry="6.8"
        fill={url('gold')}
        stroke={suitInk}
        strokeWidth={DETAIL + 0.4}
      />
      <ellipse cx="80" cy="97.2" rx="22.4" ry="4.2" fill={url('navy')} />

      {/* Waving paw */}
      <g
        className={animClass(animated, 'wavingPaw')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('suit')}
          stroke={suitInk}
          paw={url('navy')}
        />
      </g>
    </g>
  );
}
LunaArt.propTypes = artPropTypes;

export function LunaSvg({ className = '', size = 124 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Luna The Cosmic Shepherd Mascot"
    >
      <LunaArt />
    </MascotFrame>
  );
}

LunaSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Carty The Courier - Anthropomorphic Courier Robot
 * Navy chassis with gold sensors, glowing visor eyes, pulsing beacon antenna,
 * a parcel tucked under one arm and a friendly wave.
 */
function CartyArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const ink = '#0b1a30';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('navy')}
          stops={[
            ['0', '#3d72aa'],
            ['0.5', '#1e3a5f'],
            ['1', '#0f2744'],
          ]}
        />
        <Linear
          id={id('silver')}
          stops={[
            ['0', '#ffffff'],
            ['0.6', '#e6ecf4'],
            ['1', '#b9c6d8'],
          ]}
        />
        <Linear
          id={id('visor')}
          vertical
          stops={[
            ['0', '#13294a'],
            ['1', '#040b18'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
        <Linear
          id={id('kraft')}
          stops={[
            ['0', '#f0c890'],
            ['1', '#c58b4c'],
          ]}
        />
        <Radial
          id={id('flame')}
          cx="0.5"
          cy="0.3"
          r="0.7"
          stops={[
            ['0', '#fff6cf'],
            ['0.5', '#ffd166', 0.8],
            ['1', '#ffb703', 0],
          ]}
        />
      </defs>

      {/* Hover thrusters */}
      <g className={animClass(animated, 'pulseBeacon')}>
        <ellipse cx="68" cy="146" rx="7" ry="4" fill={url('flame')} />
        <ellipse cx="92" cy="146" rx="7" ry="4" fill={url('flame')} />
      </g>
      {[68, 92].map((x) => (
        <rect
          key={x}
          x={x - 10}
          y="133"
          width="20"
          height="11"
          rx="5.5"
          fill={url('navy')}
          stroke={ink}
          strokeWidth={OUTLINE}
        />
      ))}

      {/* Torso */}
      <path
        d={TORSO}
        fill={url('silver')}
        stroke={ink}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <circle
        cx="80"
        cy="114"
        r="10"
        fill={url('navy')}
        stroke={url('gold')}
        strokeWidth="1.6"
      />
      <path
        d="M73.6 109.6 H75.8 L78 116.4 H85.4 L87.2 111.6 H76.6"
        stroke="#f6cf62"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="79" cy="119.2" r="1.3" fill="#f6cf62" />
      <circle cx="84.6" cy="119.2" r="1.3" fill="#f6cf62" />
      <Rim d="M101 104 L102.6 126" />

      {/* Parcel arm */}
      <Limb
        x={60}
        y={104}
        angle={34}
        length={20}
        fill={url('silver')}
        stroke={ink}
      />
      <g transform="rotate(-8 50 122)">
        <rect
          x="38"
          y="113"
          width="22"
          height="17"
          rx="2.6"
          fill={url('kraft')}
          stroke="#7a4e1e"
          strokeWidth={OUTLINE}
        />
        <path d="M49 113 V130" stroke="#f6cf62" strokeWidth="3" />
        <path d="M38.6 118.4 H59.4" stroke="#a8743a" strokeWidth="1" />
      </g>
      <circle
        cx="56"
        cy="122"
        r="6"
        fill="#ffffff"
        stroke={ink}
        strokeWidth={OUTLINE}
      />

      {/* Antenna & beacon */}
      <path d="M80 30 V17" stroke={ink} strokeWidth={OUTLINE} />
      <circle
        className={animClass(animated, 'pulseBeacon')}
        cx="80"
        cy="13"
        r="8.4"
        fill="#ffd166"
        opacity="0.45"
      />
      <circle
        cx="80"
        cy="13"
        r="4.6"
        fill={url('gold')}
        stroke={ink}
        strokeWidth={DETAIL + 0.4}
      />

      {/* Gold ear sensors */}
      {['', MIRROR].map((t) => (
        <rect
          key={t || 'l'}
          transform={t || undefined}
          x="37"
          y="49"
          width="11"
          height="22"
          rx="5.5"
          fill={url('gold')}
          stroke={ink}
          strokeWidth={OUTLINE}
        />
      ))}

      {/* Head pod */}
      <rect
        x="44"
        y="28"
        width="72"
        height="62"
        rx="28"
        fill={url('navy')}
        stroke={ink}
        strokeWidth={OUTLINE}
      />
      <Gloss cx={62} cy={38} rx={11} ry={5.4} />
      <Rim d="M114 62 C113.4 74 107 84 96 87.6" />

      {/* Visor with glowing eyes */}
      <rect
        x="51"
        y="43"
        width="58"
        height="35"
        rx="17.5"
        fill={url('visor')}
        stroke="#5d8bbf"
        strokeWidth={DETAIL}
      />
      <ellipse cx="66" cy="58" rx="8" ry="8.6" fill="#5fe9ff" opacity="0.16" />
      <ellipse cx="94" cy="58" rx="8" ry="8.6" fill="#5fe9ff" opacity="0.16" />
      <Eyes
        cy={58}
        rx={4.8}
        ry={6}
        lens="#46dcf5"
        iris="#c9fbff"
        animated={animated}
      />
      <path
        d="M72 69 Q80 74.6 88 69"
        stroke="#5fe9ff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="54.6"
        y="66"
        width="6"
        height="2.6"
        rx="1.3"
        fill="#ff9fb0"
        opacity="0.8"
      />
      <rect
        x="99.4"
        y="66"
        width="6"
        height="2.6"
        rx="1.3"
        fill="#ff9fb0"
        opacity="0.8"
      />
      <path
        d="M57 49 C60 46 64 45 68 45"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Waving arm */}
      <g
        className={animClass(animated, 'wavingArm')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('silver')}
          stroke={ink}
          paw="#ffffff"
        />
      </g>
    </g>
  );
}
CartyArt.propTypes = artPropTypes;

export function CartySvg({ className = '', size = 124 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Carty The Courier Mascot"
    >
      <CartyArt />
    </MascotFrame>
  );
}

CartySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Leo The Story Lion - Anthropomorphic Lion Cub Companion
 * Golden cub with a soft scalloped mane, berry painter's beret, paintbrush in
 * paw, tufted tail, blinking eyes and a waving paw.
 */
const LEO_MANE = scallop(80, 60, 39, 36, 13, 3.4);

function LeoArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const ink = '#8a4b16';
  const maneInk = '#6e3510';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('fur')}
          stops={[
            ['0', '#ffe3a0'],
            ['0.55', '#f6ba4a'],
            ['1', '#d98a22'],
          ]}
        />
        <Radial
          id={id('mane')}
          cx="0.4"
          cy="0.35"
          r="0.7"
          stops={[
            ['0', '#ef8f3a'],
            ['0.7', '#c35e1c'],
            ['1', '#94400f'],
          ]}
        />
        <Linear
          id={id('cream')}
          vertical
          stops={[
            ['0', '#fffaf0'],
            ['1', '#f5ddb0'],
          ]}
        />
        <Linear
          id={id('beret')}
          stops={[
            ['0', '#dc8e99'],
            ['0.5', '#b76e79'],
            ['1', '#8b4557'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
      </defs>

      {/* Tufted tail */}
      <g
        className={animClass(animated, 'waggingTail')}
        style={{ transformOrigin: '100px 130px' }}
      >
        <path
          d="M100 130 C116 132 125 122 123 109"
          stroke={ink}
          strokeWidth="9.4"
          strokeLinecap="round"
        />
        <path
          d="M100 130 C116 132 125 122 123 109"
          stroke={url('fur')}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle
          cx="123"
          cy="106"
          r="6.4"
          fill={url('mane')}
          stroke={maneInk}
          strokeWidth={OUTLINE}
        />
      </g>

      {/* Body */}
      <path
        d={TORSO}
        fill={url('fur')}
        stroke={ink}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <ellipse cx="80" cy="120" rx="15" ry="14" fill={url('cream')} />
      <Rim d="M101 104 L102.6 126" />
      <Foot fill={url('fur')} stroke={ink} />
      <Foot fill={url('fur')} stroke={ink} x={92} />
      <path
        d="M66 136.6 V140 M70 136.6 V140 M90 136.6 V140 M94 136.6 V140"
        stroke={ink}
        strokeWidth={DETAIL}
        strokeLinecap="round"
      />

      {/* Paintbrush in paw */}
      <path
        d="M57 132 L43 101"
        stroke={ink}
        strokeWidth="5.6"
        strokeLinecap="round"
      />
      <path
        d="M57 132 L43 101"
        stroke="#b07440"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M45.6 106.6 L43.4 101.8"
        stroke={url('gold')}
        strokeWidth="4.6"
      />
      <path
        d="M43.4 101.8 C40 98 39.4 93 41.4 90.4 C44.4 92.4 45.6 97 44.8 101 Z"
        fill="#4f9cf0"
        stroke="#1f5fa8"
        strokeWidth={DETAIL}
        strokeLinejoin="round"
      />
      <Limb
        x={60}
        y={104}
        angle={26}
        fill={url('fur')}
        stroke={ink}
        paw={url('fur')}
      />

      {/* Mane, ears, head */}
      <path
        d={LEO_MANE}
        fill={url('mane')}
        stroke={maneInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      {['', MIRROR].map((t) => (
        <g key={t || 'l'} transform={t || undefined}>
          <circle
            cx="55"
            cy="38"
            r="9.4"
            fill={url('fur')}
            stroke={ink}
            strokeWidth={OUTLINE}
          />
          <circle cx="55" cy="38.6" r="4.6" fill="#f6a7a0" />
        </g>
      ))}
      <ellipse
        cx="80"
        cy="62"
        rx="31"
        ry="28.4"
        fill={url('fur')}
        stroke={ink}
        strokeWidth={OUTLINE}
      />
      <Gloss cx={66} cy={45} rx={11} ry={6} />
      <Rim d={arc(80, 62, 27.5, 25, 18, 62)} />

      {/* Painter's beret */}
      <path
        d="M57 37 C56 27 69 19.4 85 19.4 C100 19.4 109 25.6 107.6 32.4 C106.4 37.4 95 38.6 82 38 C69 37.4 57.4 41 57 37 Z"
        fill={url('beret')}
        stroke="#6b2f3e"
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M85 19.6 C85.4 16.4 87 15 89 15"
        stroke="#6b2f3e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M66 26.6 C71 23.4 77 22.2 82 22.2"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Face */}
      <Brows cy={51.4} gap={13} color={ink} lift={0.6} />
      <Eyes cy={61} gap={13} iris="#d0812c" animated={animated} />
      <Blush cy={73} gap={22} />
      <path
        d="M67 78 C67 71.4 73.4 69.4 80 72.4 C86.6 69.4 93 71.4 93 78 C93 85 86.6 88 80 86.4 C73.4 88 67 85 67 78 Z"
        fill={url('cream')}
      />
      <path
        d="M75.4 71.6 C75.4 69.4 84.6 69.4 84.6 71.6 C84.6 74.4 81.6 76.4 80 76.4 C78.4 76.4 75.4 74.4 75.4 71.6 Z"
        fill="#7a3b2e"
      />
      <path d="M80 76.4 V78.4" stroke={ink} strokeWidth={DETAIL} />
      <Smile cy={78.6} w={5} h={4} ink={ink} />
      <g fill={ink} opacity="0.55">
        <circle cx="70.4" cy="77" r="0.9" />
        <circle cx="72.6" cy="80" r="0.9" />
        <circle cx="89.6" cy="77" r="0.9" />
        <circle cx="87.4" cy="80" r="0.9" />
      </g>

      {/* Waving paw */}
      <g
        className={animClass(animated, 'wavingPaw')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('fur')}
          stroke={ink}
          paw={url('fur')}
        />
      </g>
    </g>
  );
}
LeoArt.propTypes = artPropTypes;

export function LeoSvg({ className = '', size = 120 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Leo The Story Lion Mascot"
    >
      <LeoArt />
    </MascotFrame>
  );
}

LeoSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Princess Penny - Fairytale & Enchanted Kingdoms Guide
 * Golden flowing locks, gold tiara with ruby, rose ball gown with lace hem,
 * heart brooch, star wand and a waving hand.
 */
const PENNY_LACE = (() => {
  let d = 'M51 136.4';
  for (let i = 0; i < 6; i += 1) {
    const x = 51 + i * 9.67;
    d += ` Q${(x + 4.83).toFixed(2)} 144 ${(x + 9.67).toFixed(2)} 136.4`;
  }
  return d;
})();

function PennyArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const skinInk = '#c0806a';
  const hairInk = '#a86d1c';
  const gownInk = '#9b4a62';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('skin')}
          stops={[
            ['0', '#fff2e8'],
            ['0.6', '#ffdcc6'],
            ['1', '#f2b99d'],
          ]}
        />
        <Linear
          id={id('hair')}
          stops={[
            ['0', '#ffeaa0'],
            ['0.5', '#f6c64c'],
            ['1', '#d4952a'],
          ]}
        />
        <Linear
          id={id('gown')}
          stops={[
            ['0', '#ffd6e0'],
            ['0.55', '#f0a2b7'],
            ['1', '#c96d8a'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
      </defs>

      {/* Flowing hair behind */}
      <path
        d="M45 64 C43 40 58 26 80 26 C102 26 117 40 115 64 C115 84 120 100 112 111 C106 117 98 115 96 108 L64 108 C62 115 54 117 48 111 C40 100 45 84 45 64 Z"
        fill={url('hair')}
        stroke={hairInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />

      {/* Ball gown */}
      <path
        d="M60 103 C59 92 101 92 100 103 L110 135 C111.4 142 100 145 80 145 C60 145 48.6 142 50 135 Z"
        fill={url('gown')}
        stroke={gownInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path d={PENNY_LACE} stroke="#ffffff" strokeWidth="2.2" opacity="0.9" />
      <path
        d="M62 111 C70 114 90 114 98 111"
        stroke={url('gold')}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M80 107.6 C77 104.6 74.6 102.4 74.6 100.2 C74.6 98.4 76 97.2 77.6 97.2 C78.6 97.2 79.5 97.8 80 98.6 C80.5 97.8 81.4 97.2 82.4 97.2 C84 97.2 85.4 98.4 85.4 100.2 C85.4 102.4 83 104.6 80 107.6 Z"
        fill={url('gold')}
        stroke="#9a6a0c"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <Rim d="M103 106 L108.6 132" />

      {/* Wand arm */}
      <path
        d="M51 128 L39 100"
        stroke="#9a6a0c"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M51 128 L39 100"
        stroke={url('gold')}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Star x={37.6} y={94.6} r={8.4} fill={url('gold')} stroke="#9a6a0c" />
      <circle cx="35.6" cy="92.4" r="1.6" fill="#ffffff" />
      <g className={animClass(animated, 'cosmicGlow')}>
        <Sparkle x={26} y={86} r={3.4} fill="#ffd166" />
        <Sparkle x={47} y={84} r={2.4} fill="#ffffff" />
      </g>
      <Limb
        x={60}
        y={104}
        angle={24}
        length={22}
        width={10}
        fill={url('skin')}
        stroke={skinInk}
        paw={url('skin')}
        pawR={5.6}
      />
      <circle
        cx="60.4"
        cy="101"
        r="7"
        fill={url('gown')}
        stroke={gownInk}
        strokeWidth={OUTLINE}
      />

      {/* Face */}
      <ellipse
        cx="80"
        cy="64"
        rx="27"
        ry="26"
        fill={url('skin')}
        stroke={skinInk}
        strokeWidth={OUTLINE}
      />
      <Rim d={arc(80, 64, 23.6, 22.6, 22, 62)} />
      <Eyes
        cy={67}
        gap={12.4}
        rx={5}
        ry={6}
        iris="#7b6be0"
        lens="#24183a"
        animated={animated}
        lashes="#24183a"
      />
      <Blush cy={77} gap={20} />
      <Smile cy={80} w={4.4} h={3.6} ink={skinInk} inner="#7a2b3c" />

      {/* Bangs & side locks */}
      <path
        d="M52.6 60 C51 41 63 32 80 32 C97 32 109 41 107.4 60 C101 51 93 46.6 85 47 C86.6 50 86.4 53.4 84.4 55.6 C80.6 50 72.4 47 64.4 50.4 C59.6 52.6 55.6 56 52.6 60 Z"
        fill={url('hair')}
        stroke={hairInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      {['', MIRROR].map((t) => (
        <path
          key={t || 'l'}
          transform={t || undefined}
          d="M53 57 C48.6 69 49.6 81 56.6 89.6 C56.4 79 56 67 58.4 58.6 Z"
          fill={url('hair')}
          stroke={hairInk}
          strokeWidth={DETAIL + 0.6}
          strokeLinejoin="round"
        />
      ))}
      <Gloss cx={68} cy={40} rx={9} ry={4} rotate={-16} />

      {/* Tiara */}
      <path
        d="M65.4 35.6 L68.4 25 L74 31 L80 20.4 L86 31 L91.6 25 L94.6 35.6 C88 33.6 72 33.6 65.4 35.6 Z"
        fill={url('gold')}
        stroke="#9a6a0c"
        strokeWidth={DETAIL + 0.4}
        strokeLinejoin="round"
      />
      <circle
        cx="80"
        cy="29.6"
        r="2.8"
        fill="#e23a6a"
        stroke="#8e1a3e"
        strokeWidth="0.9"
      />
      <circle cx="79.2" cy="28.8" r="0.9" fill="#ffffff" />
      <circle cx="68.4" cy="25" r="1.4" fill="#fff6dc" />
      <circle cx="91.6" cy="25" r="1.4" fill="#fff6dc" />

      {/* Waving hand */}
      <g
        className={animClass(animated, 'wavingArm')}
        style={{ transformOrigin: '100px 104px' }}
      >
        <Limb
          x={100}
          y={104}
          angle={-138}
          length={22}
          width={10}
          fill={url('skin')}
          stroke={skinInk}
          paw={url('skin')}
          pawR={5.6}
        />
      </g>
      <circle
        cx="99.6"
        cy="101"
        r="7"
        fill={url('gown')}
        stroke={gownInk}
        strokeWidth={OUTLINE}
      />
    </g>
  );
}
PennyArt.propTypes = artPropTypes;

export function PennySvg({ className = '', size = 120 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Princess Penny Mascot"
    >
      <PennyArt />
    </MascotFrame>
  );
}

PennySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Dexter The Dino Explorer - Prehistoric & Space Adventure Guide
 * Leaf-green dino with orange spikes, safari hat with compass badge, khaki
 * explorer vest, baby-tooth grin, wagging spiked tail and a waving claw.
 */
function DexterArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const ink = '#2c6a3a';
  const khakiInk = '#8a6a36';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('scales')}
          stops={[
            ['0', '#b6ec92'],
            ['0.55', '#72c46a'],
            ['1', '#3f9653'],
          ]}
        />
        <Linear
          id={id('belly')}
          vertical
          stops={[
            ['0', '#fffbe2'],
            ['1', '#ecdea0'],
          ]}
        />
        <Linear
          id={id('spike')}
          vertical
          stops={[
            ['0', '#ffcf7a'],
            ['1', '#ef8424'],
          ]}
        />
        <Linear
          id={id('khaki')}
          stops={[
            ['0', '#f6e7bf'],
            ['0.55', '#dcc184'],
            ['1', '#b8955a'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
      </defs>

      {/* Spiked tail */}
      <g
        className={animClass(animated, 'waggingTail')}
        style={{ transformOrigin: '60px 122px' }}
      >
        {[
          [32, 110],
          [41, 113.4],
          [50, 114.6],
        ].map(([x, y]) => (
          <path
            key={x}
            d={`M${x - 4} ${y + 1} L${x} ${y - 7} L${x + 4} ${y + 1} Z`}
            fill={url('spike')}
            stroke="#b85a14"
            strokeWidth={DETAIL}
            strokeLinejoin="round"
          />
        ))}
        <path
          d="M62 127 C47 129.6 33 125 25 114 C23.4 111.4 25.6 108.8 28.6 110.2 C39 115 50 115.4 61 112 Z"
          fill={url('scales')}
          stroke={ink}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      </g>

      {/* Body + explorer vest */}
      <path
        d={TORSO}
        fill={url('scales')}
        stroke={ink}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <ellipse cx="80" cy="121" rx="14" ry="14.6" fill={url('belly')} />
      <path
        d="M70 116 H90 M68 122 H92 M70 128 H90"
        stroke="#d6c47e"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {['', MIRROR].map((t) => (
        <g key={t || 'l'} transform={t || undefined}>
          <path
            d="M58.6 99 C61 93.6 66 90.6 72 90.4 L70.4 132 C64 132.4 58.4 131 55.8 127.6 Z"
            fill={url('khaki')}
            stroke={khakiInk}
            strokeWidth={DETAIL + 0.4}
            strokeLinejoin="round"
          />
          <rect
            x="60"
            y="112"
            width="8"
            height="7"
            rx="1.6"
            fill="#c9aa6c"
            stroke={khakiInk}
            strokeWidth="1"
          />
        </g>
      ))}
      <Rim d="M101 104 L102.6 126" />
      <Foot fill={url('scales')} stroke={ink} />
      <Foot fill={url('scales')} stroke={ink} x={92} />
      <g fill="#fffbe2">
        <circle cx="62.6" cy="141.6" r="1.6" />
        <circle cx="67.6" cy="143" r="1.6" />
        <circle cx="92.4" cy="143" r="1.6" />
        <circle cx="97.4" cy="141.6" r="1.6" />
      </g>
      <Limb
        x={60}
        y={104}
        angle={22}
        fill={url('scales')}
        stroke={ink}
        paw={url('scales')}
      />

      {/* Head */}
      <path
        d="M80 30 C102 30 116 43 116 61 C116 79 103 92 80 92 C57 92 44 79 44 61 C44 43 58 30 80 30 Z"
        fill={url('scales')}
        stroke={ink}
        strokeWidth={OUTLINE}
      />
      <path
        d="M56 76 C60 88 70 91 80 91 C90 91 100 88 104 76 C96 81 88 82 80 82 C72 82 64 81 56 76 Z"
        fill={url('belly')}
        opacity="0.9"
      />
      <Rim d={arc(80, 61, 32.5, 27.5, 20, 60)} />
      <circle cx="58" cy="54" r="2" fill="#4f9f55" opacity="0.6" />
      <circle cx="104" cy="50" r="2.4" fill="#4f9f55" opacity="0.6" />
      <Brows cy={51} gap={15} color={ink} lift={0.8} />
      <Eyes cy={60.6} gap={15} iris="#c98a2e" animated={animated} />
      <Blush cy={72} gap={25} />
      <circle cx="75.6" cy="72" r="1.3" fill={ink} />
      <circle cx="84.4" cy="72" r="1.3" fill={ink} />
      <path
        d="M66 77.6 Q80 81 94 77.6 Q80 92 66 77.6 Z"
        fill="#5b2130"
        stroke={ink}
        strokeWidth={DETAIL}
        strokeLinejoin="round"
      />
      <path d="M73 82.4 Q80 79.4 87 82.4 Q80 88 73 82.4 Z" fill="#f4899a" />
      <path d="M70.6 78.6 L72.4 82 L74.4 79 Z" fill="#ffffff" />

      {/* Safari hat */}
      <g transform="rotate(-6 80 36)">
        <ellipse
          cx="80"
          cy="38"
          rx="38"
          ry="7.6"
          fill={url('khaki')}
          stroke={khakiInk}
          strokeWidth={OUTLINE}
        />
        <path
          d="M58 38 C58 22 68 14.6 80 14.6 C92 14.6 102 22 102 38 C94 40.4 66 40.4 58 38 Z"
          fill={url('khaki')}
          stroke={khakiInk}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <path
          d="M58.6 32.4 C66 35.4 94 35.4 101.4 32.4 L101.8 37.6 C94 40.6 66 40.6 58.2 37.6 Z"
          fill="#1e3a5f"
        />
        <path
          d="M74 17.4 C78 20 82 20 86 17.4"
          stroke={khakiInk}
          strokeWidth={DETAIL}
          strokeLinecap="round"
        />
        <circle
          cx="80"
          cy="35.6"
          r="4.4"
          fill={url('gold')}
          stroke="#7a5408"
          strokeWidth="1"
        />
        <path d="M80 32.4 L81.2 35.6 L80 38.8 L78.8 35.6 Z" fill="#1e3a5f" />
        <path
          d="M64 25 C67 20.4 71 18 75 17.4"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Waving claw */}
      <g
        className={animClass(animated, 'wavingPaw')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('scales')}
          stroke={ink}
          paw={url('scales')}
        />
        <g fill="#fffbe2">
          <circle cx="115.8" cy="87.6" r="1.4" />
          <circle cx="118.4" cy="90.2" r="1.4" />
          <circle cx="113" cy="85.2" r="1.4" />
        </g>
      </g>
    </g>
  );
}
DexterArt.propTypes = artPropTypes;

export function DexterSvg({ className = '', size = 120 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Dexter The Dino Explorer Mascot"
    >
      <DexterArt />
    </MascotFrame>
  );
}

DexterSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Sparky The Sneaker Hound - Streetwear & Hype Drop Specialist
 * Caramel hound with floppy ears, backward snapback, gold-rimmed shades slid
 * down the nose, navy hoodie with high-top kick crest and fresh high-tops.
 */
function SparkyArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const furInk = '#7a4318';
  const navyInk = '#0b1a30';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('fur')}
          stops={[
            ['0', '#f9cf9c'],
            ['0.55', '#e59c56'],
            ['1', '#c07234'],
          ]}
        />
        <Linear
          id={id('ear')}
          vertical
          stops={[
            ['0', '#93522a'],
            ['1', '#552910'],
          ]}
        />
        <Linear
          id={id('white')}
          vertical
          stops={[
            ['0', '#ffffff'],
            ['1', '#f1e6d8'],
          ]}
        />
        <Linear
          id={id('hoodie')}
          stops={[
            ['0', '#3a6c9e'],
            ['0.5', '#1e3a5f'],
            ['1', '#0f2744'],
          ]}
        />
        <Linear
          id={id('cap')}
          stops={[
            ['0', '#3a404f'],
            ['1', '#11141b'],
          ]}
        />
        <Linear
          id={id('lens')}
          stops={[
            ['0', '#4a5f8a'],
            ['1', '#0b1222'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
      </defs>

      {/* Hoodie */}
      <path
        d={TORSO}
        fill={url('hoodie')}
        stroke={navyInk}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M56.4 127.4 C64 132.4 96 132.4 103.6 127.4"
        stroke="#0b1a30"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M75 99 V106 M85 99 V106"
        stroke={url('gold')}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="75" cy="106.6" r="1.4" fill="#e7b53c" />
      <circle cx="85" cy="106.6" r="1.4" fill="#e7b53c" />
      <circle
        cx="80"
        cy="117"
        r="8.6"
        fill="#0f2744"
        stroke={url('gold')}
        strokeWidth="1.6"
      />
      <path
        d="M73.6 120 V113.6 C73.6 113 74.1 112.6 74.6 112.6 H78 L79 115 L84.6 116.4 C86 116.8 86.8 117.8 86.8 119 V120 Z"
        fill="#ffffff"
      />
      <path d="M73.6 120.4 H86.8" stroke="#e0483e" strokeWidth="1.4" />
      <Rim d="M101 104 L102.6 126" />

      {/* High-top sneakers */}
      {[68, 92].map((x) => (
        <g key={x}>
          <rect
            x={x - 8}
            y="125.6"
            width="16"
            height="12"
            rx="4.6"
            fill={url('white')}
            stroke={navyInk}
            strokeWidth={OUTLINE}
          />
          <path
            d={`M${x - 6.4} 128.4 H${x + 6.4}`}
            stroke="#e0483e"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <ellipse
            cx={x}
            cy="140.4"
            rx="12.4"
            ry="6.4"
            fill={url('white')}
            stroke={navyInk}
            strokeWidth={OUTLINE}
          />
          <path
            d={`M${x - 11.6} 142.4 Q${x} 149.4 ${x + 11.6} 142.4`}
            stroke="#c98a4a"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d={`M${x - 6} 133.6 Q${x} 135.4 ${x + 6} 131.4`}
            stroke={url('gold')}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={`M${x - 3.4} 137.4 H${x + 3.4} M${x - 2.6} 139.8 H${x + 2.6}`}
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      ))}

      <Limb
        x={60}
        y={104}
        angle={20}
        fill={url('hoodie')}
        stroke={navyInk}
        paw={url('fur')}
      />

      {/* Hood + drawstrings */}
      <ellipse
        cx="80"
        cy="95"
        rx="22"
        ry="6.6"
        fill="#16304f"
        stroke={navyInk}
        strokeWidth={OUTLINE}
      />

      {/* Head */}
      <path
        d="M80 30 C100 30 113 43 113 61 C113 79 100 91 80 91 C60 91 47 79 47 61 C47 43 60 30 80 30 Z"
        fill={url('fur')}
        stroke={furInk}
        strokeWidth={OUTLINE}
      />
      <path
        d="M76.6 42 C78.6 40.6 81.4 40.6 83.4 42 L85.4 63 C92 65 96.4 70.6 96.4 77.6 C96.4 85.6 89.6 90.6 80 90.6 C70.4 90.6 63.6 85.6 63.6 77.6 C63.6 70.6 68 65 74.6 63 Z"
        fill={url('white')}
      />
      <Rim d={arc(80, 61, 29.5, 26.5, 18, 58)} />
      {['', MIRROR].map((t) => (
        <path
          key={t || 'l'}
          transform={t || undefined}
          d="M53 40 C43 40 36.6 52 38 69 C39 81 43.6 89.6 50 88 C56 86.4 58.4 75 58.4 63 C58.4 53 58.6 44 53 40 Z"
          fill={url('ear')}
          stroke={furInk}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      ))}
      <Brows cy={49.6} gap={14} color={furInk} lift={-0.6} />
      <Eyes cy={58} gap={14} rx={5} ry={6} iris="#9a5a24" animated={animated} />

      {/* Shades slid down the nose */}
      {['', MIRROR].map((t) => (
        <path
          key={t || 'l'}
          transform={t || undefined}
          d="M60 63.6 H76.4 C76.4 70 73.2 73.4 68.2 73.4 C63.2 73.4 60 70 60 63.6 Z"
          fill={url('lens')}
          stroke={url('gold')}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ))}
      <path
        d="M76.4 64.4 Q80 62.6 83.6 64.4"
        stroke="#b8860b"
        strokeWidth="1.8"
      />
      <path
        d="M63 65.6 L66.4 65.6 M87 65.6 L90.4 65.6"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M74.4 76.4 C74.4 74 85.6 74 85.6 76.4 C85.6 79.4 82.2 81.4 80 81.4 C77.8 81.4 74.4 79.4 74.4 76.4 Z"
        fill="#1a1210"
      />
      <ellipse
        cx="78"
        cy="75.8"
        rx="1.8"
        ry="0.9"
        fill="#ffffff"
        opacity="0.7"
      />
      <path d="M80 81.4 V83" stroke={furInk} strokeWidth={DETAIL} />
      <Smile cy={83.2} w={5.2} h={3.8} ink={furInk} />

      {/* Backward snapback */}
      <path
        d="M53 41 C44 39.4 35.6 41.6 31.4 46 C35.6 48.6 44.6 48.4 53.6 46 Z"
        fill="#11141b"
        stroke="#05070a"
        strokeWidth={DETAIL + 0.4}
        strokeLinejoin="round"
      />
      <path
        d="M50 47 C49.6 31 63 22.4 80 22.4 C97 22.4 110.4 31 110 47 C99 42.6 61 42.6 50 47 Z"
        fill={url('cap')}
        stroke="#05070a"
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M73.4 44.4 C73.6 39.6 86.4 39.6 86.6 44.4"
        fill={url('fur')}
        stroke="#05070a"
        strokeWidth={DETAIL}
      />
      <path d="M74.4 41.6 H85.6" stroke={url('gold')} strokeWidth="1.6" />
      <circle cx="80" cy="22.8" r="2.4" fill={url('gold')} />
      <path
        d="M58 31 C63 27 69 25.2 75 25"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Waving paw with gold wristband */}
      <g
        className={animClass(animated, 'wavingPaw')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('hoodie')}
          stroke={navyInk}
          paw={url('fur')}
        />
        <path
          d="M104.8 92.6 L112 99"
          stroke={url('gold')}
          strokeWidth="4.4"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
SparkyArt.propTypes = artPropTypes;

export function SparkySvg({ className = '', size = 120 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Sparky The Sneaker Hound Mascot"
    >
      <SparkyArt />
    </MascotFrame>
  );
}

SparkySvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * Finley The Starlight Fox - The Little Prince Celestial Fox
 * Warm amber coat, bushy white-tipped tail, flowing starry sky-blue scarf,
 * delicate pointed ears, soulful amber eyes and a twinkle of stardust.
 */
const FINLEY_TAIL =
  'M62 129 C44 133 26 123 24 105 C22.6 91 30 79 40.6 74.6 C38.6 87 42.6 98.6 52.4 104.6 C58.4 108.4 62.4 113 64 119 Z';

function FinleyArt({ animated = true }) {
  const { id, url } = useSvgIds();
  const ink = '#9a3f12';
  const paws = '#3e2618';
  return (
    <g className={animClass(animated, 'floatBody')}>
      <defs>
        <Linear
          id={id('fur')}
          stops={[
            ['0', '#ffcd8a'],
            ['0.5', '#fb933e'],
            ['1', '#de5c1d'],
          ]}
        />
        <Linear
          id={id('white')}
          vertical
          stops={[
            ['0', '#ffffff'],
            ['1', '#fbeadb'],
          ]}
        />
        <Linear
          id={id('scarf')}
          stops={[
            ['0', '#c8edff'],
            ['0.5', '#5bbcf2'],
            ['1', '#2b84cf'],
          ]}
        />
        <Linear id={id('gold')} stops={GOLD_STOPS} />
        <clipPath id={id('tailClip')}>
          <path d={FINLEY_TAIL} />
        </clipPath>
      </defs>

      {/* Stardust */}
      <g className={animClass(animated, 'cosmicGlow')}>
        <Sparkle x={28} y={46} r={4} fill="#ffd166" />
        <Sparkle x={134} y={34} r={3} fill="#9fdcff" />
        <Sparkle x={140} y={64} r={2.2} fill="#ffd166" />
        <Sparkle x={18} y={74} r={2.2} fill="#9fdcff" />
      </g>

      {/* Bushy white-tipped tail */}
      <g
        className={animClass(animated, 'waggingTail')}
        style={{ transformOrigin: '62px 124px' }}
      >
        <path d={FINLEY_TAIL} fill={url('fur')} />
        <g clipPath={url('tailClip')}>
          <path d="M14 96 C24 92 34 84 44 70 L10 60 Z" fill={url('white')} />
        </g>
        <path
          d={FINLEY_TAIL}
          stroke={ink}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
      </g>

      {/* Body */}
      <path
        d={TORSO}
        fill={url('fur')}
        stroke={ink}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M68 98 C69.6 108 74 114 80 117.6 C86 114 90.4 108 92 98 Z"
        fill={url('white')}
      />
      <Rim d="M101 104 L102.6 126" />
      <Foot fill={paws} stroke={ink} />
      <Foot fill={paws} stroke={ink} x={92} />
      <Limb
        x={60}
        y={104}
        angle={20}
        fill={url('fur')}
        stroke={ink}
        paw={paws}
      />

      {/* Pointed ears */}
      {['', MIRROR].map((t) => (
        <g key={t || 'l'} transform={t || undefined}>
          <path
            d="M53.4 52 C47.6 40 46 25 48 15 C48.6 12 51.6 11.6 53.6 13.4 C62 20.6 69.6 30 74 39 Z"
            fill={url('fur')}
            stroke={ink}
            strokeWidth={OUTLINE}
            strokeLinejoin="round"
          />
          <path
            d="M55 45 C51.4 37 50.4 27.6 51.4 20.6 C57 25.6 62.6 32 66.4 38.6 Z"
            fill="#ffe2c4"
          />
          <path
            d="M48.2 22 C47.8 19.4 47.7 17 48 15 C48.6 12 51.6 11.6 53.6 13.4 C55.4 15 57.2 16.8 59 18.8 C55.6 20.6 51.6 21.8 48.2 22 Z"
            fill={paws}
          />
        </g>
      ))}

      {/* Head */}
      <path
        d="M80 34 C98 34 110 44 113 58 C114.2 64 116 70 120.4 76 C112 80.4 104 88 94 91 C89 92.8 85 93.6 80 93.6 C75 93.6 71 92.8 66 91 C56 88 48 80.4 39.6 76 C44 70 45.8 64 47 58 C50 44 62 34 80 34 Z"
        fill={url('fur')}
        stroke={ink}
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <path
        d="M41.6 76.4 C50 78 58 76.4 64 70.6 C70 66 76 68 80 72 C84 68 90 66 96 70.6 C102 76.4 110 78 118.4 76.4 C110 84 100 92 80 93 C60 92 50 84 41.6 76.4 Z"
        fill={url('white')}
      />
      <Gloss cx={66} cy={45} rx={11} ry={5.6} />
      <Rim d="M110.6 60 C111.6 66 113.4 70.6 116 74" />
      <Brows cy={53} gap={14} color={ink} lift={0.6} />
      <Eyes cy={62.4} iris="#f0a030" lens="#2a140a" animated={animated} />
      <Blush cy={75} gap={24} />
      <path
        d="M76 75.6 C76 73.6 84 73.6 84 75.6 C84 78 81.6 79.6 80 79.6 C78.4 79.6 76 78 76 75.6 Z"
        fill="#1f120c"
      />
      <path d="M80 79.6 V81" stroke={ink} strokeWidth={DETAIL} />
      <Smile cy={81.2} w={4.6} h={3.6} ink={ink} />

      {/* Celestial scarf */}
      <path
        d="M58 90 C66 98 94 98 102 90 C104.4 94 104.4 98 102.4 101.4 C94 108 66 108 57.6 101.4 C55.6 98 55.6 94 58 90 Z"
        fill={url('scarf')}
        stroke="#1f5f9a"
        strokeWidth={OUTLINE}
        strokeLinejoin="round"
      />
      <g
        className={animClass(animated, 'scarfFlutter')}
        style={{ transformOrigin: '96px 101px' }}
      >
        <path
          d="M95 100 C105 104.6 116 103 126.6 95 C125 103 121 109 113 112.6 C119 113 123 114.6 127 112.6 C121 121 108 121 97.6 110 Z"
          fill={url('scarf')}
          stroke="#1f5f9a"
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <Star x={114} y={108} r={2.6} fill="#ffd166" />
      </g>
      <Star x={70} y={100.6} r={2.6} fill="#ffd166" />
      <Star x={85} y={102.6} r={2.2} fill="#ffd166" />

      {/* Waving paw */}
      <g
        className={animClass(animated, 'wavingPaw')}
        style={{ transformOrigin: '101px 104px' }}
      >
        <Limb
          x={101}
          y={104}
          angle={-138}
          length={23}
          fill={url('fur')}
          stroke={ink}
          paw={paws}
        />
      </g>
    </g>
  );
}
FinleyArt.propTypes = artPropTypes;

export function FoxSvg({ className = '', size = 124 }) {
  return (
    <MascotFrame
      className={className}
      size={size}
      label="Finley The Starlight Fox Mascot"
    >
      <FinleyArt />
    </MascotFrame>
  );
}

FoxSvg.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

/**
 * MascotThumbnail - Crisp Illustrated Mini Avatar
 * Renders a static bust crop of the full character art inside a navy badge
 * for the character switcher and studio co-star selector.
 */
const THUMBNAILS = {
  luna: { Art: LunaArt, ring: '#e7b53c', bg: ['#2d5a87', '#0f2744'] },
  carty: { Art: CartyArt, ring: '#e7b53c', bg: ['#e6eef8', '#b9c9de'] },
  leo: { Art: LeoArt, ring: '#f6ba4a', bg: ['#fff3d6', '#f2cf8a'] },
  penny: { Art: PennyArt, ring: '#e7b53c', bg: ['#ffe8ef', '#f4bccb'] },
  dexter: { Art: DexterArt, ring: '#72c46a', bg: ['#effae4', '#c6e8b0'] },
  sparky: { Art: SparkyArt, ring: '#e7b53c', bg: ['#2d5a87', '#0f2744'] },
  finley: { Art: FinleyArt, ring: '#5bbcf2', bg: ['#2d5a87', '#0f2744'] },
};

export function MascotThumbnail({ mascotId, size = 36, className = '' }) {
  const { id, url } = useSvgIds();
  const { Art, ring, bg } = THUMBNAILS[mascotId] || THUMBNAILS.carty;
  return (
    <svg
      width={size}
      height={size}
      viewBox="28 10 104 104"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <Radial
          id={id('bg')}
          cx="0.38"
          cy="0.3"
          r="0.8"
          stops={[
            ['0', bg[0]],
            ['1', bg[1]],
          ]}
        />
        <clipPath id={id('clip')}>
          <circle cx="80" cy="62" r="50" />
        </clipPath>
      </defs>
      <circle cx="80" cy="62" r="50" fill={url('bg')} />
      <g clipPath={url('clip')}>
        <Art animated={false} />
      </g>
      <circle cx="80" cy="62" r="49" stroke={ring} strokeWidth="4" />
    </svg>
  );
}

MascotThumbnail.propTypes = {
  mascotId: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
};
