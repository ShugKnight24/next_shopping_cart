/**
 * Shared geometry for the Cart Commerce identity.
 *
 * Every brand surface — the hero's chrome cart, the logo glyph, the favicon
 * and the app icon — is drawn with the same oblique projection: depth runs up
 * and to the right at 0.42 : -0.3. The hero mark projects a 3D wire model;
 * the glyphs below are the same cart reduced to a 64-unit grid and snapped so
 * the strokes land on whole pixels at 16, 32 and 64px.
 */

export const OBLIQUE_X = 0.42;
export const OBLIQUE_Y = -0.3;

/** Project a model-space point (x, y, z) onto the page. */
export const project = (x, y, z) => [x + z * OBLIQUE_X, y + z * OBLIQUE_Y];

/** The hero cart's model, in hero units (see Hero/CartCommerceMark). */
export const CART_MODEL = {
  length: 150,
  depth: 64,
  height: 74,
  rim: 30,
  // Floor inset: [at the handle end, on every other edge].
  floorTuck: [16, 4],
  handle: [-22, -16],
  leg: 30,
};

const pts = (...list) => list.map(([x, y]) => `${x} ${y}`).join(' ');
const line = (a, b) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
const lerp = (a, b, t) => [
  Math.round((a[0] + (b[0] - a[0]) * t) * 10) / 10,
  Math.round((a[1] + (b[1] - a[1]) * t) * 10) / 10,
];

/**
 * Full glyph, for 40px and up. Depth offset (10, -7) is the hero's
 * 0.42 : -0.3 slope; the front face is square-on like the hero's plate side.
 */
const F = {
  rimFL: [15, 25],
  rimFR: [47, 25],
  rimBR: [57, 18],
  rimBL: [25, 18],
  floorFL: [19, 44],
  floorFR: [46, 44],
  floorBR: [56, 37],
  floorBL: [29, 37],
  gripF: [8, 18],
  gripB: [18, 11],
  legFL: [20, 49],
  legFR: [45, 49],
  legBR: [55, 42],
};

const frontWires = [1, 2, 3, 4, 5]
  .map((i) =>
    line(lerp(F.rimFL, F.rimFR, i / 6), lerp(F.floorFL, F.floorFR, i / 6))
  )
  .join('');
const sideWires = line(
  lerp(F.rimFR, F.rimBR, 0.5),
  lerp(F.floorFR, F.floorBR, 0.5)
);
const rail = (t) => {
  const a = lerp(F.floorFL, F.rimFL, t);
  const b = lerp(F.floorFR, F.rimFR, t);
  const c = lerp(F.floorBR, F.rimBR, t);
  return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}`;
};

export const GLYPH_FULL = {
  // Seen through the basket: back-left edge and back floor.
  back: [line(F.rimBL, F.floorBL), line(F.floorBL, F.floorBR)].join(''),
  wires: frontWires + sideWires + rail(0.36) + rail(0.68),
  basket: [
    `M${pts(F.rimFL, F.floorFL, F.floorFR, F.floorBR, F.rimBR)}`,
    line(F.floorFR, F.rimFR),
  ].join(''),
  rim: `M${pts(F.rimFL, F.rimFR, F.rimBR, F.rimBL)}Z`,
  chassis: [
    line(F.floorFL, F.legFL),
    line(F.floorFR, F.legFR),
    line(F.floorBR, F.legBR),
    line(F.legFL, F.legFR),
    line(F.legFR, F.legBR),
  ].join(''),
  posts: line(F.rimFL, F.gripF) + line(F.rimBL, F.gripB),
  grip: line(F.gripF, F.gripB),
  plate: { x: 25, y: 31, width: 16, height: 6, rx: 1.5 },
  wheels: [
    { cx: 21, cy: 52, r: 4 },
    { cx: 44, cy: 52, r: 4 },
  ],
  backWheel: { cx: 54, cy: 45, r: 2.6 },
  stroke: { rim: 3, basket: 2, wires: 1.1, posts: 2.5, grip: 5 },
};

/**
 * Micro glyph, for 16–32px. Horizontal edges sit on 4n + 2 so a 4-unit
 * stroke is exactly one pixel at 16px; wheels sit on 4n so they are crisp
 * 2×2 dots. The right face is filled because two edges 1px apart blur.
 */
const M = {
  rimFL: [17, 26],
  rimFR: [45, 26],
  rimBR: [56, 18],
  rimBL: [28, 18],
  floorFL: [21, 42],
  floorFR: [44, 42],
  floorBR: [55, 34],
  gripF: [9, 18],
  gripB: [20, 10],
};

export const GLYPH_MICRO = {
  side: `M${pts(M.rimFR, M.rimBR, M.floorBR, M.floorFR)}Z`,
  basket: `M${pts(M.rimBL, M.rimFL, M.floorFL, M.floorFR, M.rimFR)}`,
  rim: `M${pts(M.rimFL, M.rimFR, M.rimBR, M.rimBL)}Z`,
  // One post: at 16px the second post merges into the grip.
  posts: line(M.rimFL, M.gripF),
  grip: line(M.gripF, M.gripB),
  plate: { x: 24, y: 32, width: 16, height: 4, rx: 0.5 },
  wheels: [
    { cx: 24, cy: 52, r: 4 },
    { cx: 40, cy: 52, r: 4 },
  ],
  stroke: { rim: 4, basket: 4, posts: 3, grip: 5 },
};

/** Brand palette, mirrored from styles/tokens.css for use inside SVG. */
export const BRAND_COLORS = {
  navy: '#1e3a5f',
  navyDeep: '#0f2744',
  midnight: '#081628',
  goldLight: '#f6dd8a',
  gold: '#d9a62e',
  goldDeep: '#a8761a',
  chromeHi: '#ffffff',
  chrome: '#dfe4ec',
  chromeMid: '#9aa4b4',
  chromeLow: '#7d8798',
  ink: '#0f2744',
  paper: '#ffffff',
};
