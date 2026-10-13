/**
 * Starter ideas: finished designs a shopper can open in one click when they
 * do not know where to begin, built from *their* cast against the artboard
 * they actually have (a portrait poster and a landscape one get the same
 * idea laid out for each).
 *
 * Every starter is ordinary layers afterwards: move, swap or delete
 * anything. Poster and apparel starters stay inside the free layer count
 * (`products.js` charges per layer beyond it), so an idea never quietly
 * raises the price.
 *
 *   build({ artboard, options, cast }) → { layers, options?, cast? }
 */

import {
  activeSpreadOf,
  castForRoles,
  createStorySpread,
  momentById,
  momentLayers,
} from '../book/bookPages';
import {
  createPerson,
  createPet,
  memberName,
  placeMember,
} from '../cast/castModel';
import { ADULT_HEIGHT } from '../cast/castRig';
import { pieceArt, pieceById } from '../cast/scenePieces';
import { contrastInk } from '../core/characterSchema';
import { posterArtRect } from '../drawSubstrate';
import { socialPalette } from '../social/socialArt';
import { createLayer, refitLayer } from '../workbench/layerModel';
import { featuredProduct } from './catalog';

/* ---------------------------------------------------------------- stage -- */

/** Where people stand and words go, per product. */
export const stageOf = (mode, artboard, options = {}) => {
  const { width, height } = artboard;
  if (mode === 'poster') {
    const r = posterArtRect(width, height, options);
    const x0 = r.artInset + 18;
    return {
      x0,
      x1: width - x0,
      top: r.artInset,
      bottom: height - r.artInset,
      feet: height - r.artInset - r.artH * 0.1,
      adultHeight: r.artH * (r.isLandscape ? 0.56 : 0.44),
    };
  }
  if (mode === 'social') {
    // A post is all canvas: a safe margin all round, people big.
    const wide = width > height * 1.15;
    return {
      x0: width * 0.08,
      x1: width * 0.92,
      top: height * 0.06,
      bottom: height * 0.94,
      feet: height * 0.92,
      adultHeight: height * (wide ? 0.62 : 0.4),
    };
  }
  if (mode === 'apparel') {
    // The chest print panel of the 520 × 420 garment art.
    return {
      x0: 196,
      x1: 324,
      top: 112,
      bottom: 276,
      feet: 262,
      adultHeight: 112,
    };
  }
  // The cover of a book: the whole board.
  return {
    x0: width * 0.2,
    x1: width * 0.8,
    top: 40,
    bottom: height - 40,
    feet: height * 0.86,
    adultHeight: height * 0.46,
  };
};

/* -------------------------------------------------------------- helpers -- */

/** Make sure the cast has someone for every role a starter needs. */
const ensureRoles = (cast, needs) => {
  const next = cast.slice();
  const roles = castForRoles(next);
  if (needs.includes('hero') && !roles.hero)
    next.push(createPerson('kid', { name: 'Maya' }));
  if (needs.includes('grownup') && !roles.grownup)
    next.push(createPerson('adult', { name: 'Mum' }));
  if (needs.includes('pet') && !roles.pet)
    next.push(createPet({ name: 'Biscuit' }));
  return next;
};

const fill = (text, roles) =>
  text
    .replace(/\{hero\}/g, memberName(roles.hero, 'Our hero'))
    .replace(/\{grownup\}/g, memberName(roles.grownup, 'Mum'))
    .replace(/\{pet\}/g, memberName(roles.pet, 'Buddy'));

/** A small layout kit bound to one stage. */
const kit = (stage, roles, artboard, page = undefined) => {
  const span = stage.x1 - stage.x0;
  const k = stage.adultHeight / ADULT_HEIGHT;
  const tag = (layer) => ({
    ...layer,
    fromStarter: true,
    ...(page ? { page } : {}),
  });

  return {
    person: (role, at, placement = {}, scale = 1) => {
      const member = roles[role];
      if (!member) return null;
      const spec = placeMember(member, {
        x: stage.x0 + span * at,
        feet: placement.feet ?? stage.feet,
        adultHeight: stage.adultHeight * scale,
        ...placement,
      });
      return spec && tag(createLayer('character', spec));
    },
    piece: (id, at, { y = null, scale = 1, tint = null } = {}) => {
      const art = pieceArt(id, tint);
      const height = art.height * k * scale;
      const cy =
        y != null
          ? stage.top + (stage.bottom - stage.top) * y
          : stage.feet - height / 2;
      return tag(
        createLayer('piece', {
          piece: id,
          name: pieceById(id).name,
          tint,
          x: stage.x0 + span * at,
          y: cy,
          width: art.width * k * scale,
          height,
        })
      );
    },
    text: (
      text,
      y,
      {
        size = 40,
        font = 'display',
        color = '#ffffff',
        weight = 800,
        width = 0.92,
        height = null,
        role = 'title',
        transform = 'none',
        spacing = 0,
        shadow = 'none',
        colorRole = null,
        at = 0.5,
        align = 'center',
      } = {}
    ) =>
      tag(
        createLayer('text', {
          shadow,
          align,
          ...(colorRole ? { colorRole } : {}),
          name: role === 'title' ? 'Title' : 'Subtitle',
          slotRole: role,
          text: fill(text, roles),
          x: stage.x0 + span * at,
          y: stage.top + (stage.bottom - stage.top) * y,
          width: Math.min(artboard.width, span * width + 36),
          height: height ?? size * 1.6,
          fontSize: size,
          fontFamily: font,
          fontWeight: weight,
          color,
          textTransform: transform,
          letterSpacing: spacing,
        })
      ),
    /** A badge, pill or panel: `w`/`h` are fractions of the stage. */
    shape: (
      at,
      y,
      w,
      h,
      { fill, fillRole = null, radius = 999, shape = 'rect', rotation = 0 } = {}
    ) =>
      tag(
        createLayer('shape', {
          name: 'Badge',
          shape,
          fill,
          ...(fillRole ? { fillRole } : {}),
          radius,
          rotation,
          x: stage.x0 + span * at,
          y: stage.top + (stage.bottom - stage.top) * y,
          width: span * w,
          height: (stage.bottom - stage.top) * h,
        })
      ),
    /** A product photo from the store, `size` a fraction of the stage width. */
    photo: (product, at, y, size, { radius = 18 } = {}) =>
      product &&
      tag(
        createLayer('image', {
          name: product.productName,
          src: product.image,
          fit: 'contain',
          radius,
          productId: product.itemid,
          x: stage.x0 + span * at,
          y: stage.top + (stage.bottom - stage.top) * y,
          width: span * size,
          height: span * size,
        })
      ),
  };
};

const compact = (list) => list.filter(Boolean);

/* -------------------------------------------------------------- posters -- */

const POSTERS = [
  {
    id: 'family',
    name: 'Family portrait',
    idea: 'Everyone in one frame, under your family name.',
    needs: ['hero', 'grownup', 'pet'],
    options: { artStyle: 'sunset', sceneId: null },
    build: (k) =>
      compact([
        k.text('Our Family', 0.12, { size: 54, font: 'serif', weight: 700 }),
        k.text('Est. with love', 0.22, {
          size: 18,
          font: 'sans',
          weight: 600,
          role: 'subtitle',
          transform: 'uppercase',
          spacing: 4,
        }),
        k.person('grownup', 0.32, { pose: 'reach', side: 1, mood: 'smile' }),
        k.person('hero', 0.6, { pose: 'reach', side: -1, mood: 'grin' }),
        k.person('pet', 0.84),
      ]),
  },
  {
    id: 'birthday',
    name: 'Birthday star',
    idea: 'A party poster for the guest of honour.',
    needs: ['hero'],
    options: { artStyle: 'sunburst', sceneId: null },
    build: (k) =>
      compact([
        k.text('Happy Birthday', 0.1, { size: 46, color: '#2b2433' }),
        k.text('{hero}!', 0.21, {
          size: 60,
          color: '#d94a43',
          font: 'display',
        }),
        k.piece('balloons', 0.14, { scale: 1.1 }),
        k.piece('cake', 0.82, { scale: 0.9 }),
        k.person('hero', 0.5, { pose: 'cheer', mood: 'laugh' }, 1.15),
      ]),
  },
  {
    id: 'room',
    name: 'Bedroom door',
    idea: 'A sign that says whose room this is.',
    needs: ['hero'],
    options: {
      artStyle: 'cosmic',
      sceneId: 'dreamland_castle',
      timeOfDay: 'midnight',
    },
    build: (k) =>
      compact([
        k.text("{hero}'s Room", 0.14, {
          size: 52,
          font: 'cursive',
          weight: 700,
          shadow: 'soft',
        }),
        k.text('Dream big, little star', 0.24, {
          size: 18,
          font: 'sans',
          weight: 600,
          role: 'subtitle',
          shadow: 'soft',
        }),
        k.piece('moon', 0.84, { y: 0.36, scale: 0.8 }),
        k.piece('star', 0.16, { y: 0.4, scale: 0.7 }),
        k.person(
          'hero',
          0.5,
          { pose: 'shy', mood: 'calm', prop: 'teddy' },
          1.15
        ),
      ]),
  },
  {
    id: 'adventure',
    name: 'Adventure awaits',
    idea: 'Explorers heading for the hills.',
    needs: ['hero', 'grownup'],
    options: {
      artStyle: 'botanical',
      sceneId: 'enchanted_forest',
      timeOfDay: 'golden_hour',
    },
    build: (k) =>
      compact([
        k.text('Adventure awaits', 0.12, {
          size: 46,
          font: 'display',
          transform: 'uppercase',
          spacing: 2,
          shadow: 'soft',
        }),
        k.piece('pine', 0.1, { scale: 1.1 }),
        k.piece('tent', 0.88, { scale: 0.8 }),
        k.person('grownup', 0.38, { pose: 'point', mood: 'wow' }),
        k.person('hero', 0.62, { pose: 'cheer', mood: 'grin' }),
      ]),
  },
  {
    id: 'pals',
    name: 'Best friends',
    idea: 'A kid and their pet, forever.',
    needs: ['hero', 'pet'],
    options: { artStyle: 'retro', sceneId: null },
    build: (k) =>
      compact([
        k.text('Best friends', 0.12, {
          size: 54,
          font: 'cursive',
          weight: 700,
        }),
        k.text('{hero} & {pet}', 0.23, {
          size: 22,
          font: 'sans',
          weight: 700,
          role: 'subtitle',
          transform: 'uppercase',
          spacing: 3,
        }),
        k.piece('hearts', 0.5, { y: 0.36, scale: 0.9 }),
        k.person('hero', 0.4, { pose: 'wave', mood: 'grin' }, 1.1),
        k.person('pet', 0.7, {}, 1.3),
      ]),
  },
  {
    id: 'thanks',
    name: 'For the best grown-up',
    idea: "A thank-you they'll hang up.",
    needs: ['hero', 'grownup'],
    options: { artStyle: 'sunset', sceneId: null },
    build: (k) =>
      compact([
        k.text("World's best {grownup}", 0.12, {
          size: 44,
          font: 'serif',
          weight: 700,
        }),
        k.piece('flowers', 0.86, { scale: 1 }),
        k.person('grownup', 0.38, { pose: 'reach', side: 1, mood: 'soft' }),
        k.person('hero', 0.62, {
          pose: 'reach',
          side: -1,
          mood: 'smile',
          prop: 'flowers',
        }),
      ]),
  },
];

/* -------------------------------------------------------------- apparel -- */

const ink = (options) => contrastInk(options.color ?? '#1e293b');

const APPAREL = [
  {
    id: 'star',
    name: 'Superstar',
    idea: 'Their character, their name, a star.',
    needs: ['hero'],
    build: (k, options) =>
      compact([
        k.piece('star', 0.86, { y: 0.12, scale: 0.6 }),
        k.person('hero', 0.5, { pose: 'cheer', mood: 'laugh', feet: 236 }),
        k.text('{hero}', 0.84, {
          size: 26,
          color: ink(options),
          transform: 'uppercase',
          spacing: 3,
        }),
      ]),
  },
  {
    id: 'space',
    name: 'Space cadet',
    idea: 'Ready for lift-off.',
    needs: ['hero'],
    build: (k, options) =>
      compact([
        k.piece('rocket', 0.8, { y: 0.4, scale: 0.75 }),
        k.person('hero', 0.38, { pose: 'point', mood: 'wow', feet: 236 }),
        k.text('Space cadet', 0.9, {
          size: 26,
          color: ink(options),
          transform: 'uppercase',
          spacing: 2,
        }),
      ]),
  },
  {
    id: 'pet',
    name: 'Pet pal',
    idea: 'For the one who loves their pet most.',
    needs: ['pet'],
    build: (k, options) =>
      compact([
        k.piece('hearts', 0.5, { y: 0.14, scale: 0.6 }),
        k.person('pet', 0.5, { feet: 236 }, 1.9),
        k.text("{pet}'s human", 0.9, {
          size: 24,
          color: ink(options),
          font: 'cursive',
          weight: 700,
        }),
      ]),
  },
  {
    id: 'crew',
    name: 'Family crew',
    idea: 'Matching tops for the whole team.',
    needs: ['hero', 'grownup'],
    build: (k, options) =>
      compact([
        k.person('grownup', 0.34, {
          pose: 'reach',
          side: 1,
          mood: 'smile',
          feet: 236,
        }),
        k.person('hero', 0.66, {
          pose: 'reach',
          side: -1,
          mood: 'grin',
          feet: 236,
        }),
        k.text('Team {hero}', 0.9, {
          size: 26,
          color: ink(options),
          transform: 'uppercase',
          spacing: 2,
        }),
      ]),
  },
];

/* --------------------------------------------------------------- social -- */

/** Words in a theme colour, repainted when the theme changes. */
const say = (k, pal, role, text, y, opts = {}) =>
  k.text(text, y, { color: pal[role], colorRole: role, ...opts });

const SOCIAL = [
  {
    id: 'drop',
    name: 'New arrival',
    idea: 'A product from the store, in the spotlight.',
    needs: [],
    options: { theme: 'obsidian', backdrop: 'spotlight', sceneId: null },
    caption:
      'Just landed: {product}. Authenticated, insured, and ready to ship.',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      const product = featuredProduct();
      return compact([
        say(k, pal, 'accent', 'Just dropped', 0.08, {
          size: 20,
          font: 'sans',
          weight: 800,
          role: 'eyebrow',
          transform: 'uppercase',
          spacing: 5,
        }),
        say(k, pal, 'text', product?.productName ?? 'The new arrival', 0.2, {
          size: 34,
          font: 'serif',
          weight: 700,
          height: 92,
        }),
        k.photo(product, 0.5, 0.56, 0.62),
        k.shape(0.5, 0.88, 0.36, 0.075, {
          fill: pal.accent,
          fillRole: 'accent',
        }),
        say(k, pal, 'ink', 'Shop now', 0.88, {
          size: 18,
          font: 'sans',
          weight: 800,
          role: 'badge',
          transform: 'uppercase',
          spacing: 2,
          width: 0.34,
        }),
      ]);
    },
  },
  {
    id: 'sale',
    name: 'Flash sale',
    idea: 'A loud, short, unmissable offer.',
    needs: [],
    options: { theme: 'crimson', backdrop: 'rays', sceneId: null },
    caption: '48 hours only. Use code FIRST15 at checkout.',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      return compact([
        say(k, pal, 'text', '48 hours only', 0.14, {
          size: 22,
          font: 'sans',
          weight: 800,
          role: 'eyebrow',
          transform: 'uppercase',
          spacing: 6,
        }),
        say(k, pal, 'accent', '15% off', 0.4, {
          size: 120,
          font: 'display',
          height: 170,
          shadow: 'soft',
        }),
        say(k, pal, 'text', 'Everything in store', 0.58, {
          size: 26,
          font: 'serif',
          weight: 700,
          role: 'subtitle',
        }),
        k.shape(0.5, 0.78, 0.6, 0.1, {
          fill: pal.accent,
          fillRole: 'accent',
          radius: 12,
          rotation: -3,
        }),
        say(k, pal, 'ink', 'Code: FIRST15', 0.78, {
          size: 26,
          font: 'sans',
          weight: 800,
          role: 'badge',
          transform: 'uppercase',
          spacing: 3,
          width: 0.56,
        }),
      ]);
    },
  },
  {
    id: 'birthday',
    name: 'Birthday shout-out',
    idea: 'Make their day on everyone’s feed.',
    needs: ['hero'],
    options: { theme: 'sunny', backdrop: 'confetti', sceneId: null },
    caption: 'Happy birthday, {hero}! 🎉',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      return compact([
        say(k, pal, 'accent', 'Happy birthday', 0.1, {
          size: 46,
          font: 'cursive',
          weight: 700,
        }),
        say(k, pal, 'text', '{hero}!', 0.22, {
          size: 64,
          font: 'display',
          role: 'subtitle',
        }),
        k.piece('balloons', 0.14, { scale: 1.1 }),
        k.piece('cake', 0.86, { scale: 0.9 }),
        k.person('hero', 0.5, { pose: 'cheer', mood: 'laugh' }, 1.2),
      ]);
    },
  },
  {
    id: 'book',
    name: 'Storybook launch',
    idea: 'Announce a book that stars them.',
    needs: ['hero', 'grownup'],
    options: {
      theme: 'cobalt',
      backdrop: 'glow',
      sceneId: 'dreamland_castle',
      timeOfDay: 'twilight',
    },
    caption:
      'Meet the star of our new storybook: {hero}! Made in the Cart Commerce Studio.',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      return compact([
        say(k, pal, 'accent', 'Now in print', 0.08, {
          size: 18,
          font: 'sans',
          weight: 800,
          role: 'eyebrow',
          transform: 'uppercase',
          spacing: 5,
          shadow: 'soft',
        }),
        k.text("{hero}'s Big Adventure", 0.2, {
          size: 46,
          font: 'serif',
          weight: 700,
          color: '#ffffff',
          shadow: 'soft',
          height: 120,
        }),
        k.person('grownup', 0.36, { pose: 'reach', side: 1, mood: 'smile' }),
        k.person('hero', 0.62, {
          pose: 'reach',
          side: -1,
          mood: 'grin',
          prop: 'book',
        }),
      ]);
    },
  },
  {
    id: 'thanks',
    name: 'Thank you',
    idea: 'A warm note to the people who shop with you.',
    needs: ['hero', 'grownup'],
    options: { theme: 'cream', backdrop: 'glow', sceneId: null },
    caption: 'Thank you for shopping with us. It means the world.',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      return compact([
        say(k, pal, 'text', 'Thank you', 0.12, {
          size: 64,
          font: 'cursive',
          weight: 700,
        }),
        say(k, pal, 'soft', 'for every order, every share, every smile', 0.24, {
          size: 18,
          font: 'sans',
          weight: 600,
          role: 'subtitle',
          width: 0.8,
        }),
        k.piece('hearts', 0.5, { y: 0.4, scale: 0.9 }),
        k.person('grownup', 0.38, { pose: 'reach', side: 1, mood: 'soft' }),
        k.person('hero', 0.62, {
          pose: 'reach',
          side: -1,
          mood: 'smile',
          prop: 'flowers',
        }),
      ]);
    },
  },
  {
    id: 'event',
    name: 'Event flier',
    idea: 'Invite people to something fun.',
    needs: ['hero', 'pet'],
    options: { theme: 'mint', backdrop: 'dots', sceneId: null },
    caption: 'Kids design day this Saturday at 10am. Bring your imagination!',
    build: (k, options) => {
      const pal = socialPalette(options.theme);
      return compact([
        say(k, pal, 'accent', 'You’re invited', 0.08, {
          size: 18,
          font: 'sans',
          weight: 800,
          role: 'eyebrow',
          transform: 'uppercase',
          spacing: 5,
        }),
        say(k, pal, 'text', 'Kids design day', 0.19, {
          size: 50,
          font: 'display',
          height: 110,
        }),
        k.shape(0.5, 0.33, 0.62, 0.07, {
          fill: pal.accent,
          fillRole: 'accent',
        }),
        say(k, pal, 'ink', 'Saturday · 10am', 0.33, {
          size: 20,
          font: 'sans',
          weight: 800,
          role: 'badge',
          width: 0.58,
        }),
        k.piece('bunting', 0.5, { y: 0.48, scale: 1.2 }),
        k.person('hero', 0.42, { pose: 'wave', mood: 'grin' }, 1.1),
        k.person('pet', 0.72, {}, 1.2),
      ]);
    },
  },
];

/* ---------------------------------------------------------------- books -- */

/** A whole book: a cover and a run of story moments. */
const bookStarter = (id, name, idea, title, moments) => ({
  id,
  name,
  idea,
  // Only the roles the title and the chosen moments draw: a hero-only book
  // does not add a grown-up and a pet to the shopper's cast.
  needs: [
    ...new Set([
      'hero',
      ...(title.includes('{grownup}') ? ['grownup'] : []),
      ...moments.flatMap((m) => momentById(m).cast.map((c) => c.role)),
    ]),
  ],
  book: true,
  moments,
  build: ({ artboard, cast, roles }) => {
    const stories = moments.map((m, i) => ({
      ...createStorySpread(momentById(m)),
      id: `${id}-p${i + 1}`,
    }));
    const spreads = [
      { id: `${id}-cover`, kind: 'cover' },
      { id: `${id}-dedication`, kind: 'dedication' },
      ...stories,
    ];
    const cover = kit(
      stageOf('book', artboard),
      roles,
      artboard,
      spreads[0].id
    );
    const layers = [
      cover.text(title, 0.16, {
        size: 46,
        font: 'serif',
        weight: 700,
        color: '#f8e7b8',
      }),
      cover.text('Starring {hero}', 0.27, {
        size: 18,
        font: 'sans',
        weight: 700,
        role: 'subtitle',
        transform: 'uppercase',
        spacing: 4,
        color: '#f8e7b8',
      }),
      cover.person('hero', 0.5, { pose: 'wave', mood: 'grin' }),
      ...stories.flatMap((spread) =>
        momentLayers(momentById(spread.moment), { cast, artboard, spread })
      ),
    ].filter(Boolean);
    return { layers, options: { spreads, activeSpread: stories[0].id } };
  },
});

const BOOKS = [
  bookStarter(
    'adventure',
    'Big adventure',
    'Woods, rockets and home in time for bed.',
    "{hero}'s Big Adventure",
    ['forest', 'space', 'dinos', 'bedtime']
  ),
  bookStarter(
    'birthday',
    'Birthday book',
    'The best day of the year, page by page.',
    'Happy Birthday, {hero}!',
    ['picnic', 'birthday', 'city', 'bedtime']
  ),
  bookStarter(
    'seasons',
    'All year round',
    'Sunshine, sea, snow and every season between.',
    'A Year with {hero}',
    ['picnic', 'sea', 'snow', 'bedtime']
  ),
  bookStarter(
    'together',
    'You and me',
    'A love letter from a grown-up to their kid.',
    '{grownup} & {hero}',
    ['city', 'picnic', 'snow', 'bedtime']
  ),
];

export const STARTERS = {
  poster: POSTERS,
  apparel: APPAREL,
  book: BOOKS,
  social: SOCIAL,
};

/**
 * Build a starter for the current design. Returns the next layers (every
 * page, for a book), any option changes, and the cast with anyone the idea
 * needed and the shopper did not have yet.
 */
export const buildStarter = (
  mode,
  starter,
  { artboard, options, cast: currentCast = [] }
) => {
  const cast = ensureRoles(currentCast, starter.needs ?? []);
  const roles = castForRoles(cast);
  if (starter.book) {
    const out = starter.build({ artboard, cast, roles });
    return { ...out, cast };
  }
  const config = { ...options, ...(starter.options ?? {}) };
  const stage = stageOf(mode, artboard, config);
  const layers = starter.build(kit(stage, roles, artboard), config);
  const caption = starter.caption && fillCaption(starter.caption, roles);
  return {
    layers,
    options: { ...(starter.options ?? {}), ...(caption ? { caption } : {}) },
    cast,
  };
};

const fillCaption = (text, roles) =>
  fill(text, roles).replace(
    /\{product\}/g,
    featuredProduct()?.productName ?? 'our newest arrival'
  );

/**
 * Carry every layer onto a new shape of artboard. The open idea's own
 * layers are laid out again for the new shape (a square post becoming a
 * story gets a story's layout) and keep everything else the shopper changed
 * about them; anything else is refitted proportionally.
 */
export const relayout = (layers, from, to, mode, options) => {
  const starter =
    mode !== 'book' && options.idea
      ? STARTERS[mode]?.find((s) => s.id === options.idea)
      : null;
  const own = layers.filter((l) => l.fromStarter);
  const fresh = starter
    ? buildStarter(mode, starter, {
        artboard: to,
        options,
        cast: options.cast ?? [],
      }).layers
    : null;
  const matches =
    fresh &&
    fresh.length === own.length &&
    fresh.every((l, i) => l.type === own[i].type);
  let i = 0;
  return layers.map((layer) => {
    if (!matches || !layer.fromStarter) return refitLayer(layer, from, to);
    const f = fresh[i];
    i += 1;
    return {
      ...layer,
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      ...(layer.type === 'text' ? { fontSize: f.fontSize } : {}),
    };
  });
};

/** "Inspire me": any starter but the one on screen. */
export const randomStarter = (mode, currentId = null) => {
  const list = (STARTERS[mode] ?? []).filter((s) => s.id !== currentId);
  return list[Math.floor(Math.random() * list.length)] ?? null;
};

/** For a book thumbnail: the spread a starter opens on. */
export const starterPreviewSpread = (built) =>
  activeSpreadOf(built.options ?? {});
