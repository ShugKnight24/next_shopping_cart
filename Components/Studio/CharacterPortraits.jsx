import PropTypes from 'prop-types';
import { useId } from 'react';
import styles from './CharacterPortraits.module.css';
import {
  BUILDS,
  PET_SIZES,
  SKIN_TONES,
  contrastInk,
  findById,
  findByValue,
  normalizeAvatar,
  normalizeCompanion,
  shade,
} from './core/characterSchema';
import {
  MascotCartySvg,
  MascotDexterSvg,
  MascotFinleySvg,
  MascotLeoSvg,
  MascotLunaSvg,
  MascotPennySvg,
  MascotSparkySvg,
} from './StudioSVGs';

/**
 * The two live SVG portraits, lifted verbatim out of the old `CharacterCreator`
 * picker so the workbench cast panel can draw them without dragging the whole
 * editor along. The geometry is hand-tuned; treat it as artwork, not code.
 *
 * `core/characterSchema` still owns every option these read, so this module and
 * the canvas renderer in `drawCharacter` stay two views of one table.
 */

/* Species stay local: they bind components from `StudioSVGs`. */

export const PET_SPECIES = [
  {
    id: 'leo',
    name: 'Leo The Story Lion',
    archetype: 'Courage Lion',
    Svg: MascotLeoSvg,
  },
  {
    id: 'penny',
    name: 'Princess Penny',
    archetype: 'Royal Kitty',
    Svg: MascotPennySvg,
  },
  {
    id: 'finley',
    name: 'Finley Fox',
    archetype: 'Celestial Fox',
    Svg: MascotFinleySvg,
  },
  {
    id: 'luna',
    name: 'Luna Shepherd',
    archetype: 'Starlight Pup',
    Svg: MascotLunaSvg,
  },
  {
    id: 'dexter',
    name: 'Dexter Dino',
    archetype: 'Explorer Dino',
    Svg: MascotDexterSvg,
  },
  {
    id: 'carty',
    name: 'Carty Courier',
    archetype: 'Courier Bot',
    Svg: MascotCartySvg,
  },
  {
    id: 'sparky',
    name: 'Sparky Hound',
    archetype: 'Hero Dragon Hound',
    Svg: MascotSparkySvg,
  },
];

export const DEFAULT_PET_NAMES = {
  leo: 'Leo',
  penny: 'Penny',
  finley: 'Finley',
  luna: 'Luna',
  dexter: 'Dexter',
  carty: 'Carty',
  sparky: 'Sparky',
};

/* ---------------------------------------------------------------- portrait -- */

const TORSO_PATHS = {
  tee: 'M56 98 Q80 91 104 98 L108 152 Q80 159 52 152 Z',
  hoodie: 'M54 100 Q80 93 106 100 L110 156 Q80 163 50 156 Z',
  dungarees: 'M56 98 Q80 91 104 98 L106 152 Q80 159 54 152 Z',
  dress: 'M56 98 Q80 91 104 98 L120 161 Q80 172 40 161 Z',
  hero_suit: 'M56 98 Q80 90 104 98 L106 150 Q80 160 54 150 Z',
  space_suit: 'M52 100 Q80 92 108 100 L112 154 Q80 163 48 154 Z',
  explorer: 'M56 98 Q80 91 104 98 L106 152 Q80 159 54 152 Z',
};

const patternFill = (id, accent, pattern) => {
  switch (pattern) {
    case 'stripes':
      return (
        <pattern
          id={id}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(28)"
        >
          <rect width="5" height="12" fill={accent} />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.6" fill={accent} />
        </pattern>
      );
    case 'stars':
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <polygon
            points="8,2 9.8,6.3 14.4,6.6 10.9,9.7 12,14.2 8,11.6 4,14.2 5.1,9.7 1.6,6.6 6.2,6.3"
            fill={accent}
          />
        </pattern>
      );
    case 'chevron':
      return (
        <pattern id={id} width="14" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M0 8 L7 2 L14 8"
            fill="none"
            stroke={accent}
            strokeWidth="2.6"
          />
        </pattern>
      );
    default:
      return null;
  }
};

/** Long hair, hoods and ponytails that sit behind the head and shoulders. */
const hairBehind = (style, color) => {
  const dark = shade(color, -0.22);

  switch (style) {
    case 'afro':
      return <circle cx="80" cy="54" r="41" fill={color} />;
    case 'waves':
      return (
        <path
          d="M46 52 C46 20 114 20 114 52 L121 128 C110 124 106 100 105 64 L55 64 C54 100 50 124 39 128 Z"
          fill={color}
        />
      );
    case 'bob':
      return (
        <path
          d="M48 50 C48 20 112 20 112 50 L114 94 C98 100 62 100 46 94 Z"
          fill={color}
        />
      );
    case 'locs':
      return (
        <g fill={color}>
          <path d="M48 50 C48 20 112 20 112 50 L112 72 L48 72 Z" />
          {[42, 52, 108, 118].map((x, i) => (
            <rect
              key={x}
              x={x - 4}
              y={56 + (i % 2) * 4}
              width="8"
              height={52 - (i % 2) * 6}
              rx="4"
              fill={i % 2 ? dark : color}
            />
          ))}
        </g>
      );
    case 'braids':
      return (
        <g fill={color}>
          <rect x="38" y="52" width="9" height="46" rx="4.5" />
          <rect x="113" y="52" width="9" height="46" rx="4.5" />
          {[62, 76, 90].map((y) => (
            <g key={y}>
              <circle cx="42.5" cy={y} r="5.6" fill={dark} />
              <circle cx="117.5" cy={y} r="5.6" fill={dark} />
            </g>
          ))}
        </g>
      );
    case 'ponytail':
      return (
        <g fill={color}>
          <ellipse
            cx="120"
            cy="58"
            rx="11"
            ry="24"
            transform="rotate(22 120 58)"
          />
          <ellipse cx="121" cy="86" rx="8" ry="10" fill={dark} />
        </g>
      );
    case 'coils':
      return <circle cx="80" cy="56" r="35" fill={dark} />;
    default:
      return null;
  }
};

/** The cap of hair that covers the crown, drawn over the face layer. */
const hairInFront = (style, color, beanieColor) => {
  const dark = shade(color, -0.24);
  const cap = (
    <path
      d="M50 58 C50 26 110 26 110 58 C104 40 94 32 80 32 C66 32 56 40 50 58 Z"
      fill={color}
    />
  );

  switch (style) {
    case 'crop':
      return cap;
    case 'bob':
      return cap;
    case 'waves':
      return cap;
    case 'locs':
      return cap;
    case 'braids':
      return (
        <g>
          {cap}
          <path
            d="M56 44 Q80 34 104 44"
            stroke={dark}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 'ponytail':
      return (
        <g>
          {cap}
          <path
            d="M54 52 Q80 38 106 52"
            stroke={dark}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 'afro':
      return null;
    case 'curls':
      return (
        <g fill={color}>
          <circle cx="56" cy="42" r="12" />
          <circle cx="72" cy="31" r="13" />
          <circle cx="90" cy="31" r="13" />
          <circle cx="105" cy="42" r="12" />
          <circle cx="64" cy="33" r="10" fill={dark} />
          <circle cx="98" cy="33" r="10" fill={dark} />
        </g>
      );
    case 'coils':
      return (
        <g fill={color}>
          {[
            [56, 44],
            [66, 34],
            [80, 29],
            [94, 34],
            [104, 44],
            [61, 36],
            [73, 30],
            [88, 30],
            [100, 36],
          ].map(([cx, cy], i) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={i % 2 ? 6 : 7.5} />
          ))}
        </g>
      );
    case 'buns':
      return (
        <g>
          {cap}
          <circle cx="52" cy="26" r="11" fill={color} />
          <circle cx="108" cy="26" r="11" fill={color} />
          <circle cx="52" cy="26" r="5" fill={dark} />
          <circle cx="108" cy="26" r="5" fill={dark} />
        </g>
      );
    case 'spiky':
      return (
        <polygon
          points="50,58 55,24 64,38 72,18 80,36 88,18 96,38 105,24 110,58"
          fill={color}
        />
      );
    case 'beanie':
      // The knit takes its own colour; the hair underneath keeps the hair
      // colour and still shows below the brim.
      return (
        <g>
          <path
            d="M48 62 C48 28 112 28 112 62 L112 66 Q80 74 48 66 Z"
            fill={color}
          />
          <path
            d="M46 54 C46 24 114 24 114 54 L114 58 L46 58 Z"
            fill={beanieColor}
          />
          <rect
            x="44"
            y="54"
            width="72"
            height="10"
            rx="5"
            fill={shade(beanieColor, -0.18)}
          />
          <circle cx="80" cy="20" r="7" fill={shade(beanieColor, 0.25)} />
        </g>
      );
    default:
      return cap;
  }
};

const eyeShape = (cx, shape, color) => {
  const cy = 62;

  switch (shape) {
    case 'almond':
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx="7" ry="4.6" fill="#ffffff" />
          <circle cx={cx} cy={cy} r="4" fill={color} />
          <circle cx={cx} cy={cy} r="1.9" fill="#0f172a" />
          <circle cx={cx - 1.6} cy={cy - 1.8} r="1.3" fill="#ffffff" />
        </g>
      );
    case 'wide':
      return (
        <g>
          <circle cx={cx} cy={cy} r="7.6" fill="#ffffff" />
          <circle cx={cx} cy={cy} r="5" fill={color} />
          <circle cx={cx} cy={cy} r="2.4" fill="#0f172a" />
          <circle cx={cx - 2} cy={cy - 2.4} r="1.7" fill="#ffffff" />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          <path
            d={`M${cx - 7} ${cy} A 7 6 0 0 1 ${cx + 7} ${cy} Z`}
            fill="#ffffff"
          />
          <circle cx={cx} cy={cy - 1.4} r="3.4" fill={color} />
          <path
            d={`M${cx - 7.4} ${cy} A 7.4 7 0 0 1 ${cx + 7.4} ${cy}`}
            stroke="#0f172a"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case 'sparkle':
      return (
        <g>
          <circle cx={cx} cy={cy} r="6.6" fill="#ffffff" />
          <circle cx={cx} cy={cy} r="4.6" fill={color} />
          <circle cx={cx} cy={cy} r="2.1" fill="#0f172a" />
          <polygon
            points={`${cx - 1.8},${cy - 6.4} ${cx - 0.5},${cy - 3.2} ${cx + 2.6},${cy - 2} ${cx - 0.5},${cy - 0.8} ${cx - 1.8},${cy + 2.4} ${cx - 3.1},${cy - 0.8} ${cx - 6.2},${cy - 2} ${cx - 3.1},${cy - 3.2}`}
            fill="#ffffff"
          />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={cx} cy={cy} r="6.2" fill="#ffffff" />
          <circle cx={cx} cy={cy} r="4.2" fill={color} />
          <circle cx={cx} cy={cy} r="2" fill="#0f172a" />
          <circle cx={cx - 1.6} cy={cy - 2} r="1.4" fill="#ffffff" />
        </g>
      );
  }
};

const browShape = (style, color) => {
  if (style === 'none') return null;

  const stroke = shade(color, -0.3);

  if (style === 'bold') {
    return (
      <g fill={stroke}>
        <rect x="59" y="46" width="17" height="4.6" rx="2.3" />
        <rect x="84" y="46" width="17" height="4.6" rx="2.3" />
      </g>
    );
  }

  if (style === 'raised') {
    return (
      <g stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M60 46 Q68 41 76 45" />
        <path d="M84 48 Q92 44 100 48" />
      </g>
    );
  }

  return (
    <g stroke={stroke} strokeWidth="2.6" fill="none" strokeLinecap="round">
      <path d="M60 48 Q68 44 76 48" />
      <path d="M84 48 Q92 44 100 48" />
    </g>
  );
};

const mouthShape = (expression) => {
  const ink = '#7f1d1d';

  switch (expression) {
    case 'grin':
      return (
        <g>
          <path
            d="M68 76 Q80 90 92 76 Z"
            fill={ink}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M69 76.5 L91 76.5 L90 79 L70 79 Z" fill="#ffffff" />
        </g>
      );
    case 'calm':
      return (
        <path
          d="M72 78 L88 78"
          stroke="#0f172a"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      );
    case 'determined':
      return (
        <g>
          <path
            d="M71 79 Q80 75 89 79"
            stroke="#0f172a"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M74 83 Q80 85 86 83"
            stroke="#0f172a"
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
          />
        </g>
      );
    case 'surprised':
      return (
        <ellipse
          cx="80"
          cy="79"
          rx="5.4"
          ry="6.6"
          fill={ink}
          stroke="#0f172a"
          strokeWidth="1.3"
        />
      );
    case 'giggle':
      return (
        <g>
          <path
            d="M67 74 Q80 92 93 74 Z"
            fill={ink}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <ellipse cx="80" cy="85" rx="4" ry="2.6" fill="#f472b6" />
        </g>
      );
    default:
      return (
        <path
          d="M70 75 Q80 84 90 75"
          stroke="#0f172a"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
};

const freckleDots = (kind, skinShadow) => {
  if (kind === 'none') return null;

  const cheekDots = [
    [60, 70],
    [64, 73],
    [57, 74],
    [100, 70],
    [96, 73],
    [103, 74],
  ];
  const noseDots = [
    [74, 70],
    [80, 72],
    [86, 70],
    [77, 67],
    [83, 67],
  ];

  // Every option named, so the schema wiring test can see each one is handled.
  const dots = {
    cheeks: cheekDots,
    nose: noseDots,
    full: [...cheekDots, ...noseDots],
  }[kind] ?? [...cheekDots, ...noseDots];

  return (
    <g fill={shade(skinShadow, -0.3)} opacity="0.85">
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" />
      ))}
    </g>
  );
};

const backItem = (kind, accent) => {
  const deep = shade(accent, -0.25);

  switch (kind) {
    case 'cape':
      // Takes the accent colour. It used to reuse the body colour, which made
      // the cape vanish against the torso on every solid outfit.
      return (
        <g>
          <path d="M60 98 L30 178 L80 166 L130 178 L100 98 Z" fill={accent} />
          <path d="M80 100 L80 166" stroke={deep} strokeWidth="2" />
          <path d="M60 98 L48 150" stroke={deep} strokeWidth="1.6" />
          <path d="M100 98 L112 150" stroke={deep} strokeWidth="1.6" />
        </g>
      );
    case 'wings':
      return (
        <g>
          <path
            d="M58 100 C22 82 12 118 26 142 C38 160 56 150 62 132 Z"
            fill={accent}
            opacity="0.92"
          />
          <path
            d="M102 100 C138 82 148 118 134 142 C122 160 104 150 98 132 Z"
            fill={accent}
            opacity="0.92"
          />
          <g stroke={deep} strokeWidth="1.6" fill="none">
            <path d="M56 106 C36 100 28 122 34 138" />
            <path d="M104 106 C124 100 132 122 126 138" />
          </g>
        </g>
      );
    case 'backpack':
      return (
        <g>
          <rect x="42" y="102" width="76" height="56" rx="14" fill={accent} />
          <rect x="56" y="120" width="48" height="22" rx="7" fill={deep} />
        </g>
      );
    case 'jetpack':
      return (
        <g>
          <rect x="40" y="100" width="20" height="48" rx="10" fill={accent} />
          <rect x="100" y="100" width="20" height="48" rx="10" fill={accent} />
          <rect x="44" y="104" width="12" height="12" rx="6" fill={deep} />
          <rect x="104" y="104" width="12" height="12" rx="6" fill={deep} />
          <path d="M50 148 L44 170 L50 164 L56 170 Z" fill="#f97316" />
          <path d="M110 148 L104 170 L110 164 L116 170 Z" fill="#f97316" />
        </g>
      );
    default:
      return null;
  }
};

const headItem = (kind, accent) => {
  const deep = shade(accent, -0.28);

  switch (kind) {
    case 'crown':
      return (
        <g>
          <polygon
            points="50,34 60,14 70,28 80,8 90,28 100,14 110,34"
            fill="#eab308"
          />
          <rect x="49" y="32" width="62" height="9" rx="4" fill="#ca8a04" />
          <circle cx="80" cy="36" r="3.4" fill={accent} />
          <circle cx="62" cy="36" r="2.4" fill={deep} />
          <circle cx="98" cy="36" r="2.4" fill={deep} />
        </g>
      );
    case 'astronaut_helmet':
      return (
        <g>
          <circle
            cx="80"
            cy="62"
            r="41"
            fill="#e0f2fe"
            opacity="0.32"
            stroke="#cbd5e1"
            strokeWidth="3"
          />
          <path
            d="M54 38 C62 28 98 28 106 38"
            stroke="#ffffff"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          <rect x="36" y="88" width="88" height="12" rx="6" fill="#94a3b8" />
          <rect x="116" y="52" width="12" height="20" rx="4" fill={accent} />
        </g>
      );
    case 'party_hat':
      return (
        <g>
          <polygon points="80,2 62,40 98,40" fill={accent} />
          <path
            d="M68 30 L94 24 M65 36 L96 30"
            stroke={deep}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="80" cy="4" r="6" fill={deep} />
        </g>
      );
    case 'headband':
      return (
        <g>
          <rect x="46" y="38" width="68" height="9" rx="4.5" fill={accent} />
          <polygon
            points="110,26 114,36 124,37 116,43 119,53 110,47 101,53 104,43 96,37 106,36"
            fill={deep}
          />
        </g>
      );
    case 'chef_hat':
      return (
        <g fill="#f8fafc">
          <circle cx="58" cy="20" r="14" />
          <circle cx="80" cy="12" r="16" />
          <circle cx="102" cy="20" r="14" />
          <rect x="54" y="24" width="52" height="18" rx="4" />
          <rect x="52" y="36" width="56" height="9" rx="4" fill={accent} />
        </g>
      );
    default:
      return null;
  }
};

const faceItem = (kind, accent) => {
  switch (kind) {
    case 'glasses':
      return (
        <g stroke="#0f172a" strokeWidth="2.6" fill="rgb(255 255 255 / 30%)">
          <circle cx="66" cy="62" r="11" />
          <circle cx="94" cy="62" r="11" />
          <line x1="77" y1="62" x2="83" y2="62" />
          <line x1="55" y1="60" x2="48" y2="58" />
          <line x1="105" y1="60" x2="112" y2="58" />
        </g>
      );
    case 'star_shades':
      return (
        <g>
          <polygon
            points="66,50 70,60 81,60 72,67 75,78 66,71 57,78 60,67 51,60 62,60"
            fill="#0f172a"
          />
          <polygon
            points="94,50 98,60 109,60 100,67 103,78 94,71 85,78 88,67 79,60 90,60"
            fill="#0f172a"
          />
          <line
            x1="78"
            y1="61"
            x2="82"
            y2="61"
            stroke="#0f172a"
            strokeWidth="3"
          />
          <polygon points="63,58 66,64 69,58" fill={accent} />
        </g>
      );
    case 'superhero_mask':
      return (
        <g>
          <path
            d="M48 54 Q80 62 112 54 Q116 74 96 74 Q80 66 64 74 Q44 74 48 54 Z"
            fill={accent}
          />
          <circle cx="66" cy="62" r="5.4" fill="rgb(255 255 255 / 85%)" />
          <circle cx="94" cy="62" r="5.4" fill="rgb(255 255 255 / 85%)" />
        </g>
      );
    case 'eyepatch':
      return (
        <g>
          <path
            d="M46 50 Q80 58 114 50"
            stroke="#1c1917"
            strokeWidth="3"
            fill="none"
          />
          <rect x="84" y="52" width="21" height="20" rx="5" fill="#1c1917" />
          <circle cx="94.5" cy="62" r="2.4" fill={accent} />
        </g>
      );
    case 'snorkel':
      return (
        <g>
          <rect
            x="52"
            y="50"
            width="56"
            height="24"
            rx="10"
            fill="rgb(255 255 255 / 40%)"
            stroke={accent}
            strokeWidth="3"
          />
          <line
            x1="80"
            y1="50"
            x2="80"
            y2="74"
            stroke={accent}
            strokeWidth="2.4"
          />
          <path
            d="M108 58 L120 58 L120 26"
            stroke={accent}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return null;
  }
};

const outfitDetail = (style, outfit, accent, ink) => {
  const fold = shade(outfit, -0.2);

  switch (style) {
    case 'hoodie':
      return (
        <g>
          <rect x="64" y="122" width="32" height="18" rx="6" fill={fold} />
          <path
            d="M70 100 L74 116 M90 100 L86 116"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case 'dungarees':
      return (
        <g>
          <rect x="62" y="110" width="36" height="34" rx="5" fill={accent} />
          <path
            d="M64 98 L68 112 M96 98 L92 112"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="66" cy="112" r="2.6" fill={fold} />
          <circle cx="94" cy="112" r="2.6" fill={fold} />
        </g>
      );
    case 'dress':
      return (
        <g>
          <rect x="52" y="124" width="56" height="7" rx="3.5" fill={accent} />
          <path
            d="M44 157 Q80 167 116 157"
            stroke={accent}
            strokeWidth="5"
            fill="none"
          />
        </g>
      );
    case 'hero_suit':
      return (
        <g>
          <polygon
            points="80,106 85,118 98,118 88,126 92,139 80,131 68,139 72,126 62,118 75,118"
            fill={accent}
          />
          <rect x="54" y="142" width="52" height="8" rx="4" fill={accent} />
        </g>
      );
    case 'space_suit':
      return (
        <g>
          <rect x="54" y="94" width="52" height="9" rx="4.5" fill={accent} />
          <rect x="66" y="112" width="28" height="20" rx="5" fill={fold} />
          <circle cx="73" cy="119" r="2.6" fill={accent} />
          <circle cx="81" cy="119" r="2.6" fill={ink} />
          <circle cx="89" cy="119" r="2.6" fill={accent} />
          <rect x="68" y="126" width="24" height="3" rx="1.5" fill={ink} />
        </g>
      );
    case 'explorer':
      return (
        <g>
          <path d="M80 96 L80 154" stroke={fold} strokeWidth="2.4" />
          <rect x="58" y="122" width="16" height="14" rx="3" fill={accent} />
          <rect x="86" y="122" width="16" height="14" rx="3" fill={accent} />
          <rect x="52" y="140" width="56" height="7" rx="3.5" fill={accent} />
        </g>
      );
    default:
      return (
        <g>
          <path
            d="M68 96 Q80 106 92 96"
            stroke={accent}
            strokeWidth="3.4"
            fill="none"
          />
          <path
            d="M80 118 L80 142"
            stroke={ink}
            strokeWidth="1.6"
            opacity="0.2"
          />
        </g>
      );
  }
};

export const HeroPortrait = ({ avatar, label }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const a = normalizeAvatar(avatar);

  const skin = a.skin;
  const skinShadow =
    findByValue(SKIN_TONES, a.skin)?.shadow ?? shade(skin, -0.14);
  const outfit = a.outfitColor;
  const accent = a.outfitAccentColor;
  const ink = contrastInk(outfit);
  const scale = findById(BUILDS, a.build)?.scale ?? 1;
  const torso = TORSO_PATHS[a.outfitStyle] ?? TORSO_PATHS.tee;

  const clipId = `${uid}-torso`;
  const patternId = `${uid}-pattern`;
  const patterned = a.outfitPattern !== 'solid';

  return (
    <svg
      viewBox="0 0 160 200"
      className={styles.avatarSvg}
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={torso} />
        </clipPath>
        {patterned && patternFill(patternId, accent, a.outfitPattern)}
      </defs>

      {/* Scaled about the feet so "Tall" grows upward rather than off-centre. */}
      <g transform={`translate(80 196) scale(${scale}) translate(-80 -196)`}>
        {backItem(a.backAccessory, accent)}
        {hairBehind(a.hairStyle, a.hairColor)}

        {a.outfitStyle === 'hoodie' && (
          <path d="M48 96 C48 62 112 62 112 96 Z" fill={shade(outfit, -0.12)} />
        )}

        {/* Legs and shoes */}
        <rect x="65" y="148" width="13" height="32" rx="6" fill={skinShadow} />
        <rect x="82" y="148" width="13" height="32" rx="6" fill={skinShadow} />
        <ellipse cx="70" cy="182" rx="12" ry="7" fill={accent} />
        <ellipse cx="90" cy="182" rx="12" ry="7" fill={accent} />

        {/* Torso */}
        <path d={torso} fill={outfit} />
        {patterned && (
          <g clipPath={`url(#${clipId})`}>
            <rect
              x="0"
              y="0"
              width="160"
              height="200"
              fill={`url(#${patternId})`}
              opacity="0.9"
            />
          </g>
        )}
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M100 90 L124 200 L160 200 L160 90 Z"
            fill={shade(outfit, -0.16)}
            opacity="0.45"
          />
        </g>
        {outfitDetail(a.outfitStyle, outfit, accent, ink)}

        {/* Arms */}
        <g fill={outfit}>
          <path d="M57 100 L45 138 L55 141 L66 106 Z" />
          <path d="M103 100 L115 138 L105 141 L94 106 Z" />
        </g>
        <circle cx="50" cy="143" r="7" fill={skin} />
        <circle cx="110" cy="143" r="7" fill={skin} />

        {/* Neck and head */}
        <rect x="71" y="84" width="18" height="16" rx="5" fill={skinShadow} />
        <ellipse cx="48" cy="64" rx="6" ry="8" fill={skinShadow} />
        <ellipse cx="112" cy="64" rx="6" ry="8" fill={skinShadow} />
        <circle cx="80" cy="60" r="32" fill={skin} />
        <path
          d="M80 92 A 32 32 0 0 0 112 60 L112 70 A 32 32 0 0 1 80 92 Z"
          fill={skinShadow}
          opacity="0.5"
        />

        {/* Face */}
        {browShape(a.brows, a.hairColor)}
        {eyeShape(66, a.eyeShape, a.eyeColor)}
        {eyeShape(94, a.eyeShape, a.eyeColor)}
        <path
          d="M78 68 Q80 72 82 70"
          stroke={shade(skinShadow, -0.2)}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        {mouthShape(a.expression)}
        {freckleDots(a.freckles, skinShadow)}

        {hairInFront(a.hairStyle, a.hairColor, a.beanieColor)}
        {headItem(a.headAccessory, accent)}
        {faceItem(a.faceAccessory, accent)}
      </g>
    </svg>
  );
};

HeroPortrait.propTypes = {
  avatar: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
};

/* --------------------------------------------------------- companion art -- */

const SPECIES_FEATURES = {
  leo: { ears: 'round', mane: true },
  penny: { ears: 'pointed' },
  finley: { ears: 'pointed', snout: true },
  luna: { ears: 'floppy', snout: true },
  dexter: { ears: 'crest' },
  carty: { ears: 'antenna', boxy: true },
  sparky: { ears: 'horns' },
};

const POSE_TRANSFORM = {
  sit: 'translate(0 0)',
  stand: 'translate(0 -6)',
  leap: 'rotate(-14 80 130) translate(0 -10)',
  curl: 'translate(0 10) scale(1 0.86)',
};

const companionEars = (kind, fur, dark) => {
  switch (kind) {
    case 'pointed':
      return (
        <g fill={fur}>
          <polygon points="56,70 60,40 78,60" />
          <polygon points="104,70 100,40 82,60" />
          <polygon points="62,64 64,50 73,61" fill={dark} />
          <polygon points="98,64 96,50 87,61" fill={dark} />
        </g>
      );
    case 'floppy':
      return (
        <g fill={dark}>
          <ellipse
            cx="50"
            cy="82"
            rx="11"
            ry="20"
            transform="rotate(12 50 82)"
          />
          <ellipse
            cx="110"
            cy="82"
            rx="11"
            ry="20"
            transform="rotate(-12 110 82)"
          />
        </g>
      );
    case 'crest':
      return (
        <polygon
          points="62,52 70,34 78,50 86,32 94,50 100,38 102,58"
          fill={dark}
        />
      );
    case 'antenna':
      return (
        <g>
          <rect x="78" y="30" width="4" height="20" rx="2" fill={dark} />
          <circle cx="80" cy="28" r="6" fill="#facc15" />
        </g>
      );
    case 'horns':
      return (
        <g fill={dark}>
          <path d="M58 58 Q50 36 66 42 Z" />
          <path d="M102 58 Q110 36 94 42 Z" />
        </g>
      );
    default:
      return (
        <g fill={fur}>
          <circle cx="56" cy="58" r="12" />
          <circle cx="104" cy="58" r="12" />
          <circle cx="56" cy="58" r="6" fill={dark} />
          <circle cx="104" cy="58" r="6" fill={dark} />
        </g>
      );
  }
};

const collarShape = (kind, color, dark, ink) => {
  switch (kind) {
    case 'star_bandana':
      return (
        <g>
          <path d="M56 112 L104 112 L80 142 Z" fill={color} />
          <polygon
            points="80,118 82.6,125 90,125 84,129.5 86,137 80,132.5 74,137 76,129.5 70,125 77.4,125"
            fill={ink}
          />
        </g>
      );
    case 'golden_bell':
      return (
        <g>
          <rect x="54" y="110" width="52" height="10" rx="5" fill={color} />
          <circle cx="80" cy="126" r="9" fill="#facc15" />
          <path
            d="M74 126 L86 126"
            stroke={shade('#facc15', -0.4)}
            strokeWidth="2"
          />
        </g>
      );
    case 'explorer_scarf':
      return (
        <g>
          <path
            d="M52 108 Q80 124 108 108 L108 120 Q80 136 52 120 Z"
            fill={color}
          />
          <path d="M100 118 L114 146 L102 148 L94 124 Z" fill={dark} />
        </g>
      );
    case 'capelet':
      return (
        <g>
          <path
            d="M50 110 Q80 122 110 110 L118 156 Q80 166 42 156 Z"
            fill={color}
          />
          <path d="M80 118 L80 162" stroke={dark} strokeWidth="2" />
        </g>
      );
    case 'bowtie':
      return (
        <g>
          <rect x="54" y="110" width="52" height="9" rx="4.5" fill={dark} />
          <polygon points="80,116 62,106 62,128 80,118" fill={color} />
          <polygon points="80,116 98,106 98,128 80,118" fill={color} />
          <circle cx="80" cy="117" r="5" fill={dark} />
        </g>
      );
    default:
      return null;
  }
};

export const CompanionPortrait = ({ companion, label }) => {
  const c = normalizeCompanion(companion);
  const fur = c.furColor;
  const dark = shade(fur, -0.24);
  const belly = shade(fur, 0.28);
  const ink = contrastInk(c.collarColor);
  const scale = findById(PET_SIZES, c.size)?.scale ?? 1;
  const features = SPECIES_FEATURES[c.species] ?? SPECIES_FEATURES.leo;

  return (
    <svg
      viewBox="0 0 160 200"
      className={styles.avatarSvg}
      role="img"
      aria-label={label}
    >
      <g transform={`translate(80 190) scale(${scale}) translate(-80 -190)`}>
        <g transform={POSE_TRANSFORM[c.pose] ?? POSE_TRANSFORM.sit}>
          {/* Tail */}
          <path
            d="M108 160 Q140 156 132 122"
            stroke={dark}
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
          />

          {/* Body */}
          <ellipse cx="80" cy="152" rx="36" ry="34" fill={fur} />
          <ellipse cx="80" cy="160" rx="22" ry="22" fill={belly} />
          {c.pose === 'leap' ? (
            <g fill={dark}>
              <rect
                x="44"
                y="158"
                width="14"
                height="30"
                rx="7"
                transform="rotate(-20 51 173)"
              />
              <rect
                x="102"
                y="158"
                width="14"
                height="30"
                rx="7"
                transform="rotate(20 109 173)"
              />
            </g>
          ) : (
            <g fill={dark}>
              <ellipse cx="60" cy="182" rx="13" ry="8" />
              <ellipse cx="100" cy="182" rx="13" ry="8" />
            </g>
          )}

          {/* Mane sits behind the head for the lion archetype */}
          {features.mane && <circle cx="80" cy="76" r="44" fill={dark} />}

          {companionEars(features.ears, fur, dark)}

          {features.boxy ? (
            <rect x="46" y="44" width="68" height="64" rx="14" fill={fur} />
          ) : (
            <circle cx="80" cy="78" r="34" fill={fur} />
          )}

          {features.snout && (
            <ellipse cx="80" cy="94" rx="20" ry="14" fill={belly} />
          )}

          {/* Face */}
          <circle cx="68" cy="74" r="5" fill="#0f172a" />
          <circle cx="92" cy="74" r="5" fill="#0f172a" />
          <circle cx="66.4" cy="72" r="1.8" fill="#ffffff" />
          <circle cx="90.4" cy="72" r="1.8" fill="#ffffff" />
          <ellipse cx="80" cy="88" rx="5" ry="4" fill="#0f172a" />
          <path
            d="M70 96 Q80 104 90 96"
            stroke="#0f172a"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          {features.ears === 'pointed' && (
            <g stroke="#0f172a" strokeWidth="1.4" opacity="0.6">
              <path d="M56 88 L44 84 M56 92 L44 94" />
              <path d="M104 88 L116 84 M104 92 L116 94" />
            </g>
          )}

          {collarShape(
            c.collar,
            c.collarColor,
            shade(c.collarColor, -0.3),
            ink
          )}
        </g>
      </g>
    </svg>
  );
};

CompanionPortrait.propTypes = {
  companion: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
};
