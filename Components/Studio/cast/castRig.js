/**
 * The cast rig: original, layered SVG people for the studios.
 *
 * A *person* is who someone is (age, build, skin, hair, face, outfit). A
 * *placement* is what they are doing on one page (pose, mood, prop). The same
 * person appears on every page of a book, so editing their look once updates
 * the whole story; a placement only ever changes one picture.
 *
 * Everything is drawn here as SVG markup in rig units with the feet at
 * (0, 0) and up as negative y. `personArt` returns a standalone SVG document
 * plus its size, framed tight to the figure so selection boxes hug the art.
 * The renderer is pure: no DOM, so it runs in tests, on the server, and inside
 * the canvas paint path through `castRaster`.
 *
 * The one rule of the studio applies: every option a shopper can pick changes
 * the drawing. `__tests__/castRig.test.js` renders each option against the
 * defaults and fails if the markup does not change.
 */

/* --------------------------------------------------------------- tables -- */

const opt = (id, name, extra = {}) => ({ id, name, ...extra });

export const SKIN_TONES = [
  opt('porcelain', 'Porcelain', { value: '#fde7d6' }),
  opt('ivory', 'Ivory', { value: '#f8d9c0' }),
  opt('peach', 'Peach', { value: '#f3c6a5' }),
  opt('sand', 'Sand', { value: '#e8b48c' }),
  opt('honey', 'Honey', { value: '#d9a071' }),
  opt('golden', 'Golden', { value: '#c98d5b' }),
  opt('caramel', 'Caramel', { value: '#b5774a' }),
  opt('amber', 'Amber', { value: '#9e6439' }),
  opt('chestnut', 'Chestnut', { value: '#87512d' }),
  opt('cocoa', 'Cocoa', { value: '#6e4024' }),
  opt('espresso', 'Espresso', { value: '#56301c' }),
  opt('ebony', 'Ebony', { value: '#3f2215' }),
];

export const HAIR_COLORS = [
  opt('black', 'Black', { value: '#231a17' }),
  opt('espresso', 'Dark brown', { value: '#3f2a1f' }),
  opt('brown', 'Brown', { value: '#6b4429' }),
  opt('chestnut', 'Chestnut', { value: '#8a4f2a' }),
  opt('auburn', 'Auburn', { value: '#a2442a' }),
  opt('ginger', 'Ginger', { value: '#d06f2c' }),
  opt('honey', 'Honey blonde', { value: '#c9954d' }),
  opt('blonde', 'Blonde', { value: '#e8c977' }),
  opt('platinum', 'Platinum', { value: '#efe3c4' }),
  opt('grey', 'Grey', { value: '#a9a5a2' }),
  opt('silver', 'Silver', { value: '#d8d8dc' }),
  opt('pink', 'Pink', { value: '#ec8fb4' }),
  opt('blue', 'Blue', { value: '#5b8fd9' }),
  opt('purple', 'Purple', { value: '#8d63c9' }),
];

export const EYE_COLORS = [
  opt('brown', 'Brown', { value: '#5a3a22' }),
  opt('dark', 'Dark brown', { value: '#2e1f16' }),
  opt('hazel', 'Hazel', { value: '#8a6a32' }),
  opt('green', 'Green', { value: '#4c7d4a' }),
  opt('blue', 'Blue', { value: '#3f78b5' }),
  opt('grey', 'Grey', { value: '#6f7c86' }),
];

/** Clothing and accessory colours, shared by every garment control. */
export const CLOTH_COLORS = [
  opt('white', 'White', { value: '#f7f5f0' }),
  opt('cream', 'Cream', { value: '#efe2c4' }),
  opt('charcoal', 'Charcoal', { value: '#3b3a40' }),
  opt('navy', 'Navy', { value: '#2c3e6b' }),
  opt('denim', 'Denim', { value: '#4a6fa5' }),
  opt('sky', 'Sky', { value: '#86c1e8' }),
  opt('teal', 'Teal', { value: '#2f9c95' }),
  opt('mint', 'Mint', { value: '#9fdcc0' }),
  opt('forest', 'Forest', { value: '#3e7a4a' }),
  opt('olive', 'Olive', { value: '#8a8a45' }),
  opt('mustard', 'Mustard', { value: '#e3b23c' }),
  opt('orange', 'Orange', { value: '#ee8434' }),
  opt('red', 'Red', { value: '#d94a43' }),
  opt('berry', 'Berry', { value: '#b23a6b' }),
  opt('pink', 'Pink', { value: '#f2a1bf' }),
  opt('lilac', 'Lilac', { value: '#b79ce0' }),
  opt('plum', 'Plum', { value: '#6b3f7a' }),
  opt('tan', 'Tan', { value: '#c9a27a' }),
  opt('brown', 'Brown', { value: '#7a5236' }),
  opt('black', 'Black', { value: '#232227' }),
];

export const AGES = [
  opt('adult', 'Adult'),
  opt('kid', 'Kid'),
  opt('toddler', 'Little one'),
];

export const BUILDS = [
  opt('slim', 'Slim', { shoulder: 0.9, hip: 0.9, limb: 0.92 }),
  opt('regular', 'Regular', { shoulder: 1, hip: 1, limb: 1 }),
  opt('curvy', 'Curvy', { shoulder: 0.98, hip: 1.2, limb: 1.04 }),
  opt('broad', 'Broad', { shoulder: 1.16, hip: 1.06, limb: 1.1 }),
];

export const HEIGHTS = [
  opt('short', 'Short', { scale: 0.93 }),
  opt('average', 'Average', { scale: 1 }),
  opt('tall', 'Tall', { scale: 1.07 }),
];

export const FACE_SHAPES = [
  opt('round', 'Round'),
  opt('oval', 'Oval'),
  opt('square', 'Square'),
  opt('heart', 'Heart'),
];

export const EYE_STYLES = [
  opt('dot', 'Dots'),
  opt('round', 'Round'),
  opt('almond', 'Almond'),
  opt('sleepy', 'Sleepy'),
  opt('lashes', 'Lashes'),
];

export const BROWS = [
  opt('soft', 'Soft'),
  opt('bold', 'Bold'),
  opt('arched', 'Arched'),
  opt('straight', 'Straight'),
  opt('none', 'None'),
];

export const NOSES = [
  opt('button', 'Button'),
  opt('dot', 'Dot'),
  opt('curve', 'Curve'),
  opt('round', 'Round'),
];

export const HAIR_STYLES = [
  opt('bald', 'Bald'),
  opt('buzz', 'Buzz cut'),
  opt('crop', 'Short crop'),
  opt('sidePart', 'Side part'),
  opt('spiky', 'Spiky'),
  opt('curlyTop', 'Curly top'),
  opt('afro', 'Afro'),
  opt('pixie', 'Pixie'),
  opt('bob', 'Bob'),
  opt('long', 'Long straight'),
  opt('waves', 'Long waves'),
  opt('ponytail', 'Ponytail'),
  opt('buns', 'Space buns'),
  opt('braids', 'Braids'),
  opt('locs', 'Locs'),
  opt('wrap', 'Head wrap'),
];

export const FACIAL_HAIR = [
  opt('none', 'None'),
  opt('stubble', 'Stubble'),
  opt('mustache', 'Moustache'),
  opt('goatee', 'Goatee'),
  opt('beard', 'Full beard'),
];

export const GLASSES = [
  opt('none', 'None'),
  opt('round', 'Round'),
  opt('square', 'Square'),
  opt('catEye', 'Cat-eye'),
  opt('sunnies', 'Sunglasses'),
];

/** `sleeve` is the share of the arm a sleeve covers; dresses replace bottoms. */
export const TOPS = [
  opt('tee', 'T-shirt', { sleeve: 0.42 }),
  opt('longsleeve', 'Long sleeve', { sleeve: 0.94 }),
  opt('tank', 'Tank top', { sleeve: 0 }),
  opt('hoodie', 'Hoodie', { sleeve: 0.96 }),
  opt('sweater', 'Sweater', { sleeve: 0.96 }),
  opt('shirt', 'Button shirt', { sleeve: 0.9 }),
  opt('polo', 'Polo', { sleeve: 0.4 }),
  opt('jacket', 'Jacket', { sleeve: 0.96 }),
  opt('sundress', 'Sundress', { sleeve: 0, dress: 0.55 }),
  opt('partyDress', 'Party dress', { sleeve: 0.22, dress: 0.5 }),
  opt('longDress', 'Long dress', { sleeve: 0.94, dress: 0.92 }),
];

/** `cover` is the share of the leg a garment covers. */
export const BOTTOMS = [
  opt('jeans', 'Jeans', { cover: 0.93 }),
  opt('trousers', 'Trousers', { cover: 0.95 }),
  opt('shorts', 'Shorts', { cover: 0.38 }),
  opt('skirt', 'Skirt', { cover: 0 }),
  opt('leggings', 'Leggings', { cover: 0.97 }),
  opt('overalls', 'Overalls', { cover: 0.9 }),
];

export const PATTERNS = [
  opt('solid', 'Solid'),
  opt('stripes', 'Stripes'),
  opt('dots', 'Dots'),
  opt('stars', 'Stars'),
  opt('hearts', 'Hearts'),
  opt('plaid', 'Plaid'),
];

export const SHOES = [
  opt('sneakers', 'Sneakers'),
  opt('boots', 'Boots'),
  opt('sandals', 'Sandals'),
  opt('dress', 'Dress shoes'),
  opt('rainboots', 'Rain boots'),
  opt('barefoot', 'Barefoot'),
];

export const HATS = [
  opt('none', 'None'),
  opt('cap', 'Cap'),
  opt('beanie', 'Beanie'),
  opt('sunHat', 'Sun hat'),
  opt('crown', 'Crown'),
  opt('partyHat', 'Party hat'),
  opt('bow', 'Bow'),
  opt('flowers', 'Flower crown'),
];

/** Arm and leg angles in degrees from straight down; positive swings outward. */
export const POSES = [
  opt('stand', 'Stand', { armL: 8, armR: 8, legL: 2, legR: 2 }),
  opt('wave', 'Wave', { armL: 8, armR: 150, legL: 2, legR: 2 }),
  opt('cheer', 'Cheer', { armL: 155, armR: 155, legL: 6, legR: 6 }),
  opt('point', 'Point', { armL: 8, armR: 92, legL: 2, legR: 2 }),
  opt('reach', 'Hold hands', { armL: 8, armR: 38, legL: 2, legR: 2 }),
  opt('walk', 'Walk', { armL: 20, armR: -10, legL: 14, legR: -8 }),
  opt('jump', 'Jump', { armL: 135, armR: 135, legL: 18, legR: 18, lift: 0.12 }),
  opt('shy', 'Shy', { armL: -6, armR: -6, legL: 0, legR: 0 }),
];

export const MOODS = [
  opt('smile', 'Smile'),
  opt('grin', 'Grin'),
  opt('laugh', 'Laugh'),
  opt('soft', 'Soft'),
  opt('wow', 'Wow'),
  opt('wink', 'Wink'),
  opt('cheeky', 'Cheeky'),
  opt('calm', 'Calm'),
  opt('sad', 'Sad'),
];

export const PROPS = [
  opt('none', 'Nothing'),
  opt('balloon', 'Balloon'),
  opt('flowers', 'Flowers'),
  opt('book', 'Book'),
  opt('iceCream', 'Ice cream'),
  opt('gift', 'Gift'),
  opt('teddy', 'Teddy bear'),
  opt('ball', 'Ball'),
  opt('wand', 'Star wand'),
  opt('umbrella', 'Umbrella'),
  opt('cupcake', 'Cupcake'),
];

const byId = (table, id) => table.find((o) => o.id === id) ?? table[0];
const colorOf = (table, id) => byId(table, id).value ?? id;

/* -------------------------------------------------------------- person -- */

export const DEFAULT_PERSON = {
  name: '',
  age: 'kid',
  build: 'regular',
  height: 'average',
  skin: 'sand',
  faceShape: 'round',
  eyes: 'round',
  eyeColor: 'brown',
  brows: 'soft',
  nose: 'button',
  blush: true,
  freckles: false,
  hair: 'crop',
  hairColor: 'brown',
  facialHair: 'none',
  glasses: 'none',
  top: 'tee',
  topColor: 'sky',
  pattern: 'solid',
  accentColor: 'white',
  bottom: 'jeans',
  bottomColor: 'denim',
  shoes: 'sneakers',
  shoeColor: 'red',
  hat: 'none',
  hatColor: 'mustard',
};

/** Every person option and the table its values come from. */
export const PERSON_FIELDS = {
  age: AGES,
  build: BUILDS,
  height: HEIGHTS,
  skin: SKIN_TONES,
  faceShape: FACE_SHAPES,
  eyes: EYE_STYLES,
  eyeColor: EYE_COLORS,
  brows: BROWS,
  nose: NOSES,
  hair: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  facialHair: FACIAL_HAIR,
  glasses: GLASSES,
  top: TOPS,
  topColor: CLOTH_COLORS,
  pattern: PATTERNS,
  accentColor: CLOTH_COLORS,
  bottom: BOTTOMS,
  bottomColor: CLOTH_COLORS,
  shoes: SHOES,
  shoeColor: CLOTH_COLORS,
  hat: HATS,
  hatColor: CLOTH_COLORS,
};

/** Fill in missing fields and drop values that are not in their table. */
export const normalizePerson = (person = {}) => {
  const out = { ...DEFAULT_PERSON, ...person };
  Object.entries(PERSON_FIELDS).forEach(([key, table]) => {
    if (!table.some((o) => o.id === out[key])) out[key] = DEFAULT_PERSON[key];
  });
  out.blush = Boolean(out.blush);
  out.freckles = Boolean(out.freckles);
  return out;
};

/** Starting looks for "add a person": a grown-up, a kid and a little one. */
export const PERSON_PRESETS = {
  adult: {
    age: 'adult',
    skin: 'golden',
    hair: 'waves',
    hairColor: 'espresso',
    top: 'sweater',
    topColor: 'berry',
    bottom: 'jeans',
    bottomColor: 'denim',
    shoes: 'boots',
    shoeColor: 'brown',
    blush: false,
    eyes: 'almond',
  },
  kid: { ...DEFAULT_PERSON, age: 'kid' },
  toddler: {
    age: 'toddler',
    skin: 'peach',
    hair: 'curlyTop',
    hairColor: 'honey',
    top: 'tee',
    topColor: 'mustard',
    pattern: 'stars',
    accentColor: 'white',
    bottom: 'overalls',
    bottomColor: 'denim',
    shoes: 'sneakers',
    shoeColor: 'sky',
    eyes: 'dot',
  },
};

/* ------------------------------------------------------------ geometry -- */

const SKELETONS = {
  adult: {
    leg: 80,
    torso: 68,
    headR: 31,
    shoulder: 26,
    hip: 20,
    arm: 68,
    armW: 12.5,
    legW: 15,
    neck: 7,
  },
  kid: {
    leg: 50,
    torso: 46,
    headR: 30,
    shoulder: 20,
    hip: 16.5,
    arm: 46,
    armW: 11,
    legW: 13,
    neck: 4,
  },
  toddler: {
    leg: 32,
    torso: 36,
    headR: 28.5,
    shoulder: 17.5,
    hip: 15.5,
    arm: 34,
    armW: 10,
    legW: 12,
    neck: 2,
  },
};

/** Resolved body measurements for a person, in rig units. */
const bodyOf = (p) => {
  const base = SKELETONS[p.age] ?? SKELETONS.kid;
  const build = byId(BUILDS, p.build);
  const tall = byId(HEIGHTS, p.height).scale;
  const leg = base.leg * tall;
  const torso = base.torso * tall;
  const hipY = -leg;
  const shoulderY = hipY - torso;
  const headR = base.headR;
  const headCY = shoulderY - base.neck - headR * 0.86;
  return {
    ...base,
    leg,
    torso,
    hipY,
    shoulderY,
    headR,
    headCY,
    shoulder: base.shoulder * build.shoulder,
    hip: base.hip * build.hip,
    armW: base.armW * build.limb,
    legW: base.legW * build.limb,
  };
};

/* --------------------------------------------------------------- colour -- */

const INK = '#2b2433';

const clampByte = (v) => Math.max(0, Math.min(255, Math.round(v)));
export const shade = (hex, t) => {
  const n = parseInt(String(hex).replace('#', ''), 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const mix = (c) => (t < 0 ? c * (1 + t) : c + (255 - c) * t);
  return `#${[mix(r), mix(g), mix(b)].map((c) => clampByte(c).toString(16).padStart(2, '0')).join('')}`;
};

const f = (n) => Math.round(n * 10) / 10;
const line = (w = 3) =>
  `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/* ------------------------------------------------------------- patterns -- */

let patternSeq = 0;

/** A fill for a garment: a solid colour, or a pattern of the accent on it. */
const garmentFill = (defs, base, accent, pattern) => {
  if (pattern === 'solid') return base;
  const id = `cast-pat-${(patternSeq += 1)}`;
  const bodies = {
    stripes: `<rect width="12" height="12" fill="${base}"/><rect y="7" width="12" height="4" fill="${accent}"/>`,
    dots: `<rect width="12" height="12" fill="${base}"/><circle cx="3" cy="3" r="1.8" fill="${accent}"/><circle cx="9" cy="9" r="1.8" fill="${accent}"/>`,
    stars: `<rect width="14" height="14" fill="${base}"/><path d="M7 2.2l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="${accent}"/>`,
    hearts: `<rect width="14" height="14" fill="${base}"/><path d="M7 11S2.5 8.2 2.5 5.4C2.5 3.9 3.6 3 4.8 3c1 0 1.8.6 2.2 1.4C7.4 3.6 8.2 3 9.2 3c1.2 0 2.3.9 2.3 2.4C11.5 8.2 7 11 7 11z" fill="${accent}"/>`,
    plaid: `<rect width="14" height="14" fill="${base}"/><rect x="5" width="4" height="14" fill="${accent}" opacity=".45"/><rect y="5" width="14" height="4" fill="${accent}" opacity=".45"/><rect x="6.5" width="1" height="14" fill="${shade(base, -0.35)}" opacity=".6"/>`,
  };
  const size = pattern === 'stripes' || pattern === 'dots' ? 12 : 14;
  defs.push(
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${bodies[pattern] ?? ''}</pattern>`
  );
  return `url(#${id})`;
};

/* ----------------------------------------------------------------- limbs -- */

/** A straight limb as a capsule from its pivot, pointing down before rotation. */
const capsule = (w, len, fill, stroke = 3) =>
  `<rect x="${f(-w / 2)}" y="${f(-w / 2)}" width="${f(w)}" height="${f(len + w / 2)}" rx="${f(w / 2)}" fill="${fill}" ${line(stroke)}/>`;

/** Where the far end of a limb lands once rotated, in figure space. */
const limbEnd = (pivot, len, angle, side) => {
  const a = ((side < 0 ? angle : -angle) * Math.PI) / 180;
  return { x: pivot.x - Math.sin(a) * len, y: pivot.y + Math.cos(a) * len };
};

const rotateAt = (pivot, angle, side) =>
  `translate(${f(pivot.x)} ${f(pivot.y)}) rotate(${f(side < 0 ? angle : -angle)})`;

/* ---------------------------------------------------------------- shoes -- */

/** Shoes seen from the front: a rounded toe a little wider than the leg. */
const shoeMarkup = (kind, color, skin, w, side) => {
  const c = color;
  const sw = w * 1.55;
  const x0 = -sw / 2 + side * w * 0.12;
  const toe = (fill, h = w * 0.78) =>
    `<path d="M${f(x0)} ${f(w * 0.5)}V${f(w * 0.5 - h * 0.45)}Q${f(x0)} ${f(w * 0.5 - h)} ${f(x0 + sw / 2)} ${f(w * 0.5 - h)}Q${f(x0 + sw)} ${f(w * 0.5 - h)} ${f(x0 + sw)} ${f(w * 0.5 - h * 0.45)}V${f(w * 0.5)}z" fill="${fill}" ${line(2.6)}/>`;
  const sole = (fill) =>
    `<rect x="${f(x0 - 0.5)}" y="${f(w * 0.36)}" width="${f(sw + 1)}" height="${f(w * 0.26)}" rx="${f(w * 0.12)}" fill="${fill}" ${line(2.2)}/>`;
  switch (kind) {
    case 'barefoot':
      return `<ellipse cx="${f(side * w * 0.12)}" cy="${f(w * 0.24)}" rx="${f(w * 0.68)}" ry="${f(w * 0.36)}" fill="${skin}" ${line(2.4)}/>`;
    case 'sandals':
      return `<ellipse cx="${f(side * w * 0.12)}" cy="${f(w * 0.22)}" rx="${f(w * 0.68)}" ry="${f(w * 0.36)}" fill="${skin}" ${line(2.4)}/><path d="M${f(x0 + sw * 0.18)} ${f(w * 0.1)}h${f(sw * 0.64)}" stroke="${c}" stroke-width="${f(w * 0.26)}" stroke-linecap="round"/>${sole(shade(c, -0.25))}`;
    case 'boots':
    case 'rainboots': {
      const tall = kind === 'rainboots' ? 2.0 : 1.4;
      const shine =
        kind === 'rainboots'
          ? `<path d="M${f(-w * 0.22)} ${f(-w * tall + 4)}v${f(w * tall * 0.6)}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>`
          : '';
      return `<rect x="${f(-w * 0.62)}" y="${f(-w * tall)}" width="${f(w * 1.24)}" height="${f(w * tall + w * 0.2)}" rx="${f(w * 0.26)}" fill="${c}" ${line(2.6)}/>${toe(c)}${sole(shade(c, -0.3))}${shine}`;
    }
    case 'dress':
      return `${toe(c, w * 0.66)}<path d="M${f(x0 + sw * 0.3)} ${f(w * 0.04)}q${f(sw * 0.2)} -${f(w * 0.12)} ${f(sw * 0.4)} 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55" fill="none"/>`;
    default: // sneakers
      return `${toe(c)}${sole('#fff')}<path d="M${f(x0 + sw * 0.3)} ${f(-w * 0.12)}h${f(sw * 0.4)}M${f(x0 + sw * 0.34)} ${f(w * 0.06)}h${f(sw * 0.32)}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;
  }
};

/* ----------------------------------------------------------------- head -- */

const facePath = (shape, r) => {
  if (shape === 'oval')
    return `<ellipse cx="0" cy="0" rx="${f(r * 0.93)}" ry="${f(r * 1.06)}"`;
  if (shape === 'square')
    return `<rect x="${f(-r * 0.97)}" y="${f(-r * 0.98)}" width="${f(r * 1.94)}" height="${f(r * 1.98)}" rx="${f(r * 0.5)}"`;
  if (shape === 'heart')
    return `<path d="M0 ${f(r * 1.04)}C${f(-r * 0.62)} ${f(r * 0.98)} ${f(-r * 1.02)} ${f(r * 0.4)} ${f(-r * 1.0)} ${f(-r * 0.1)}C${f(-r * 0.98)} ${f(-r * 0.72)} ${f(-r * 0.55)} ${f(-r * 1.02)} 0 ${f(-r * 1.02)}S${f(r * 0.98)} ${f(-r * 0.72)} ${f(r * 1.0)} ${f(-r * 0.1)}C${f(r * 1.02)} ${f(r * 0.4)} ${f(r * 0.62)} ${f(r * 0.98)} 0 ${f(r * 1.04)}z"`;
  return `<circle cx="0" cy="0" r="${f(r)}"`;
};

const eyeMarkup = (style, mood, color, r, side) => {
  const x = side * r * 0.36;
  const y = r * 0.06;
  const s = r / 30;
  const closedHappy = `<path d="M${f(x - 5.5 * s)} ${f(y + 1.5 * s)}q${f(5.5 * s)} -${f(6.5 * s)} ${f(11 * s)} 0" fill="none" ${line(2.8)}/>`;
  if (mood === 'laugh' || (mood === 'wink' && side > 0)) return closedHappy;
  if (mood === 'calm')
    return `<path d="M${f(x - 5 * s)} ${f(y)}q${f(5 * s)} ${f(4 * s)} ${f(10 * s)} 0" fill="none" ${line(2.6)}/>`;
  const big = mood === 'wow' ? 1.25 : 1;
  if (style === 'dot')
    return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3.4 * s * big)}" ry="${f(4.2 * s * big)}" fill="${INK}"/><circle cx="${f(x + 1.2 * s)}" cy="${f(y - 1.6 * s)}" r="${f(1.1 * s)}" fill="#fff"/>`;
  const white = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(6.2 * s * big)}" ry="${f((style === 'almond' ? 4.6 : 6.6) * s * big)}" fill="#fff" ${line(2.2)}/>`;
  const iris = `<circle cx="${f(x + side * 0.6 * s)}" cy="${f(y + 0.6 * s)}" r="${f(3.9 * s * big)}" fill="${color}"/><circle cx="${f(x + side * 0.6 * s)}" cy="${f(y + 0.6 * s)}" r="${f(1.9 * s * big)}" fill="${INK}"/><circle cx="${f(x + 1.6 * s)}" cy="${f(y - 1.4 * s)}" r="${f(1.2 * s)}" fill="#fff"/>`;
  const lid =
    style === 'sleepy'
      ? `<path d="M${f(x - 6.6 * s)} ${f(y - 0.6 * s)}q${f(6.6 * s)} -${f(8 * s)} ${f(13.2 * s)} 0z" fill="${INK}" opacity=".85"/>`
      : '';
  const lashes =
    style === 'lashes'
      ? `<path d="M${f(x + side * 4.5 * s)} ${f(y - 4.6 * s)}l${f(side * 3 * s)} -${f(2.6 * s)}M${f(x + side * 1.6 * s)} ${f(y - 6.2 * s)}l${f(side * 1.5 * s)} -${f(3 * s)}" ${line(2.2)}/>`
      : '';
  return `${white}${iris}${lid}${lashes}`;
};

const browMarkup = (style, mood, hair, r, side) => {
  if (style === 'none') return '';
  const s = r / 30;
  const x = side * r * 0.36;
  const lift = mood === 'wow' ? -3.5 * s : mood === 'sad' ? -1 * s : 0;
  const y = -r * 0.3 + lift;
  const tilt = mood === 'sad' ? -2.6 * s : 0;
  const w = style === 'bold' ? 4.2 : style === 'straight' ? 3 : 2.6;
  const d =
    style === 'arched'
      ? `M${f(x - side * 6 * s)} ${f(y + 2 * s - side * tilt)}q${f(side * 6 * s)} -${f(6 * s)} ${f(side * 12 * s)} 0`
      : style === 'straight'
        ? `M${f(x - side * 6 * s)} ${f(y - side * tilt * 0.5)}l${f(side * 12 * s)} ${f(tilt)}`
        : `M${f(x - side * 6 * s)} ${f(y + 1 * s - side * tilt * 0.5)}q${f(side * 6 * s)} -${f(3.4 * s)} ${f(side * 12 * s)} ${f(0.4 * s + tilt)}`;
  return `<path d="${d}" fill="none" stroke="${shade(hair, -0.25)}" stroke-width="${f(w * s)}" stroke-linecap="round"/>`;
};

const noseMarkup = (style, skin, r) => {
  const s = r / 30;
  const y = r * 0.32;
  if (style === 'dot')
    return `<circle cx="0" cy="${f(y)}" r="${f(1.8 * s)}" fill="${shade(skin, -0.38)}"/>`;
  if (style === 'curve')
    return `<path d="M${f(-1 * s)} ${f(y - 4 * s)}q${f(4 * s)} ${f(4 * s)} 0 ${f(6 * s)}" fill="none" stroke="${shade(skin, -0.4)}" stroke-width="${f(2.2 * s)}" stroke-linecap="round"/>`;
  if (style === 'round')
    return `<ellipse cx="0" cy="${f(y)}" rx="${f(4.6 * s)}" ry="${f(3.6 * s)}" fill="${shade(skin, -0.12)}" stroke="${shade(skin, -0.38)}" stroke-width="${f(1.6 * s)}"/>`;
  return `<ellipse cx="0" cy="${f(y)}" rx="${f(3.4 * s)}" ry="${f(2.5 * s)}" fill="${shade(skin, -0.22)}"/>`;
};

const mouthMarkup = (mood, r) => {
  const s = r / 30;
  const y = r * 0.56;
  const w = 8 * s;
  switch (mood) {
    case 'grin':
      return `<path d="M${f(-w * 1.2)} ${f(y - 2 * s)}q${f(w * 1.2)} ${f(12 * s)} ${f(w * 2.4)} 0z" fill="#fff" ${line(2.4)}/><path d="M${f(-w * 1.05)} ${f(y - 1 * s)}h${f(w * 2.1)}" stroke="${INK}" stroke-width="${f(1.2 * s)}" opacity=".3"/>`;
    case 'laugh':
      return `<path d="M${f(-w * 1.25)} ${f(y - 3 * s)}q${f(w * 1.25)} ${f(16 * s)} ${f(w * 2.5)} 0z" fill="#7a2d3b" ${line(2.4)}/><path d="M${f(-w * 0.6)} ${f(y + 4 * s)}q${f(w * 0.6)} -${f(4.5 * s)} ${f(w * 1.2)} 0" fill="#ef7f8f"/>`;
    case 'soft':
      return `<path d="M${f(-w * 0.55)} ${f(y)}q${f(w * 0.55)} ${f(4 * s)} ${f(w * 1.1)} 0" fill="none" ${line(2.6)}/>`;
    case 'wow':
      return `<ellipse cx="0" cy="${f(y + 1 * s)}" rx="${f(4.4 * s)}" ry="${f(5.6 * s)}" fill="#7a2d3b" ${line(2.4)}/>`;
    case 'wink':
    case 'smile':
      return `<path d="M${f(-w)} ${f(y - 1 * s)}q${f(w)} ${f(9 * s)} ${f(w * 2)} 0" fill="none" ${line(2.8)}/>`;
    case 'cheeky':
      return `<path d="M${f(-w)} ${f(y - 1 * s)}q${f(w)} ${f(9 * s)} ${f(w * 2)} 0" fill="none" ${line(2.8)}/><path d="M${f(w * 0.05)} ${f(y + 3 * s)}q${f(w * 0.45)} ${f(6 * s)} ${f(w * 0.9)} 0" fill="#ef7f8f" ${line(2)}/>`;
    case 'calm':
      return `<path d="M${f(-w * 0.6)} ${f(y + 1 * s)}h${f(w * 1.2)}" ${line(2.6)}/>`;
    case 'sad':
      return `<path d="M${f(-w * 0.8)} ${f(y + 3 * s)}q${f(w * 0.8)} -${f(6 * s)} ${f(w * 1.6)} 0" fill="none" ${line(2.6)}/>`;
    default:
      return '';
  }
};

const facialHairMarkup = (kind, hair, r) => {
  const s = r / 30;
  const c = shade(hair, -0.05);
  if (kind === 'stubble')
    return `<path d="M${f(-r * 0.78)} ${f(r * 0.28)}C${f(-r * 0.7)} ${f(r * 1.0)} ${f(r * 0.7)} ${f(r * 1.0)} ${f(r * 0.78)} ${f(r * 0.28)}C${f(r * 0.5)} ${f(r * 0.8)} ${f(-r * 0.5)} ${f(r * 0.8)} ${f(-r * 0.78)} ${f(r * 0.28)}z" fill="${c}" opacity=".28"/>`;
  if (kind === 'mustache')
    return `<path d="M0 ${f(r * 0.45)}c${f(-3 * s)} -${f(4 * s)} ${f(-11 * s)} -${f(3 * s)} ${f(-12 * s)} ${f(2 * s)}c${f(4 * s)} ${f(1 * s)} ${f(9 * s)} ${f(1 * s)} ${f(12 * s)} -${f(1 * s)}c${f(3 * s)} ${f(2 * s)} ${f(8 * s)} ${f(2 * s)} ${f(12 * s)} ${f(1 * s)}c${f(-1 * s)} -${f(5 * s)} ${f(-9 * s)} -${f(6 * s)} ${f(-12 * s)} -${f(2 * s)}z" fill="${c}" ${line(2)}/>`;
  if (kind === 'goatee')
    return `<path d="M${f(-7 * s)} ${f(r * 0.74)}c0 ${f(9 * s)} ${f(14 * s)} ${f(9 * s)} ${f(14 * s)} 0c${f(-4 * s)} ${f(2 * s)} ${f(-10 * s)} ${f(2 * s)} ${f(-14 * s)} 0z" fill="${c}" ${line(2)}/>${facialHairMarkup('mustache', hair, r)}`;
  if (kind === 'beard')
    return `<path d="M${f(-r * 0.96)} ${f(-r * 0.05)}C${f(-r * 0.95)} ${f(r * 1.25)} ${f(r * 0.95)} ${f(r * 1.25)} ${f(r * 0.96)} ${f(-r * 0.05)}C${f(r * 0.7)} ${f(r * 0.6)} ${f(r * 0.4)} ${f(r * 0.5)} 0 ${f(r * 0.5)}S${f(-r * 0.7)} ${f(r * 0.6)} ${f(-r * 0.96)} ${f(-r * 0.05)}z" fill="${c}" ${line(2.4)}/><path d="M${f(-6 * s)} ${f(r * 0.62)}q${f(6 * s)} ${f(5 * s)} ${f(12 * s)} 0" fill="#7a2d3b" opacity=".8"/>`;
  return '';
};

const glassesMarkup = (kind, r) => {
  if (kind === 'none') return '';
  const s = r / 30;
  const x = r * 0.36;
  const y = r * 0.06;
  const lens = (cx) => {
    if (kind === 'square')
      return `<rect x="${f(cx - 8 * s)}" y="${f(y - 6.5 * s)}" width="${f(16 * s)}" height="${f(13 * s)}" rx="${f(3 * s)}"`;
    if (kind === 'catEye')
      return `<path d="M${f(cx - 8.5 * s)} ${f(y - 6 * s)}q${f(8.5 * s)} -${f(3 * s)} ${f(17 * s)} -${f(1.5 * s)}q-${f(1 * s)} ${f(12 * s)} -${f(8 * s)} ${f(13 * s)}q-${f(8 * s)} 0 -${f(9 * s)} -${f(11.5 * s)}z"`;
    return `<circle cx="${f(cx)}" cy="${f(y)}" r="${f(8 * s)}"`;
  };
  const fill =
    kind === 'sunnies'
      ? `fill="${INK}" fill-opacity=".85"`
      : 'fill="#fff" fill-opacity=".18"';
  const frame = kind === 'catEye' ? '#b23a6b' : INK;
  return `${lens(-x)} ${fill} stroke="${frame}" stroke-width="${f(2.6 * s)}"/>${lens(x)} ${fill} stroke="${frame}" stroke-width="${f(2.6 * s)}"/><path d="M${f(-x + 8 * s)} ${f(y - 1 * s)}q${f(x - 8 * s)} -${f(3 * s)} ${f(2 * (x - 8 * s))} 0" fill="none" stroke="${frame}" stroke-width="${f(2.4 * s)}"/>`;
};

/** Hair in two parts: what sits behind the head and what frames the face. */
const hairMarkup = (style, color, r) => {
  const c = color;
  const dark = shade(c, -0.28);
  const st = `stroke="${dark}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const cap = (depth = 0.35) =>
    `<path d="M${f(-r * 1.02)} ${f(-r * depth + 2)}C${f(-r * 1.08)} ${f(-r * 1.25)} ${f(r * 1.08)} ${f(-r * 1.25)} ${f(r * 1.02)} ${f(-r * depth + 2)}C${f(r * 0.6)} ${f(-r * 0.62)} ${f(-r * 0.6)} ${f(-r * 0.62)} ${f(-r * 1.02)} ${f(-r * depth + 2)}z" fill="${c}" ${st}/>`;
  const fringe = `<path d="M${f(-r * 1.0)} ${f(-r * 0.2)}C${f(-r * 1.06)} ${f(-r * 1.22)} ${f(r * 1.06)} ${f(-r * 1.22)} ${f(r * 1.0)} ${f(-r * 0.2)}C${f(r * 0.8)} ${f(-r * 0.5)} ${f(r * 0.45)} ${f(-r * 0.62)} ${f(r * 0.2)} ${f(-r * 0.46)}C${f(0)} ${f(-r * 0.7)} ${f(-r * 0.55)} ${f(-r * 0.66)} ${f(-r * 1.0)} ${f(-r * 0.2)}z" fill="${c}" ${st}/>`;
  const longBack = (len, wave = false) => {
    const bottom = r * len;
    const sideX = r * 1.12;
    const edge = wave
      ? `C${f(sideX + 8)} ${f(bottom * 0.4)} ${f(sideX - 6)} ${f(bottom * 0.7)} ${f(sideX + 4)} ${f(bottom)}Q0 ${f(bottom + 10)} ${f(-sideX - 4)} ${f(bottom)}C${f(-sideX + 6)} ${f(bottom * 0.7)} ${f(-sideX - 8)} ${f(bottom * 0.4)} ${f(-sideX)} 0`
      : `L${f(sideX + 2)} ${f(bottom)}Q0 ${f(bottom + 8)} ${f(-sideX - 2)} ${f(bottom)}L${f(-sideX)} 0`;
    return `<path d="M${f(-sideX)} 0C${f(-sideX)} ${f(-r * 1.5)} ${f(sideX)} ${f(-r * 1.5)} ${f(sideX)} 0${edge}z" fill="${c}" ${st}/>`;
  };
  switch (style) {
    case 'bald':
      return { back: '', front: '' };
    case 'buzz':
      return {
        back: '',
        front: `<path d="M${f(-r * 0.98)} ${f(-r * 0.32)}C${f(-r * 1.0)} ${f(-r * 1.18)} ${f(r * 1.0)} ${f(-r * 1.18)} ${f(r * 0.98)} ${f(-r * 0.32)}C${f(r * 0.6)} ${f(-r * 0.7)} ${f(-r * 0.6)} ${f(-r * 0.7)} ${f(-r * 0.98)} ${f(-r * 0.32)}z" fill="${c}" opacity=".9"/>`,
      };
    case 'crop':
      return {
        back: '',
        front: `${cap(0.3)}<path d="M${f(-r * 0.7)} ${f(-r * 0.62)}l${f(r * 0.18)} ${f(r * 0.14)}l${f(r * 0.16)} -${f(r * 0.1)}l${f(r * 0.18)} ${f(r * 0.12)}l${f(r * 0.18)} -${f(r * 0.1)}" fill="none" ${st}/>`,
      };
    case 'sidePart':
      return {
        back: '',
        front: `${cap(0.28)}<path d="M${f(-r * 0.2)} ${f(-r * 1.0)}C${f(r * 0.1)} ${f(-r * 0.6)} ${f(r * 0.7)} ${f(-r * 0.7)} ${f(r * 1.02)} ${f(-r * 0.3)}" fill="none" ${st}/><path d="M${f(-r * 1.02)} ${f(-r * 0.28)}C${f(-r * 0.8)} ${f(-r * 0.7)} ${f(-r * 0.4)} ${f(-r * 0.8)} ${f(-r * 0.2)} ${f(-r * 1.0)}" fill="none" ${st}/>`,
      };
    case 'spiky': {
      const spikes = [-0.85, -0.5, -0.15, 0.2, 0.55, 0.88]
        .map(
          (t, i) =>
            `L${f(r * t)} ${f(-r * (1.32 + (i % 2) * 0.12))}L${f(r * (t + 0.18))} ${f(-r * 0.92)}`
        )
        .join('');
      return {
        back: '',
        front: `<path d="M${f(-r * 1.02)} ${f(-r * 0.3)}L${f(-r * 1.0)} ${f(-r * 0.92)}${spikes}L${f(r * 1.02)} ${f(-r * 0.3)}C${f(r * 0.6)} ${f(-r * 0.66)} ${f(-r * 0.6)} ${f(-r * 0.66)} ${f(-r * 1.02)} ${f(-r * 0.3)}z" fill="${c}" ${st}/>`,
      };
    }
    case 'curlyTop': {
      const curls = [
        [-0.78, -0.62],
        [-0.45, -0.92],
        [-0.05, -1.04],
        [0.38, -0.95],
        [0.75, -0.66],
        [-0.2, -0.72],
        [0.22, -0.74],
      ];
      return {
        back: '',
        front: curls
          .map(
            ([x, y]) =>
              `<circle cx="${f(r * x)}" cy="${f(r * y)}" r="${f(r * 0.32)}" fill="${c}" ${st}/>`
          )
          .join(''),
      };
    }
    case 'afro':
      return {
        back: `<circle cx="0" cy="${f(-r * 0.28)}" r="${f(r * 1.48)}" fill="${c}" ${st}/>`,
        front: `<path d="M${f(-r * 1.04)} ${f(-r * 0.12)}C${f(-r * 1.1)} ${f(-r * 1.3)} ${f(r * 1.1)} ${f(-r * 1.3)} ${f(r * 1.04)} ${f(-r * 0.12)}C${f(r * 0.8)} ${f(-r * 0.5)} ${f(r * 0.4)} ${f(-r * 0.6)} 0 ${f(-r * 0.56)}S${f(-r * 0.8)} ${f(-r * 0.5)} ${f(-r * 1.04)} ${f(-r * 0.12)}z" fill="${c}" ${st}/>`,
      };
    case 'pixie':
      return {
        back: '',
        front: `${cap(0.2)}<path d="M${f(-r * 1.0)} ${f(-r * 0.24)}C${f(-r * 0.6)} ${f(-r * 0.2)} ${f(-r * 0.2)} ${f(-r * 0.4)} ${f(r * 0.1)} ${f(-r * 0.75)}C${f(r * 0.4)} ${f(-r * 0.45)} ${f(r * 0.8)} ${f(-r * 0.5)} ${f(r * 1.0)} ${f(-r * 0.24)}" fill="${c}" ${st}/>`,
      };
    case 'bob':
      return { back: longBack(0.82), front: fringe };
    case 'long':
      return { back: longBack(2.1), front: fringe };
    case 'waves':
      return { back: longBack(2.0, true), front: fringe };
    case 'ponytail':
      return {
        back: `<path d="M${f(r * 0.7)} ${f(-r * 0.75)}C${f(r * 1.9)} ${f(-r * 0.9)} ${f(r * 2.0)} ${f(r * 0.6)} ${f(r * 1.4)} ${f(r * 1.4)}C${f(r * 1.6)} ${f(r * 0.5)} ${f(r * 1.2)} ${f(-r * 0.2)} ${f(r * 0.7)} ${f(-r * 0.3)}z" fill="${c}" ${st}/><circle cx="${f(r * 0.86)}" cy="${f(-r * 0.66)}" r="${f(r * 0.16)}" fill="#e85d75" ${line(2)}/>`,
        front: cap(0.3),
      };
    case 'buns':
      return {
        back: `<circle cx="${f(-r * 0.78)}" cy="${f(-r * 1.0)}" r="${f(r * 0.42)}" fill="${c}" ${st}/><circle cx="${f(r * 0.78)}" cy="${f(-r * 1.0)}" r="${f(r * 0.42)}" fill="${c}" ${st}/>`,
        front: fringe,
      };
    case 'braids': {
      const braid = (side) =>
        Array.from(
          { length: 5 },
          (_, i) =>
            `<ellipse cx="${f(side * r * 0.98)}" cy="${f(r * (0.2 + i * 0.36))}" rx="${f(r * 0.2)}" ry="${f(r * 0.22)}" fill="${c}" ${st}/>`
        ).join('');
      return {
        back: '',
        front: `${cap(0.2)}${braid(-1)}${braid(1)}<circle cx="${f(-r * 0.98)}" cy="${f(r * 1.95)}" r="${f(r * 0.1)}" fill="#e85d75"/><circle cx="${f(r * 0.98)}" cy="${f(r * 1.95)}" r="${f(r * 0.1)}" fill="#e85d75"/>`,
      };
    }
    case 'locs': {
      const strands = [-1.05, -0.8, 0.8, 1.05]
        .map(
          (x) =>
            `<rect x="${f(r * x - r * 0.12)}" y="${f(-r * 0.4)}" width="${f(r * 0.24)}" height="${f(r * 1.9)}" rx="${f(r * 0.12)}" fill="${c}" ${st}/>`
        )
        .join('');
      return {
        back: strands,
        front: `${cap(0.3)}<path d="M${f(-r * 0.6)} ${f(-r * 0.8)}v${f(r * 0.3)}M${f(-r * 0.2)} ${f(-r * 0.9)}v${f(r * 0.3)}M${f(r * 0.2)} ${f(-r * 0.9)}v${f(r * 0.3)}M${f(r * 0.6)} ${f(-r * 0.8)}v${f(r * 0.3)}" ${st}/>`,
      };
    }
    case 'wrap':
      return {
        back: `<path d="M${f(-r * 1.15)} ${f(-r * 0.1)}C${f(-r * 1.25)} ${f(-r * 1.55)} ${f(r * 1.25)} ${f(-r * 1.55)} ${f(r * 1.15)} ${f(-r * 0.1)}L${f(r * 1.1)} ${f(r * 1.25)}Q0 ${f(r * 1.55)} ${f(-r * 1.1)} ${f(r * 1.25)}z" fill="${c}" ${st}/>`,
        front: `<path d="M${f(-r * 1.0)} ${f(-r * 0.25)}C${f(-r * 1.05)} ${f(-r * 1.25)} ${f(r * 1.05)} ${f(-r * 1.25)} ${f(r * 1.0)} ${f(-r * 0.25)}C${f(r * 0.6)} ${f(-r * 0.6)} ${f(-r * 0.6)} ${f(-r * 0.6)} ${f(-r * 1.0)} ${f(-r * 0.25)}z" fill="${c}" ${st}/><path d="M${f(-r * 0.7)} ${f(-r * 0.85)}C${f(-r * 0.2)} ${f(-r * 0.55)} ${f(r * 0.3)} ${f(-r * 0.6)} ${f(r * 0.8)} ${f(-r * 0.95)}" fill="none" stroke="${shade(c, 0.25)}" stroke-width="3" stroke-linecap="round"/>`,
      };
    default:
      return { back: '', front: cap() };
  }
};

/** Hats sit on the head; `top` is how far above the head they reach. */
const hatMarkup = (kind, color, r) => {
  const c = color;
  switch (kind) {
    case 'cap':
      return {
        top: r * 1.2,
        svg: `<path d="M${f(-r * 1.0)} ${f(-r * 0.45)}C${f(-r * 1.0)} ${f(-r * 1.3)} ${f(r * 1.0)} ${f(-r * 1.3)} ${f(r * 1.0)} ${f(-r * 0.45)}z" fill="${c}" ${line(2.6)}/><path d="M${f(r * 0.2)} ${f(-r * 0.48)}h${f(r * 1.25)}q${f(r * 0.1)} ${f(r * 0.22)} -${f(r * 0.15)} ${f(r * 0.22)}H${f(r * 0.2)}z" fill="${shade(c, -0.18)}" ${line(2.6)}/><circle cx="0" cy="${f(-r * 1.08)}" r="${f(r * 0.1)}" fill="${shade(c, -0.25)}"/>`,
      };
    case 'beanie':
      return {
        top: r * 1.45,
        svg: `<path d="M${f(-r * 1.04)} ${f(-r * 0.32)}C${f(-r * 1.08)} ${f(-r * 1.45)} ${f(r * 1.08)} ${f(-r * 1.45)} ${f(r * 1.04)} ${f(-r * 0.32)}z" fill="${c}" ${line(2.6)}/><rect x="${f(-r * 1.1)}" y="${f(-r * 0.58)}" width="${f(r * 2.2)}" height="${f(r * 0.34)}" rx="${f(r * 0.12)}" fill="${shade(c, -0.15)}" ${line(2.6)}/><circle cx="0" cy="${f(-r * 1.32)}" r="${f(r * 0.2)}" fill="${shade(c, 0.35)}" ${line(2.4)}/>`,
      };
    case 'sunHat':
      return {
        top: r * 1.35,
        svg: `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 1.75)}" ry="${f(r * 0.32)}" fill="${c}" ${line(2.6)}/><path d="M${f(-r * 0.82)} ${f(-r * 0.6)}C${f(-r * 0.86)} ${f(-r * 1.45)} ${f(r * 0.86)} ${f(-r * 1.45)} ${f(r * 0.82)} ${f(-r * 0.6)}z" fill="${c}" ${line(2.6)}/><path d="M${f(-r * 0.84)} ${f(-r * 0.78)}h${f(r * 1.68)}" stroke="${shade(c, -0.35)}" stroke-width="${f(r * 0.16)}"/>`,
      };
    case 'crown':
      return {
        top: r * 1.6,
        svg: `<path d="M${f(-r * 0.7)} ${f(-r * 0.86)}l-${f(r * 0.1)} -${f(r * 0.66)} ${f(r * 0.38)} ${f(r * 0.3)} ${f(r * 0.42)} -${f(r * 0.5)} ${f(r * 0.42)} ${f(r * 0.5)} ${f(r * 0.38)} -${f(r * 0.3)} -${f(r * 0.1)} ${f(r * 0.66)}z" fill="#f2c94c" ${line(2.6)}/><circle cx="0" cy="${f(-r * 1.0)}" r="${f(r * 0.1)}" fill="${c}"/>`,
      };
    case 'partyHat':
      return {
        top: r * 2.1,
        svg: `<path d="M${f(-r * 0.6)} ${f(-r * 0.78)}L0 ${f(-r * 2.0)} ${f(r * 0.6)} ${f(-r * 0.78)}z" fill="${c}" ${line(2.6)}/><path d="M${f(-r * 0.38)} ${f(-r * 1.2)}h${f(r * 0.76)}M${f(-r * 0.2)} ${f(-r * 1.58)}h${f(r * 0.4)}" stroke="#fff" stroke-width="${f(r * 0.1)}" stroke-linecap="round"/><circle cx="0" cy="${f(-r * 2.02)}" r="${f(r * 0.14)}" fill="#f2c94c" ${line(2)}/>`,
      };
    case 'bow':
      return {
        top: r * 1.2,
        svg: `<g transform="translate(${f(r * 0.55)} ${f(-r * 0.92)}) rotate(18)"><path d="M0 0c-${f(r * 0.5)} -${f(r * 0.36)} -${f(r * 0.6)} ${f(r * 0.36)} 0 0zm0 0c${f(r * 0.5)} -${f(r * 0.36)} ${f(r * 0.6)} ${f(r * 0.36)} 0 0z" fill="${c}" ${line(2.4)}/><circle r="${f(r * 0.1)}" fill="${shade(c, -0.2)}" ${line(2)}/></g>`,
      };
    case 'flowers': {
      const colors = ['#f2a1bf', '#ffffff', '#f2c94c', '#f2a1bf', '#b79ce0'];
      return {
        top: r * 1.25,
        svg: `<path d="M${f(-r * 1.0)} ${f(-r * 0.62)}C${f(-r * 0.5)} ${f(-r * 1.15)} ${f(r * 0.5)} ${f(-r * 1.15)} ${f(r * 1.0)} ${f(-r * 0.62)}" fill="none" stroke="#5f9a52" stroke-width="3"/>${[-0.85, -0.45, 0, 0.45, 0.85].map((t, i) => `<circle cx="${f(r * t)}" cy="${f(-r * (0.66 + 0.3 * (1 - Math.abs(t))))}" r="${f(r * 0.17)}" fill="${colors[i]}" ${line(2)}/>`).join('')}`,
      };
    }
    default:
      return { top: 0, svg: '' };
  }
};

/* ---------------------------------------------------------------- props -- */

/** Props are drawn upright at the hand, whatever the arm is doing. */
const propMarkup = (kind, at, color, clear = 80) => {
  const { x, y } = at;
  const t = (body) => `<g transform="translate(${f(x)} ${f(y)})">${body}</g>`;
  switch (kind) {
    case 'balloon':
      return {
        reach: 130,
        svg: t(
          `<path d="M0 0c6-30-8-55 3-84" fill="none" ${line(1.8)}/><ellipse cx="4" cy="-112" rx="24" ry="29" fill="${color}" ${line(2.6)}/><path d="M0-84l4-4 4 4z" fill="${color}" ${line(1.8)}/><ellipse cx="-4" cy="-122" rx="5" ry="9" fill="#fff" opacity=".5"/>`
        ),
      };
    case 'flowers':
      return {
        reach: 48,
        svg: t(
          `<path d="M-5 14L0-22M5 14L1-22M0 15V-26" stroke="#4f8a45" stroke-width="2.6" stroke-linecap="round"/><path d="M-14-12l14 30 14-30z" fill="#f4e3c1" ${line(2.4)}/>${[
            [-9, -30, '#e85d75'],
            [7, -34, '#f2a1bf'],
            [-1, -43, '#f2c94c'],
            [12, -22, '#b79ce0'],
            [-13, -20, '#f2a1bf'],
          ]
            .map(
              ([px, py, c]) =>
                `<circle cx="${px}" cy="${py}" r="8" fill="${c}" ${line(2)}/><circle cx="${px}" cy="${py}" r="2.4" fill="#fff6d0"/>`
            )
            .join('')}`
        ),
      };
    case 'book':
      return {
        reach: 26,
        svg: t(
          `<rect x="-16" y="-24" width="32" height="26" rx="3" fill="${color}" ${line(2.4)}/><path d="M0-24v26" ${line(2)}/><path d="M-11-16h7M-11-11h7M4-16h7M4-11h7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`
        ),
      };
    case 'iceCream':
      return {
        reach: 42,
        svg: t(
          `<path d="M-9-10L0 14 9-10z" fill="#e0ad6a" ${line(2.4)}/><circle cx="0" cy="-18" r="11" fill="${color}" ${line(2.4)}/><circle cx="0" cy="-32" r="9" fill="#f7f0e6" ${line(2.4)}/><circle cx="2" cy="-41" r="3" fill="#d94a43"/>`
        ),
      };
    case 'gift':
      return {
        reach: 34,
        svg: t(
          `<rect x="-15" y="-22" width="30" height="26" rx="3" fill="${color}" ${line(2.4)}/><path d="M0-22v26M-15-11h30" stroke="#f2c94c" stroke-width="5"/><path d="M0-22c-8-12-18-4-9 0M0-22c8-12 18-4 9 0" fill="none" stroke="#f2c94c" stroke-width="3.4" stroke-linecap="round"/>`
        ),
      };
    case 'teddy':
      return {
        reach: 40,
        svg: t(
          `<circle cx="-9" cy="-34" r="5.5" fill="#b07a4a" ${line(2.2)}/><circle cx="9" cy="-34" r="5.5" fill="#b07a4a" ${line(2.2)}/><ellipse cx="0" cy="-8" rx="12" ry="14" fill="#b07a4a" ${line(2.4)}/><circle cx="0" cy="-26" r="11" fill="#b07a4a" ${line(2.4)}/><ellipse cx="0" cy="-22" rx="4.6" ry="3.4" fill="#f0d6b8"/><circle cx="-4" cy="-28" r="1.5" fill="${INK}"/><circle cx="4" cy="-28" r="1.5" fill="${INK}"/><path d="M-6-10a6 6 0 0 0 12 0" fill="${color}" opacity=".8"/>`
        ),
      };
    case 'ball':
      return {
        reach: 22,
        svg: t(
          `<circle cx="0" cy="-8" r="15" fill="${color}" ${line(2.4)}/><path d="M-15-8h30M0-23c-8 8-8 22 0 30M0-23c8 8 8 22 0 30" fill="none" stroke="#fff" stroke-width="2.4"/>`
        ),
      };
    case 'wand':
      return {
        reach: 46,
        svg: t(
          `<path d="M0 8L0-30" stroke="#6b3f7a" stroke-width="3.4" stroke-linecap="round"/><path d="M0-48l4 8.5 9.2.8-7 6 2.1 9-8.3-5-8.3 5 2.1-9-7-6 9.2-.8z" fill="#f2c94c" ${line(2.2)}/>`
        ),
      };
    case 'umbrella': {
      const h = Math.max(70, clear + 6);
      return {
        reach: h + 32,
        svg: t(
          `<path d="M0 6V${f(-h)}" ${line(3)}/><path d="M0 6c0 6-8 6-8 0" fill="none" ${line(3)}/><g transform="translate(0 ${f(-h + 70)})"><path d="M-52-66C-50-102 50-102 52-66C44-74 33-74 26-66C20-74 6-74 0-66C-6-74-20-74-26-66C-33-74-44-74-52-66z" fill="${color}" ${line(2.6)}/></g>`
        ),
      };
    }
    case 'cupcake':
      return {
        reach: 34,
        svg: t(
          `<path d="M-11-6l3 14h16l3-14z" fill="#f4e3c1" ${line(2.4)}/><path d="M-13-6c-2-12 8-18 13-14 5-4 15 2 13 14z" fill="${color}" ${line(2.4)}/><circle cx="0" cy="-24" r="3.5" fill="#d94a43" ${line(1.6)}/>`
        ),
      };
    default:
      return { reach: 0, svg: '' };
  }
};

/* ------------------------------------------------------------ assembly -- */

/**
 * Draw one person doing one thing.
 *   placement: { pose, mood, prop, propColor, side }
 *     side  — which way their partner stands (-1 left, 1 right, 0 alone);
 *             reaching poses reach toward them.
 * Returns { svg, width, height, markup } where `markup` is the bare SVG body
 * (for inlining) and `svg` a standalone document.
 */
export function personArt(person, placement = {}) {
  const p = normalizePerson(person);
  const b = bodyOf(p);
  const pose = { ...byId(POSES, placement.pose ?? 'stand') };
  const mood = byId(MOODS, placement.mood ?? 'smile').id;
  const prop = byId(PROPS, placement.prop ?? 'none').id;
  const propColor =
    placement.propColor ??
    colorOf(CLOTH_COLORS, p.accentColor === 'white' ? 'red' : p.accentColor);

  // A resting arm lifts a little to hold its prop out where it can be seen.
  const holding = placement.prop && placement.prop !== 'none';
  if (holding && ['stand', 'shy', 'walk'].includes(pose.id))
    pose.armR = placement.prop === 'umbrella' ? 44 : 30;

  // Reaching for a partner on the left uses the left arm.
  if (pose.id === 'reach' && placement.side < 0)
    [pose.armL, pose.armR] = [pose.armR, pose.armL];

  const skin = colorOf(SKIN_TONES, p.skin);
  const hairColor = colorOf(HAIR_COLORS, p.hairColor);
  const top = byId(TOPS, p.top);
  const bottom = byId(BOTTOMS, p.bottom);
  const topC = colorOf(CLOTH_COLORS, p.topColor);
  const accent = colorOf(CLOTH_COLORS, p.accentColor);
  const bottomC = colorOf(CLOTH_COLORS, p.bottomColor);
  const shoeC = colorOf(CLOTH_COLORS, p.shoeColor);
  const hatC = colorOf(CLOTH_COLORS, p.hatColor);
  const isDress = Boolean(top.dress);
  const defs = [];
  const topFill = garmentFill(defs, topC, accent, p.pattern);

  const lift = (pose.lift ?? 0) * b.leg;
  const out = [];
  const add = (s) => out.push(s);

  const shoulderL = {
    x: -(b.shoulder - b.armW * 0.42),
    y: b.shoulderY + b.armW * 0.55,
  };
  const shoulderR = {
    x: b.shoulder - b.armW * 0.42,
    y: b.shoulderY + b.armW * 0.55,
  };
  const hipL = { x: -b.hip * 0.5, y: b.hipY + 2 };
  const hipR = { x: b.hip * 0.5, y: b.hipY + 2 };

  const hair = hairMarkup(p.hair, hairColor, b.headR);
  const hat = hatMarkup(p.hat, hatC, b.headR);
  const headT = `translate(0 ${f(b.headCY)})`;

  // Everything lifts together on a jump.
  add(`<g transform="translate(0 ${f(-lift)})">`);

  // ── behind everything: back hair, hood
  if (hair.back) add(`<g transform="${headT}">${hair.back}</g>`);
  // A hood down: a soft collar of fabric behind the jaw and neck.
  if (p.top === 'hoodie')
    add(
      `<g transform="${headT}"><path d="M${f(-b.headR * 1.02)} ${f(b.headR * 0.45)}Q${f(-b.headR * 1.2)} ${f(b.headR * 1.32)} 0 ${f(b.headR * 1.42)}Q${f(b.headR * 1.2)} ${f(b.headR * 1.32)} ${f(b.headR * 1.02)} ${f(b.headR * 0.45)}z" fill="${shade(topC, -0.12)}" ${line()}/></g>`
    );

  // ── legs, bottoms and shoes
  const legAt = (pivot, angle, side) => {
    const parts = [];
    const cover = isDress ? 0 : bottom.cover;
    parts.push(capsule(b.legW, b.leg - 4, skin));
    if (cover > 0) {
      const fill = p.bottom === 'leggings' ? shade(bottomC, -0.05) : bottomC;
      parts.push(
        `<rect x="${f(-b.legW / 2 - 1.5)}" y="${f(-b.legW / 2)}" width="${f(b.legW + 3)}" height="${f(b.leg * cover)}" rx="${f(b.legW * 0.3)}" fill="${fill}" ${line()}/>`
      );
      if (p.bottom === 'jeans' || p.bottom === 'overalls')
        parts.push(
          `<path d="M${f(side * 2)} ${f(b.leg * 0.12)}v${f(b.leg * cover * 0.75)}" stroke="${shade(bottomC, 0.3)}" stroke-width="1.6" stroke-dasharray="3 3"/>`
        );
      if (p.bottom === 'jeans' && cover > 0.8)
        parts.push(
          `<path d="M${f(-b.legW / 2 - 1)} ${f(b.leg * cover - b.legW * 0.6)}h${f(b.legW + 2)}" stroke="${shade(bottomC, -0.25)}" stroke-width="2"/>`
        );
    }
    parts.push(
      `<g transform="translate(0 ${f(b.leg - 4)})">${shoeMarkup(p.shoes, shoeC, skin, b.legW, side)}</g>`
    );
    return `<g transform="${rotateAt(pivot, angle, side)}">${parts.join('')}</g>`;
  };
  add(legAt(hipL, pose.legL, -1));
  add(legAt(hipR, pose.legR, 1));

  // Hip block joins the legs to the torso under the garment.
  if (!isDress && bottom.cover > 0 && p.bottom !== 'skirt')
    add(
      `<path d="M${f(-b.hip - 1)} ${f(b.hipY - 8)}H${f(b.hip + 1)}V${f(b.hipY + b.legW * 0.9)}Q0 ${f(b.hipY + b.legW * 1.3)} ${f(-b.hip - 1)} ${f(b.hipY + b.legW * 0.9)}z" fill="${bottomC}" ${line()}/>`
    );

  // ── arms behind the torso edge (sleeves follow the arm)
  const armAt = (pivot, angle, side) => {
    const sleeve = top.sleeve;
    const sleeveFill = p.top === 'jacket' ? topC : topFill;
    const parts = [capsule(b.armW, b.arm, skin)];
    if (sleeve > 0)
      parts.push(
        `<rect x="${f(-b.armW / 2 - 1.5)}" y="${f(-b.armW / 2 - 1)}" width="${f(b.armW + 3)}" height="${f(b.arm * sleeve + b.armW * 0.3)}" rx="${f(b.armW * 0.45)}" fill="${sleeveFill}" ${line()}/>`
      );
    if (sleeve > 0.8)
      parts.push(
        `<path d="M${f(-b.armW / 2 - 1)} ${f(b.arm * sleeve - b.armW * 0.15)}h${f(b.armW + 2)}" stroke="${shade(topC, -0.3)}" stroke-width="2"/>`
      );
    parts.push(
      `<circle cx="0" cy="${f(b.arm)}" r="${f(b.armW * 0.66)}" fill="${skin}" ${line()}/>`
    );
    return `<g transform="${rotateAt(pivot, angle, side)}">${parts.join('')}</g>`;
  };

  // ── torso
  const sh = b.shoulder,
    hp = b.hip,
    sy = b.shoulderY,
    hy = b.hipY;
  const torso = `M${f(-sh + 6)} ${f(sy)}H${f(sh - 6)}Q${f(sh)} ${f(sy)} ${f(sh)} ${f(sy + 8)}L${f(hp + 1)} ${f(hy - 2)}Q${f(hp + 1)} ${f(hy + 4)} ${f(hp - 5)} ${f(hy + 4)}H${f(-hp + 5)}Q${f(-hp - 1)} ${f(hy + 4)} ${f(-hp - 1)} ${f(hy - 2)}L${f(-sh)} ${f(sy + 8)}Q${f(-sh)} ${f(sy)} ${f(-sh + 6)} ${f(sy)}z`;

  // Skirts and dresses flare from the waist over the legs.
  const flare = (len, fill) => {
    const w = hp + b.leg * 0.22 + 4;
    const yb = hy + b.leg * len;
    return `<path d="M${f(-hp - 2)} ${f(hy - 6)}H${f(hp + 2)}L${f(w)} ${f(yb)}Q0 ${f(yb + 6)} ${f(-w)} ${f(yb)}z" fill="${fill}" ${line()}/><path d="M${f(-w + 3)} ${f(yb - 4)}Q0 ${f(yb + 2)} ${f(w - 3)} ${f(yb - 4)}" fill="none" stroke="${shade(topC, -0.25)}" stroke-width="2" opacity=".6"/>`;
  };

  // Arms swung outward or raised draw in front; resting arms tuck behind.
  const front = (a) => Math.abs(a) > 60;
  if (!front(pose.armL)) add(armAt(shoulderL, pose.armL, -1));
  if (!front(pose.armR)) add(armAt(shoulderR, pose.armR, 1));

  add(
    `<rect x="${f(-b.headR * 0.28)}" y="${f(sy - b.neck - 6)}" width="${f(b.headR * 0.56)}" height="${f(b.neck + 10)}" fill="${skin}" ${line()}/>`
  );
  if (p.bottom === 'skirt' && !isDress) add(flare(0.45, bottomC));
  if (isDress) add(flare(top.dress, topFill));
  add(`<path d="${torso}" fill="${topFill}" ${line()}/>`);

  // Garment details.
  const neckY = sy + 1;
  switch (p.top) {
    case 'tee':
    case 'longsleeve':
    case 'sweater':
      add(
        `<path d="M${f(-b.headR * 0.38)} ${f(neckY)}Q0 ${f(neckY + b.headR * 0.42)} ${f(b.headR * 0.38)} ${f(neckY)}" fill="${skin}" ${line(2.6)}/>`
      );
      if (p.top === 'sweater')
        add(
          `<path d="M${f(-hp)} ${f(hy - 4)}H${f(hp)}" stroke="${shade(topC, -0.3)}" stroke-width="4"/>`
        );
      break;
    case 'tank':
    case 'sundress':
      add(
        `<path d="M${f(-sh + 9)} ${f(sy)}Q0 ${f(sy + b.torso * 0.32)} ${f(sh - 9)} ${f(sy)}z" fill="${skin}" ${line(2.6)}/>`
      );
      break;
    case 'partyDress':
      add(
        `<path d="M${f(-b.headR * 0.42)} ${f(neckY)}Q0 ${f(neckY + b.headR * 0.5)} ${f(b.headR * 0.42)} ${f(neckY)}" fill="${skin}" ${line(2.6)}/><path d="M${f(-hp - 1)} ${f(hy - 5)}H${f(hp + 1)}" stroke="${accent}" stroke-width="5"/><circle cx="0" cy="${f(hy - 5)}" r="3.6" fill="${accent}" ${line(2)}/>`
      );
      break;
    case 'longDress':
      add(
        `<path d="M${f(-b.headR * 0.42)} ${f(neckY)}L0 ${f(neckY + b.headR * 0.55)} ${f(b.headR * 0.42)} ${f(neckY)}z" fill="${skin}" ${line(2.6)}/>`
      );
      break;
    case 'hoodie':
      add(
        `<path d="M${f(-hp + 4)} ${f(hy - b.torso * 0.32)}h${f((hp - 4) * 2)}l-4 ${f(b.torso * 0.24)}h-${f((hp - 4) * 2 - 8)}z" fill="${shade(topC, -0.1)}" ${line(2.4)}/><path d="M-4 ${f(neckY + 2)}v${f(b.torso * 0.3)}M4 ${f(neckY + 2)}v${f(b.torso * 0.26)}" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>`
      );
      break;
    case 'shirt':
    case 'polo':
      add(
        `<path d="M${f(-b.headR * 0.4)} ${f(neckY - 1)}l${f(b.headR * 0.4)} ${f(b.headR * 0.34)} ${f(b.headR * 0.4)} -${f(b.headR * 0.34)}" fill="${skin}" ${line(2.4)}/><path d="M${f(-b.headR * 0.44)} ${f(neckY - 2)}l-${f(b.headR * 0.12)} ${f(b.headR * 0.38)} ${f(b.headR * 0.5)} -${f(b.headR * 0.02)}zM${f(b.headR * 0.44)} ${f(neckY - 2)}l${f(b.headR * 0.12)} ${f(b.headR * 0.38)} -${f(b.headR * 0.5)} -${f(b.headR * 0.02)}z" fill="${accent}" ${line(2.2)}/>`
      );
      [0.42, 0.62, p.top === 'shirt' ? 0.82 : null]
        .filter(Boolean)
        .forEach((t) =>
          add(
            `<circle cx="0" cy="${f(sy + b.torso * t)}" r="1.9" fill="${shade(topC, -0.45)}"/>`
          )
        );
      break;
    case 'jacket':
      add(
        `<path d="M${f(-b.headR * 0.42)} ${f(neckY)}L${f(-hp * 0.35)} ${f(hy + 3)}H${f(hp * 0.35)}L${f(b.headR * 0.42)} ${f(neckY)}z" fill="${accent}" ${line(2.4)}/><path d="M${f(-b.headR * 0.42)} ${f(neckY)}l${f(-b.headR * 0.2)} ${f(b.torso * 0.32)} ${f(b.headR * 0.32)} ${f(b.torso * 0.08)}zM${f(b.headR * 0.42)} ${f(neckY)}l${f(b.headR * 0.2)} ${f(b.torso * 0.32)} -${f(b.headR * 0.32)} ${f(b.torso * 0.08)}z" fill="${shade(topC, -0.15)}" ${line(2.2)}/>`
      );
      break;
    default:
      break;
  }

  // Overalls: bib and straps over the top.
  if (p.bottom === 'overalls' && !isDress) {
    add(
      `<path d="M${f(-hp * 0.7)} ${f(hy - b.torso * 0.5)}H${f(hp * 0.7)}V${f(hy + 2)}H${f(-hp * 0.7)}z" fill="${bottomC}" ${line(2.6)}/><path d="M${f(-hp * 0.62)} ${f(hy - b.torso * 0.5)}L${f(-sh + 6)} ${f(sy + 2)}M${f(hp * 0.62)} ${f(hy - b.torso * 0.5)}L${f(sh - 6)} ${f(sy + 2)}" stroke="${bottomC}" stroke-width="${f(b.armW * 0.5)}" stroke-linecap="round"/><circle cx="${f(-hp * 0.5)}" cy="${f(hy - b.torso * 0.44)}" r="2.2" fill="#f2c94c" ${line(1.4)}/><circle cx="${f(hp * 0.5)}" cy="${f(hy - b.torso * 0.44)}" r="2.2" fill="#f2c94c" ${line(1.4)}/><rect x="${f(-hp * 0.3)}" y="${f(hy - b.torso * 0.3)}" width="${f(hp * 0.6)}" height="${f(b.torso * 0.16)}" rx="2" fill="${shade(bottomC, -0.12)}" ${line(2)}/>`
    );
  } else if (!isDress && bottom.cover > 0 && p.bottom !== 'skirt') {
    // Waistband.
    add(
      `<path d="M${f(-hp - 1)} ${f(hy - 1)}H${f(hp + 1)}" stroke="${shade(bottomC, -0.2)}" stroke-width="3.4"/>`
    );
  }

  // ── the head
  const R = b.headR;
  const head = [];
  head.push(
    `<circle cx="${f(-R * 0.97)}" cy="${f(R * 0.12)}" r="${f(R * 0.2)}" fill="${skin}" ${line(2.6)}/><circle cx="${f(R * 0.97)}" cy="${f(R * 0.12)}" r="${f(R * 0.2)}" fill="${skin}" ${line(2.6)}/>`
  );
  head.push(`${facePath(p.faceShape, R)} fill="${skin}" ${line()}/>`);
  if (p.facialHair === 'stubble' || p.facialHair === 'beard')
    head.push(facialHairMarkup(p.facialHair, hairColor, R));
  if (p.blush)
    head.push(
      `<ellipse cx="${f(-R * 0.58)}" cy="${f(R * 0.4)}" rx="${f(R * 0.17)}" ry="${f(R * 0.1)}" fill="#ef7f8f" opacity=".45"/><ellipse cx="${f(R * 0.58)}" cy="${f(R * 0.4)}" rx="${f(R * 0.17)}" ry="${f(R * 0.1)}" fill="#ef7f8f" opacity=".45"/>`
    );
  if (p.freckles)
    head.push(
      [
        [-0.62, 0.26],
        [-0.5, 0.34],
        [-0.66, 0.38],
        [0.62, 0.26],
        [0.5, 0.34],
        [0.66, 0.38],
        [-0.12, 0.22],
        [0.12, 0.22],
      ]
        .map(
          ([x, y]) =>
            `<circle cx="${f(R * x)}" cy="${f(R * y)}" r="${f(R * 0.035)}" fill="${shade(skin, -0.42)}"/>`
        )
        .join('')
    );
  head.push(
    eyeMarkup(p.eyes, mood, colorOf(EYE_COLORS, p.eyeColor), R, -1),
    eyeMarkup(p.eyes, mood, colorOf(EYE_COLORS, p.eyeColor), R, 1)
  );
  head.push(
    browMarkup(p.brows, mood, hairColor, R, -1),
    browMarkup(p.brows, mood, hairColor, R, 1)
  );
  head.push(noseMarkup(p.nose, skin, R));
  if (p.facialHair === 'mustache' || p.facialHair === 'goatee')
    head.push(facialHairMarkup(p.facialHair, hairColor, R));
  head.push(mouthMarkup(mood, R));
  head.push(glassesMarkup(p.glasses, R));
  head.push(hair.front);
  head.push(hat.svg);
  add(`<g transform="${headT}">${head.join('')}</g>`);

  // ── raised arms over the body
  if (front(pose.armL)) add(armAt(shoulderL, pose.armL, -1));
  if (front(pose.armR)) add(armAt(shoulderR, pose.armR, 1));

  // ── the prop, in the right hand (the reaching hand stays free)
  let propBox = { reach: 0, svg: '' };
  if (prop !== 'none') {
    const holdRight = !(pose.id === 'reach' && !(placement.side < 0));
    const hand = holdRight
      ? limbEnd(shoulderR, b.arm, pose.armR, 1)
      : limbEnd(shoulderL, b.arm, pose.armL, -1);
    // An umbrella's shaft grows until the canopy clears the head.
    const clear = hand.y - (b.headCY - b.headR * 1.25);
    propBox = propMarkup(prop, hand, propColor, clear);
    add(propBox.svg);
    propBox.hand = hand;
  }
  add('</g>');

  // ── tight frame around the figure
  const reachArm = (pivot, angle, side) =>
    limbEnd(pivot, b.arm + b.armW, angle, side);
  const hands = [
    reachArm(shoulderL, pose.armL, -1),
    reachArm(shoulderR, pose.armR, 1),
  ];
  const hairTop =
    { afro: 1.8, buns: 1.45, spiky: 1.46, wrap: 1.42 }[p.hair] ?? 1.18;
  const hairSide =
    {
      afro: 1.5,
      long: 1.2,
      waves: 1.3,
      ponytail: 2.0,
      braids: 1.2,
      locs: 1.2,
      wrap: 1.2,
    }[p.hair] ?? 1.18;
  const hairBottom =
    { long: 2.1, waves: 2.1, bob: 0.9, braids: 2.1, locs: 1.5 }[p.hair] ?? 0;
  const headTop = b.headCY - R * Math.max(hairTop, hat.top / R + 0.05);
  let minX = Math.min(
    -R * hairSide,
    -b.shoulder - 4,
    ...hands.map((h) => h.x - 6),
    -(b.hip + b.leg * 0.22 + 6)
  );
  let maxX = Math.max(
    R * (p.hat === 'cap' ? 1.5 : hairSide),
    b.shoulder + 4,
    ...hands.map((h) => h.x + 6),
    b.hip + b.leg * 0.22 + 6
  );
  let minY = Math.min(headTop, ...hands.map((h) => h.y - 6)) - lift;
  const maxY = b.headCY + R * hairBottom > 0 ? b.headCY + R * hairBottom : 4;
  if (p.hat === 'sunHat') {
    minX = Math.min(minX, -R * 1.8);
    maxX = Math.max(maxX, R * 1.8);
  }
  if (propBox.hand) {
    minX = Math.min(minX, propBox.hand.x - 52);
    maxX = Math.max(maxX, propBox.hand.x + 52);
    minY = Math.min(minY, propBox.hand.y - lift - propBox.reach - 8);
  }
  const pad = 4;
  const vb = [
    minX - pad,
    minY - pad,
    maxX - minX + pad * 2,
    maxY - minY + pad * 2,
  ].map(f);
  const markup = `${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${out.join('')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">${markup}</svg>`;
  // A square around the head for face, hair and mood picker tiles.
  const headSize = R * 3.3;
  const headBox = [
    -headSize / 2,
    b.headCY - lift - R * 1.62,
    headSize,
    headSize,
  ].map(f);
  return {
    svg,
    markup,
    viewBox: vb,
    headBox,
    width: vb[2],
    height: vb[3],
    feetY: -vb[1],
  };
}

/** A friendly one-line description for order sheets and accessible names. */
export const describePerson = (person) => {
  const p = normalizePerson(person);
  const top = byId(TOPS, p.top).name;
  const bottom = byId(TOPS, p.top).dress
    ? ''
    : `, ${byId(CLOTH_COLORS, p.bottomColor).name.toLowerCase()} ${byId(BOTTOMS, p.bottom).name.toLowerCase()}`;
  return `${byId(AGES, p.age).name}, ${byId(HAIR_STYLES, p.hair).name.toLowerCase()}, ${byId(CLOTH_COLORS, p.topColor).name.toLowerCase()} ${top.toLowerCase()}${bottom}`;
};

/** Rig height of a standing adult; placements scale against it. */
export const ADULT_HEIGHT = 230;
