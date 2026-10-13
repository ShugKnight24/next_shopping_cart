import PropTypes from 'prop-types';
import { P, useSvgIds } from './heroArt';

/**
 * The chrome wire cart from the Cart Commerce mark, split into the part that
 * sits behind the goods (back + left faces, chassis, far wheels) and the part
 * in front of them (front + right faces, rim, handle, brand plate, near
 * wheels). Rendering the halves as separate layers lets goods drop *into*
 * the basket.
 *
 * Local units: the basket is 150 long, 64 deep, 74 tall, rim at y = 30.
 * The near wheels touch the floor at y = CART_FLOOR_Y.
 */

const f = (n) => Math.round(n * 10) / 10;
const seg = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

export const CART_L = 150;
export const CART_W = 64;
const H = 74;
export const CART_RIM = 30;
export const CART_FLOOR = CART_RIM + H;
const LEG_Y = CART_FLOOR + 30;
// Bottom of the near wheels (legs at z = 8, tyre radius 9.5, hub 9 below leg).
export const CART_FLOOR_Y = f(LEG_Y - 8 * 0.3 + 18.5);
// Local box every cart layer is drawn in.
export const CART_BOX = [-44, -40, 248, 200];

const rim = [
  [0, CART_RIM, 0],
  [CART_L, CART_RIM, 0],
  [CART_L, CART_RIM, CART_W],
  [0, CART_RIM, CART_W],
];
const floor = [
  [16, CART_FLOOR, 4],
  [CART_L - 4, CART_FLOOR, 4],
  [CART_L - 4, CART_FLOOR, CART_W - 4],
  [16, CART_FLOOR, CART_W - 4],
];

const faceWires = (a0, a1, b0, b1, n) =>
  Array.from({ length: n - 1 }, (_, i) => {
    const t = (i + 1) / n;
    return seg(P(...lerp3(a0, a1, t)), P(...lerp3(b0, b1, t)));
  }).join('');

const rails = (levels, faces) =>
  levels
    .map((t) => {
      const ring = rim.map((r, i) => lerp3(floor[i], r, t));
      return faces
        .map((i) => seg(P(...ring[i]), P(...ring[(i + 1) % 4])))
        .join('');
    })
    .join('');

const BACK = [
  faceWires(floor[3], floor[2], rim[3], rim[2], 16),
  faceWires(floor[0], floor[3], rim[0], rim[3], 7),
  rails([0.34, 0.67], [2, 3]),
  seg(P(...rim[3]), P(...rim[2])),
  seg(P(...rim[0]), P(...rim[3])),
  seg(P(...floor[3]), P(...floor[2])),
  seg(P(...floor[0]), P(...floor[3])),
  faceWires(floor[0], floor[3], floor[1], floor[2], 7),
].join('');

const FRONT = [
  faceWires(floor[0], floor[1], rim[0], rim[1], 16),
  faceWires(floor[1], floor[2], rim[1], rim[2], 7),
  rails([0.34, 0.67], [0, 1]),
  floor.map((pt, i) => seg(P(...pt), P(...rim[i]))).join(''),
  seg(P(...floor[0]), P(...floor[1])),
  seg(P(...floor[1]), P(...floor[2])),
].join('');

const RIM_FRONT = [
  seg(P(...rim[0]), P(...rim[1])),
  seg(P(...rim[1]), P(...rim[2])),
].join('');
const RIM_BACK = [
  seg(P(...rim[2]), P(...rim[3])),
  seg(P(...rim[3]), P(...rim[0])),
].join('');

const legs = [
  [18, LEG_Y, 8],
  [CART_L - 8, LEG_Y, 8],
  [CART_L - 8, LEG_Y, CART_W - 8],
  [18, LEG_Y, CART_W - 8],
];
const CHASSIS_BACK = [
  seg(P(...legs[2]), P(...floor[2])),
  seg(P(...legs[3]), P(...floor[3])),
  seg(P(...legs[3]), P(...legs[2])),
  seg(P(...legs[1]), P(...legs[2])),
  seg(P(...legs[0]), P(...legs[3])),
].join('');
const CHASSIS_FRONT = [
  seg(P(...legs[0]), P(...floor[0])),
  seg(P(...legs[1]), P(...floor[1])),
  seg(P(...legs[0]), P(...legs[1])),
].join('');
// Bottom tray between the legs.
const TRAY = [0.2, 0.4, 0.6, 0.8]
  .map((t) =>
    seg(P(...lerp3(legs[0], legs[1], t)), P(...lerp3(legs[3], legs[2], t)))
  )
  .join('');

const handleA = P(-22, CART_RIM - 16, 2);
const handleB = P(-22, CART_RIM - 16, CART_W - 2);
const HANDLE = seg(P(...rim[0]), handleA) + seg(P(...rim[3]), handleB);

/** Where a point in the basket lands on screen, in local cart units. */
export const cartPoint = (x, y, z) => P(x, y, z);
export const CART_HANDLE = [
  f((handleA[0] + handleB[0]) / 2),
  f((handleA[1] + handleB[1]) / 2),
];

function CartDefs({ u }) {
  return (
    <defs>
      <linearGradient id={u('chrome')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#dfe4ec" />
        <stop offset="0.6" stopColor="#9aa4b4" />
        <stop offset="1" stopColor="#eef1f6" />
      </linearGradient>
      <linearGradient id={u('chromeBack')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c3cad6" />
        <stop offset="1" stopColor="#6f7a8c" />
      </linearGradient>
      <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6dd8a" />
        <stop offset="0.5" stopColor="#d9a62e" />
        <stop offset="1" stopColor="#a8761a" />
      </linearGradient>
      <radialGradient id={u('tyre')} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#4a4f5a" />
        <stop offset="1" stopColor="#15171c" />
      </radialGradient>
      <radialGradient id={u('shadow')}>
        <stop offset="0" stopColor="#020617" stopOpacity="0.6" />
        <stop offset="1" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={u('glow')}>
        <stop offset="0" stopColor="#f6d77a" stopOpacity="0.35" />
        <stop offset="1" stopColor="#f6d77a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
CartDefs.propTypes = { u: PropTypes.func.isRequired };

function Wheel({ pt, u }) {
  const [x, y] = P(...pt);
  return (
    <g>
      <path
        d={`M${f(x)} ${f(y)}V${f(y + 9)}`}
        stroke={`url(#${u('chrome')})`}
        strokeWidth="3"
      />
      <circle cx={x} cy={y + 9} r="9.5" fill={`url(#${u('tyre')})`} />
      <circle
        cx={x}
        cy={y + 9}
        r="9.5"
        fill="none"
        stroke="#6b7280"
        strokeOpacity="0.5"
        strokeWidth="0.8"
      />
      <circle cx={x} cy={y + 9} r="4.2" fill={`url(#${u('chrome')})`} />
      <circle cx={x - 1.2} cy={y + 7.8} r="1.2" fill="#ffffff" />
    </g>
  );
}
Wheel.propTypes = {
  pt: PropTypes.arrayOf(PropTypes.number).isRequired,
  u: PropTypes.func.isRequired,
};

/** Everything behind the goods, including the floor shadow and reflection. */
export function CartBack() {
  const u = useSvgIds();
  const [sx] = P(CART_L / 2, 0, CART_W / 2);
  return (
    <g>
      <CartDefs u={u} />
      <ellipse
        cx={sx}
        cy={CART_FLOOR_Y - 8}
        rx="128"
        ry="16"
        fill={`url(#${u('shadow')})`}
      />
      <ellipse
        cx={sx + 4}
        cy={CART_FLOOR_Y - 4}
        rx="96"
        ry="7"
        fill={`url(#${u('glow')})`}
      />
      <path
        d={BACK}
        stroke={`url(#${u('chromeBack')})`}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d={RIM_BACK}
        stroke={`url(#${u('chromeBack')})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d={CHASSIS_BACK + TRAY}
        stroke={`url(#${u('chromeBack')})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {legs.slice(2).map((pt) => (
        <Wheel key={pt.join()} pt={pt} u={u} />
      ))}
    </g>
  );
}

/** Everything in front of the goods. */
export function CartFront() {
  const u = useSvgIds();
  return (
    <g>
      <CartDefs u={u} />
      <path
        d={CHASSIS_FRONT}
        stroke={`url(#${u('chrome')})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d={FRONT}
        stroke={`url(#${u('chrome')})`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d={RIM_FRONT}
        stroke={`url(#${u('chrome')})`}
        strokeWidth="3.8"
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
      {/* Brand plate on the long side */}
      <rect
        x={CART_L / 2 - 46}
        y={CART_RIM + 26}
        width="92"
        height="20"
        rx="3"
        fill={`url(#${u('gold')})`}
      />
      <rect
        x={CART_L / 2 - 43}
        y={CART_RIM + 28.5}
        width="86"
        height="15"
        rx="2"
        fill="none"
        stroke="#0f2744"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <text
        x={CART_L / 2}
        y={CART_RIM + 39.2}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="8"
        fontWeight="800"
        letterSpacing="1.2"
        fill="#0f2744"
        textAnchor="middle"
      >
        CART COMMERCE
      </text>
      {/* Specular streak along the front rim */}
      <path
        d={seg(
          P(CART_L * 0.18, CART_RIM - 0.8, 0),
          P(CART_L * 0.58, CART_RIM - 0.8, 0)
        )}
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      {legs.slice(0, 2).map((pt) => (
        <Wheel key={pt.join()} pt={pt} u={u} />
      ))}
    </g>
  );
}

/** The cart's silhouette rods (rim, handle, chassis) and its wire mesh. */
export const CART_OUTLINE = [
  RIM_FRONT,
  RIM_BACK,
  HANDLE,
  seg(handleA, handleB),
  CHASSIS_FRONT,
  CHASSIS_BACK,
  floor.map((pt, i) => seg(P(...pt), P(...rim[i]))).join(''),
].join('');
export const CART_MESH = [BACK, FRONT, TRAY].join('');

/** Every rod of the cart as an SVG path, plus wheel centres (local units). */
export const CART_RODS = [
  BACK,
  FRONT,
  RIM_FRONT,
  RIM_BACK,
  CHASSIS_BACK,
  CHASSIS_FRONT,
  TRAY,
  HANDLE,
  seg(handleA, handleB),
].join('');
export const CART_WHEELS = legs.map((pt) => {
  const [x, y] = P(...pt);
  return [x, y + 9];
});
