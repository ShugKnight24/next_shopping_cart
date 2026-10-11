/**
 * Scenery pieces: movable illustrations in the same ink style as the cast.
 *
 * A backdrop (sky, walls, ground) belongs to the product substrate; everything
 * a reader might want to nudge — the sun, a tree, the cake, a tent — is a
 * piece, placed as its own layer so it can be selected, moved, resized,
 * flipped and stacked in front of or behind the characters.
 *
 * Each piece draws into `0 0 w h`. `tint` recolours its main fill; pieces
 * without a `tint` default ignore it, and the inspector hides the control for
 * them (the same contract as `TINTABLE_STAMPS`).
 */

import { shade } from './castRig';

const INK = '#2b2433';
const ln = (w = 3) =>
  `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const heart = 'M0 8C0-6-20-6-20 8c0 12 20 22 20 22S20 20 20 8C20-6 0-6 0 8z';
const star = (cx, cy, r, fill) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  });
  return `<path d="M${pts.join('L')}z" fill="${fill}" ${ln(2.6)}/>`;
};

const piece = (id, name, category, w, h, draw, tint = null) => ({
  id,
  name,
  category,
  w,
  h,
  draw,
  tint,
});

export const PIECE_CATEGORIES = [
  { id: 'sky', name: 'Sky' },
  { id: 'nature', name: 'Nature' },
  { id: 'places', name: 'Places' },
  { id: 'party', name: 'Party' },
  { id: 'play', name: 'Play & travel' },
  { id: 'seasons', name: 'Seasons' },
];

export const PIECES = [
  // ─── sky
  piece(
    'sun',
    'Sun',
    'sky',
    120,
    120,
    (c) =>
      `${Array.from({ length: 10 }, (_, i) => `<path d="M60 8v14" transform="rotate(${i * 36} 60 60)" stroke="${shade(c, -0.1)}" stroke-width="6" stroke-linecap="round"/>`).join('')}<circle cx="60" cy="60" r="32" fill="${c}" ${ln()}/><circle cx="50" cy="52" r="7" fill="#fff" opacity=".45"/>`,
    '#ffd25e'
  ),
  piece(
    'moon',
    'Moon',
    'sky',
    100,
    100,
    (c) =>
      `<path d="M64 10C36 14 18 38 22 64s34 34 54 26C46 82 32 46 64 10z" fill="${c}" ${ln()}/><circle cx="42" cy="58" r="5" fill="${shade(c, -0.15)}"/>`,
    '#f8ecc6'
  ),
  piece(
    'cloud',
    'Cloud',
    'sky',
    170,
    90,
    (c) =>
      `<path d="M24 78c-14 0-20-10-20-20 0-12 10-20 22-20 2-18 18-30 36-30 14 0 26 8 32 20 4-2 9-3 14-3 18 0 32 14 32 30v3c10 2 16 10 16 18 0 1 0 2-1 2z" fill="${c}" ${ln()}/>`,
    '#ffffff'
  ),
  piece('star', 'Star', 'sky', 70, 70, (c) => star(35, 37, 31, c), '#ffd25e'),
  piece(
    'rainbow',
    'Rainbow',
    'sky',
    220,
    120,
    () =>
      `${[
        ['#e85d5d', 100],
        ['#f2a33a', 86],
        ['#f2d04a', 72],
        ['#6cbf6a', 58],
        ['#5b8fd9', 44],
      ]
        .map(
          ([col, r]) =>
            `<path d="M${110 - r} 116a${r} ${r} 0 0 1 ${r * 2} 0" fill="none" stroke="${col}" stroke-width="13"/>`
        )
        .join(
          ''
        )}<path d="M4 116a106 106 0 0 1 212 0" fill="none" ${ln(2.6)}/><path d="M72 116a38 38 0 0 1 76 0" fill="none" ${ln(2.6)}/>`
  ),
  piece(
    'planet',
    'Planet',
    'sky',
    140,
    100,
    (c) =>
      `<circle cx="70" cy="50" r="34" fill="${c}" ${ln()}/><path d="M36 44c-8 4 4 8 6 9M104 44c8 4-4 12-34 14S20 60 30 52" fill="none" ${ln()}/><ellipse cx="70" cy="54" rx="64" ry="14" fill="none" stroke="${shade(c, 0.35)}" stroke-width="7" transform="rotate(-12 70 54)"/><circle cx="58" cy="38" r="6" fill="${shade(c, 0.3)}"/>`,
    '#e98a5a'
  ),
  piece(
    'rocket',
    'Rocket',
    'sky',
    90,
    170,
    (c) =>
      `<path d="M45 6c22 18 30 50 26 96H19C15 56 23 24 45 6z" fill="${c}" ${ln()}/><circle cx="45" cy="56" r="13" fill="#9fd3e6" ${ln()}/><path d="M19 84L4 120l18-6zM71 84l15 36-18-6z" fill="${shade(c, -0.25)}" ${ln()}/><path d="M30 104h30l-6 18H36z" fill="#888" ${ln(2.4)}/><path d="M38 124c0 18 7 30 7 40 0-10 7-22 7-40z" fill="#ffb347" ${ln(2.4)}/>`,
    '#e85d5d'
  ),

  // ─── nature
  piece(
    'tree',
    'Round tree',
    'nature',
    140,
    190,
    (c) =>
      `<path d="M64 186V112M76 186V112" ${ln(3)}/><rect x="60" y="108" width="20" height="80" fill="#9a6b45" ${ln()}/><circle cx="70" cy="70" r="56" fill="${c}" ${ln()}/><circle cx="40" cy="88" r="30" fill="${c}" ${ln()}/><circle cx="100" cy="88" r="30" fill="${c}" ${ln()}/><path d="M44 62c6-10 18-16 30-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>`,
    '#6fb35f'
  ),
  piece(
    'pine',
    'Pine tree',
    'nature',
    110,
    200,
    (c) =>
      `<rect x="47" y="160" width="16" height="36" fill="#8a5c3c" ${ln()}/><path d="M55 6L14 76h18L4 128h22L2 168h106L84 128h22L78 76h18z" fill="${c}" ${ln()}/>`,
    '#4f8f57'
  ),
  piece(
    'palm',
    'Palm tree',
    'nature',
    170,
    220,
    (c) =>
      `<path d="M84 216c-8-50-4-110 8-150" fill="none" stroke="#b5835a" stroke-width="16" stroke-linecap="round"/><path d="M84 216c-8-50-4-110 8-150" fill="none" ${ln(2.6)}/>${[
        [-70, -10],
        [-30, -40],
        [20, -40],
        [60, -8],
        [-50, 16],
        [50, 20],
      ]
        .map(
          ([dx, dy]) =>
            `<path d="M92 66q${dx / 2} ${dy - 30} ${dx} ${dy + 10}q${-dx / 3} -6 ${-dx} ${-dy - 10}z" fill="${c}" ${ln(2.6)}/>`
        )
        .join(
          ''
        )}<circle cx="84" cy="74" r="8" fill="#7a5236" ${ln(2)}/><circle cx="98" cy="76" r="8" fill="#7a5236" ${ln(2)}/>`,
    '#5fae5a'
  ),
  piece(
    'bush',
    'Bush',
    'nature',
    150,
    80,
    (c) =>
      `<path d="M8 76c-6-22 10-38 28-34 4-22 32-30 46-14 12-16 42-10 44 12 18 0 26 22 16 36z" fill="${c}" ${ln()}/>${[
        [40, 52],
        [80, 40],
        [114, 56],
      ]
        .map(
          ([x, y]) =>
            `<circle cx="${x}" cy="${y}" r="5" fill="#f2a1bf" ${ln(2)}/>`
        )
        .join('')}`,
    '#78bf68'
  ),
  piece(
    'flowers',
    'Flower patch',
    'nature',
    130,
    90,
    () =>
      `${[
        [18, '#f2a1bf'],
        [46, '#ffffff'],
        [74, '#f2d04a'],
        [102, '#b79ce0'],
      ]
        .map(
          ([x, col], i) =>
            `<path d="M${x} 88V${40 + (i % 2) * 10}" stroke="#4f8a45" stroke-width="4" stroke-linecap="round"/><g transform="translate(${x} ${32 + (i % 2) * 10})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="6.5" ry="9" transform="rotate(${a})" fill="${col}" ${ln(2)}/>`).join('')}<circle r="5" fill="#f2c94c" ${ln(2)}/></g>`
        )
        .join('')}`
  ),
  piece(
    'mushroom',
    'Mushroom',
    'nature',
    80,
    80,
    (c) =>
      `<path d="M30 46h20l4 30H26z" fill="#f7efe0" ${ln()}/><path d="M6 48C6 18 74 18 74 48z" fill="${c}" ${ln()}/><circle cx="28" cy="34" r="5" fill="#fff"/><circle cx="50" cy="30" r="6" fill="#fff"/>`,
    '#e85d5d'
  ),
  piece(
    'rock',
    'Rock',
    'nature',
    120,
    70,
    (c) =>
      `<path d="M6 66c0-30 22-56 52-56s56 24 56 56z" fill="${c}" ${ln()}/><path d="M34 34c10-8 22-10 32-8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>`,
    '#a3aab3'
  ),
  piece(
    'pond',
    'Pond',
    'nature',
    200,
    60,
    (c) =>
      `<ellipse cx="100" cy="32" rx="94" ry="24" fill="${c}" ${ln()}/><path d="M50 30q20-8 40 0M110 38q20-8 40 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>`,
    '#7cc3d6'
  ),

  // ─── places
  piece(
    'house',
    'House',
    'places',
    170,
    170,
    (c) =>
      `<rect x="22" y="70" width="126" height="96" fill="${c}" ${ln()}/><path d="M6 76L85 10l79 66z" fill="#c4544d" ${ln()}/><rect x="70" y="112" width="30" height="54" rx="4" fill="#7a5236" ${ln()}/><circle cx="93" cy="140" r="2.6" fill="#f2c94c"/><rect x="34" y="90" width="26" height="24" fill="#bfe3f4" ${ln(2.6)}/><rect x="110" y="90" width="26" height="24" fill="#bfe3f4" ${ln(2.6)}/><path d="M47 90v24M34 102h26M123 90v24M110 102h26" ${ln(2)}/>`,
    '#f4e3c1'
  ),
  piece(
    'castle',
    'Castle',
    'places',
    200,
    190,
    (c) =>
      `<path d="M30 186V60h24v-16h14v16h20v-16h14v16h20v-16h14v16h24V186z" fill="${c}" ${ln()}/><rect x="4" y="30" width="34" height="156" fill="${c}" ${ln()}/><rect x="162" y="30" width="34" height="156" fill="${c}" ${ln()}/><path d="M0 34L21 4l21 30zM158 34L179 4l21 30z" fill="#b23a6b" ${ln()}/><path d="M82 186v-46a18 18 0 0 1 36 0v46z" fill="#7a5236" ${ln()}/><rect x="14" y="70" width="14" height="22" rx="7" fill="#2c3e6b" ${ln(2.4)}/><rect x="172" y="70" width="14" height="22" rx="7" fill="#2c3e6b" ${ln(2.4)}/>`,
    '#d9d2e8'
  ),
  piece(
    'tent',
    'Tent',
    'places',
    180,
    120,
    (c) =>
      `<path d="M90 8L6 116h168z" fill="${c}" ${ln()}/><path d="M90 8L60 116h60z" fill="${shade(c, -0.2)}" ${ln()}/><path d="M90 52l-14 64h28z" fill="#3b2a24" ${ln(2.4)}/>`,
    '#ee8434'
  ),
  piece(
    'school',
    'School',
    'places',
    210,
    170,
    (c) =>
      `<rect x="10" y="60" width="190" height="106" fill="${c}" ${ln()}/><path d="M0 64L105 14l105 50z" fill="#8a3b34" ${ln()}/><rect x="90" y="18" width="30" height="16" fill="#f7f5f0" ${ln(2.4)}/><circle cx="105" cy="56" r="12" fill="#fff" ${ln(2.4)}/><path d="M105 49v7l5 3" ${ln(2)}/><rect x="88" y="114" width="34" height="52" fill="#7a5236" ${ln()}/>${[24, 56, 138, 170].map((x) => `<rect x="${x}" y="84" width="20" height="20" fill="#bfe3f4" ${ln(2.4)}/>`).join('')}`,
    '#e8b45a'
  ),
  piece(
    'bench',
    'Park bench',
    'places',
    170,
    90,
    (c) =>
      `<rect x="10" y="20" width="150" height="14" rx="4" fill="${c}" ${ln()}/><rect x="10" y="40" width="150" height="14" rx="4" fill="${c}" ${ln()}/><path d="M24 54v32M146 54v32M24 34v6M146 34v6" ${ln(5)}/>`,
    '#b5835a'
  ),
  piece(
    'lamp',
    'Lamp post',
    'places',
    60,
    200,
    (c) =>
      `<path d="M30 196V40" ${ln(6)}/><path d="M18 196h24" ${ln(6)}/><path d="M14 40h32l-6-26H20z" fill="${c}" ${ln()}/><circle cx="30" cy="30" r="26" fill="#ffe7a3" opacity=".25"/>`,
    '#3b3a40'
  ),
  piece(
    'table',
    'Table',
    'places',
    180,
    100,
    (c) =>
      `<path d="M6 30h168l-10 14H16z" fill="${c}" ${ln()}/><path d="M28 44v52M152 44v52" ${ln(7)}/><path d="M10 30c20 12 40 12 60 0s40-12 60 0 40 12 40 0" fill="none" stroke="#fff" stroke-width="4" opacity=".5"/>`,
    '#f7f5f0'
  ),

  // ─── party
  piece(
    'cake',
    'Birthday cake',
    'party',
    130,
    130,
    (c) =>
      `<rect x="12" y="62" width="106" height="62" rx="8" fill="${c}" ${ln()}/><path d="M12 76c16 12 26 12 40 0s26-12 40 0 20 10 26 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><rect x="28" y="34" width="74" height="30" rx="6" fill="#fff8ec" ${ln()}/>${[44, 65, 86].map((x) => `<rect x="${x - 3}" y="14" width="6" height="20" fill="#9fd3e6" ${ln(2)}/><path d="M${x} 12c-5-6 0-12 0-12s5 6 0 12z" fill="#ffcf4a" ${ln(1.8)}/>`).join('')}`,
    '#f2a1bf'
  ),
  piece(
    'balloons',
    'Balloon bunch',
    'party',
    120,
    200,
    () =>
      `${[
        [40, 54, '#e85d5d'],
        [80, 44, '#5b8fd9'],
        [60, 82, '#f2d04a'],
      ]
        .map(
          ([x, y, col]) =>
            `<path d="M${x} ${y + 36}Q${(x + 60) / 2} 150 60 196" fill="none" ${ln(1.8)}/><ellipse cx="${x}" cy="${y}" rx="28" ry="34" fill="${col}" ${ln()}/><ellipse cx="${x - 9}" cy="${y - 12}" rx="6" ry="10" fill="#fff" opacity=".5"/>`
        )
        .join('')}`
  ),
  piece(
    'bunting',
    'Bunting',
    'party',
    260,
    70,
    () =>
      `<path d="M4 10q126 40 252 0" fill="none" ${ln(2.6)}/>${Array.from(
        { length: 9 },
        (_, i) => {
          const x = 14 + i * 28;
          const y = 10 + Math.sin((i / 8) * Math.PI) * 20;
          return `<path d="M${x} ${y}h22l-11 30z" fill="${['#e85d5d', '#f2d04a', '#5b8fd9', '#6cbf6a'][i % 4]}" ${ln(2.2)}/>`;
        }
      ).join('')}`
  ),
  piece(
    'gifts',
    'Gift pile',
    'party',
    140,
    100,
    () =>
      `<rect x="10" y="40" width="64" height="56" rx="4" fill="#5b8fd9" ${ln()}/><path d="M42 40v56M10 62h64" stroke="#f2d04a" stroke-width="8"/><rect x="74" y="56" width="54" height="40" rx="4" fill="#e85d5d" ${ln()}/><path d="M101 56v40" stroke="#fff" stroke-width="7"/><path d="M42 40c-10-16-26-8-14 0M42 40c10-16 26-8 14 0" fill="none" stroke="#f2d04a" stroke-width="5" stroke-linecap="round"/>`
  ),
  piece('confetti', 'Confetti', 'party', 180, 120, () =>
    Array.from(
      { length: 26 },
      (_, i) =>
        `<rect x="${(i * 53) % 170}" y="${(i * 37) % 110}" width="10" height="5" rx="1" transform="rotate(${i * 41} ${(i * 53) % 170} ${(i * 37) % 110})" fill="${['#e85d5d', '#f2d04a', '#5b8fd9', '#6cbf6a', '#f2a1bf'][i % 5]}"/>`
    ).join('')
  ),
  piece(
    'hearts',
    'Hearts',
    'party',
    120,
    100,
    (c) =>
      `<path transform="translate(40 20) scale(1.3)" d="${heart}" fill="${c}" ${ln(2)}/><path transform="translate(92 50) scale(.9)" d="${heart}" fill="${shade(c, 0.4)}" ${ln(2.4)}/>`,
    '#e85d75'
  ),

  // ─── play & travel
  piece(
    'kite',
    'Kite',
    'play',
    120,
    190,
    (c) =>
      `<path d="M60 6l40 50-40 60-40-60z" fill="${c}" ${ln()}/><path d="M60 6v110M20 56h80" ${ln(2)}/><path d="M60 116c-10 20 14 30 0 50s8 20 4 22" fill="none" ${ln(1.8)}/>${[132, 152, 172].map((y, i) => `<path d="M${54 + (i % 2) * 8} ${y}l8-6v12z" fill="#f2d04a" ${ln(1.6)}/>`).join('')}`,
    '#e85d5d'
  ),
  piece(
    'swing',
    'Swing',
    'play',
    160,
    170,
    (c) =>
      `<path d="M10 166L30 10h100l20 156" fill="none" stroke="#b5835a" stroke-width="10" stroke-linecap="round"/><path d="M60 12v110M100 12v110" ${ln(2.4)}/><rect x="50" y="120" width="60" height="10" rx="3" fill="${c}" ${ln(2.4)}/>`,
    '#e85d5d'
  ),
  piece(
    'sandcastle',
    'Sandcastle',
    'play',
    130,
    100,
    (c) =>
      `<path d="M10 96V54h22V40h16v14h34V40h16v14h22v42z" fill="${c}" ${ln()}/><path d="M52 96V74a13 13 0 0 1 26 0v22z" fill="${shade(c, -0.25)}" ${ln(2.4)}/><path d="M90 40V10l18 8-18 8" fill="#e85d5d" ${ln(2)}/>`,
    '#e8c98f'
  ),
  piece(
    'boat',
    'Sailboat',
    'play',
    150,
    150,
    (c) =>
      `<path d="M10 104h130l-20 34H30z" fill="${c}" ${ln()}/><path d="M76 104V10" ${ln(4)}/><path d="M80 14l48 82H80z" fill="#fff" ${ln()}/><path d="M72 30L32 96h40z" fill="#f2d04a" ${ln()}/>`,
    '#5b8fd9'
  ),
  piece(
    'car',
    'Car',
    'play',
    190,
    100,
    (c) =>
      `<path d="M10 70V54q0-8 8-8h20l22-30h66l26 30h20q8 0 8 8v16z" fill="${c}" ${ln()}/><path d="M66 22h26v24H48zM98 22h24l18 24H98z" fill="#bfe3f4" ${ln(2.4)}/><circle cx="50" cy="74" r="16" fill="#3b3a40" ${ln()}/><circle cx="146" cy="74" r="16" fill="#3b3a40" ${ln()}/><circle cx="50" cy="74" r="6" fill="#ddd"/><circle cx="146" cy="74" r="6" fill="#ddd"/>`,
    '#e85d5d'
  ),
  piece(
    'campfire',
    'Campfire',
    'play',
    110,
    100,
    () =>
      `<path d="M14 92l82-22M14 70l82 22" stroke="#8a5c3c" stroke-width="12" stroke-linecap="round"/><path d="M55 8c22 24 30 40 20 58-6 10-34 10-40 0C26 50 40 36 55 8z" fill="#f2a33a" ${ln(2.6)}/><path d="M55 34c10 12 14 22 8 32-4 6-12 6-16 0-4-8 0-18 8-32z" fill="#f2d04a"/>`
  ),

  // ─── seasons
  piece(
    'snowman',
    'Snowman',
    'seasons',
    110,
    180,
    () =>
      `<circle cx="55" cy="130" r="44" fill="#fff" ${ln()}/><circle cx="55" cy="62" r="30" fill="#fff" ${ln()}/><path d="M55 62l22 5-22 5z" fill="#f08a3c" ${ln(2)}/><circle cx="46" cy="54" r="3.4" fill="${INK}"/><circle cx="64" cy="54" r="3.4" fill="${INK}"/><path d="M26 86h58" stroke="#d94a43" stroke-width="10" stroke-linecap="round"/><rect x="36" y="18" width="38" height="16" fill="#3b3a40" ${ln(2.4)}/><path d="M28 34h54" ${ln(4)}/>`
  ),
  piece('snowflakes', 'Snowfall', 'seasons', 180, 140, () =>
    Array.from(
      { length: 18 },
      (_, i) =>
        `<circle cx="${((i * 61) % 176) + 2}" cy="${((i * 43) % 136) + 2}" r="${3 + (i % 3)}" fill="#fff" stroke="#c8d9ea" stroke-width="1"/>`
    ).join('')
  ),
  piece(
    'pumpkin',
    'Pumpkin',
    'seasons',
    110,
    90,
    (c) =>
      `<path d="M52 18c0-8 4-14 10-14" fill="none" stroke="#4f8a45" stroke-width="6" stroke-linecap="round"/><ellipse cx="55" cy="54" rx="48" ry="34" fill="${c}" ${ln()}/><path d="M55 22c-14 10-14 54 0 66M55 22c14 10 14 54 0 66M30 30c-10 14-10 34 0 48M80 30c10 14 10 34 0 48" fill="none" stroke="${shade(c, -0.25)}" stroke-width="3"/>`,
    '#ee8434'
  ),
  piece('leaves', 'Falling leaves', 'seasons', 160, 120, () =>
    Array.from(
      { length: 9 },
      (_, i) =>
        `<path d="M0 0c8-10 22-10 26 0-8 10-22 10-26 0z" transform="translate(${((i * 47) % 140) + 4} ${((i * 31) % 100) + 6}) rotate(${i * 50})" fill="${['#e8763a', '#d94a43', '#e3b23c'][i % 3]}" ${ln(2)}/>`
    ).join('')
  ),
];

const PIECE_MAP = Object.fromEntries(PIECES.map((p) => [p.id, p]));
export const PIECE_IDS = PIECES.map((p) => p.id);
export const pieceById = (id) => PIECE_MAP[id] ?? PIECES[0];

/** Standalone SVG for a piece, framed with a little room for its outline. */
export const pieceArt = (id, tint = null) => {
  const p = pieceById(id);
  const pad = 4;
  const markup = p.draw(tint ?? p.tint ?? '#ffffff');
  const vb = `${-pad} ${-pad} ${p.w + pad * 2} ${p.h + pad * 2}`;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${p.w + pad * 2}" height="${p.h + pad * 2}">${markup}</svg>`,
    width: p.w + pad * 2,
    height: p.h + pad * 2,
  };
};
