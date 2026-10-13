/**
 * The storybook's pages.
 *
 * A book is a cover, a dedication and any number of story spreads, held in
 * `options.spreads` with `options.activeSpread` naming the one on screen.
 * Each story spread carries its own scene (environment, time of day,
 * weather, layout). Its characters, scenery and words are ordinary layers
 * stamped with the spread's id, so the workbench pages them (see
 * `useWorkbench`'s `scope`).
 *
 * A *moment* is a ready-made story beat — a picnic, a rocket trip, bedtime —
 * that sets the scene and stages the cast in it. Every piece it lays down is a
 * normal layer the shopper can then move, restyle or delete.
 */

import { memberName, placeMember } from '../cast/castModel';
import { ADULT_HEIGHT } from '../cast/castRig';
import { pieceArt, pieceById } from '../cast/scenePieces';
import { bookStageRect } from '../drawSubstrate';

export const MOMENTS = [
  {
    id: 'picnic',
    name: 'Sunny picnic',
    sceneId: 'rainbow_meadow',
    timeOfDay: 'day',
    weatherEffect: 'sunbeams',
    text: 'On the sunniest day of the year, {hero} and {grownup} packed a picnic and went looking for the very best spot.',
    pieces: [
      { piece: 'tree', at: 0.12, scale: 1.05 },
      { piece: 'cloud', at: 0.72, sky: 0.12, scale: 0.8 },
      { piece: 'flowers', at: 0.9, front: true, scale: 0.8 },
    ],
    cast: [
      { role: 'grownup', at: 0.36, pose: 'wave', mood: 'smile' },
      { role: 'hero', at: 0.62, pose: 'stand', mood: 'grin', prop: 'iceCream' },
      { role: 'pet', at: 0.84 },
    ],
  },
  {
    id: 'forest',
    name: 'Forest adventure',
    sceneId: 'enchanted_forest',
    timeOfDay: 'golden_hour',
    weatherEffect: 'fireflies',
    text: 'Deep in the whispering woods, {hero} found a path that nobody had walked before.',
    pieces: [
      { piece: 'pine', at: 0.08, scale: 1.1 },
      { piece: 'tent', at: 0.82, scale: 0.75 },
      { piece: 'mushroom', at: 0.04, front: true, scale: 0.7 },
      { piece: 'campfire', at: 0.62, front: true, scale: 0.6 },
    ],
    cast: [
      { role: 'hero', at: 0.42, pose: 'point', mood: 'wow', prop: 'wand' },
      { role: 'pet', at: 0.25 },
    ],
  },
  {
    id: 'space',
    name: 'Rocket ride',
    sceneId: 'cosmic_nebula',
    timeOfDay: 'midnight',
    weatherEffect: 'stars',
    text: '3, 2, 1… blast off! {hero} flew past the moon and waved at every star on the way.',
    pieces: [
      { piece: 'planet', at: 0.2, sky: 0.18, scale: 0.9 },
      { piece: 'rocket', at: 0.78, scale: 1.05 },
      { piece: 'star', at: 0.55, sky: 0.08, scale: 0.6 },
    ],
    cast: [{ role: 'hero', at: 0.45, pose: 'cheer', mood: 'laugh' }],
  },
  {
    id: 'birthday',
    name: 'Birthday party',
    sceneId: 'dreamland_castle',
    timeOfDay: 'twilight',
    weatherEffect: 'stars',
    text: 'Happy birthday, {hero}! There was cake, there were balloons, and there was a LOT of dancing.',
    pieces: [
      { piece: 'bunting', at: 0.5, sky: 0.04, scale: 1.1 },
      { piece: 'balloons', at: 0.1, scale: 0.9 },
      { piece: 'cake', at: 0.56, front: true, scale: 0.75 },
      { piece: 'gifts', at: 0.88, front: true, scale: 0.8 },
    ],
    cast: [
      { role: 'grownup', at: 0.3, pose: 'cheer', mood: 'laugh', prop: 'none' },
      { role: 'hero', at: 0.7, pose: 'jump', mood: 'grin', prop: 'balloon' },
    ],
  },
  {
    id: 'sea',
    name: 'Under the sea',
    sceneId: 'coral_kingdom',
    timeOfDay: 'day',
    weatherEffect: 'bubbles',
    text: 'Down, down, down they swam, where the fish wear stripes and the coral glows.',
    pieces: [
      { piece: 'boat', at: 0.8, sky: 0.02, scale: 0.75 },
      { piece: 'sandcastle', at: 0.18, front: true, scale: 0.8 },
    ],
    cast: [
      { role: 'hero', at: 0.42, pose: 'wave', mood: 'wow' },
      { role: 'pet', at: 0.64 },
    ],
  },
  {
    id: 'snow',
    name: 'Snow day',
    sceneId: 'winter_aurora',
    timeOfDay: 'twilight',
    weatherEffect: 'snow',
    text: 'The whole world was white. {hero} and {grownup} built the tallest snowman in town.',
    pieces: [
      { piece: 'pine', at: 0.08, scale: 1 },
      { piece: 'snowman', at: 0.82, scale: 0.85 },
    ],
    cast: [
      { role: 'grownup', at: 0.34, pose: 'reach', mood: 'smile' },
      { role: 'hero', at: 0.56, pose: 'reach', mood: 'laugh' },
    ],
  },
  {
    id: 'dinos',
    name: 'Dinosaur valley',
    sceneId: 'jurassic_valley',
    timeOfDay: 'day',
    weatherEffect: 'sunbeams',
    text: 'Stomp, stomp, ROAR! {hero} was not scared of dinosaurs. Not even a little bit.',
    pieces: [
      { piece: 'palm', at: 0.12, scale: 1.05 },
      { piece: 'rock', at: 0.86, front: true, scale: 0.7 },
    ],
    cast: [
      { role: 'hero', at: 0.5, pose: 'point', mood: 'cheeky' },
      { role: 'pet', at: 0.7 },
    ],
  },
  {
    id: 'city',
    name: 'City lights',
    sceneId: 'neon_metropolis',
    timeOfDay: 'twilight',
    weatherEffect: 'none',
    text: 'Hand in hand, {grownup} and {hero} walked home under a thousand twinkling lights.',
    pieces: [
      { piece: 'lamp', at: 0.12, scale: 1 },
      { piece: 'bench', at: 0.84, scale: 0.8 },
    ],
    cast: [
      { role: 'grownup', at: 0.4, pose: 'reach', mood: 'soft' },
      { role: 'hero', at: 0.6, pose: 'reach', mood: 'smile', prop: 'none' },
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime',
    sceneId: 'dreamland_castle',
    timeOfDay: 'midnight',
    weatherEffect: 'stars',
    text: 'One more story, then sleep. Goodnight, {hero}. Tomorrow is another adventure.',
    pieces: [
      { piece: 'moon', at: 0.82, sky: 0.08, scale: 0.8 },
      { piece: 'castle', at: 0.16, scale: 0.75 },
    ],
    cast: [
      { role: 'grownup', at: 0.44, pose: 'stand', mood: 'soft', prop: 'book' },
      { role: 'hero', at: 0.66, pose: 'shy', mood: 'calm', prop: 'teddy' },
    ],
  },
];

export const momentById = (id) => MOMENTS.find((m) => m.id === id) ?? null;

/* -------------------------------------------------------------- spreads -- */

export const SPREAD_LAYOUTS = [
  { value: 'panoramic', label: 'Full spread' },
  { value: 'framed', label: 'Framed page' },
];

let seq = 0;
const spreadId = () =>
  `spread-${Date.now().toString(36)}-${(seq += 1).toString(36)}`;

export const createStorySpread = (moment = MOMENTS[0], overrides = {}) => ({
  id: spreadId(),
  kind: 'story',
  moment: moment?.id ?? null,
  sceneId: moment?.sceneId ?? 'rainbow_meadow',
  timeOfDay: moment?.timeOfDay ?? 'day',
  weatherEffect: moment?.weatherEffect ?? 'none',
  spreadLayout: 'panoramic',
  ...overrides,
});

/** Index of a spread in the substrate's page numbering: 0 cover, 1 dedication, 2+ story. */
export const pageIndexOf = (spreads, id) => {
  const spread = spreads.find((s) => s.id === id);
  if (!spread) return 2;
  if (spread.kind === 'cover') return 0;
  if (spread.kind === 'dedication') return 1;
  return 2 + spreads.filter((s) => s.kind === 'story').indexOf(spread);
};

export const spreadLabel = (spreads, spread) => {
  if (spread.kind === 'cover') return 'Cover';
  if (spread.kind === 'dedication') return 'Dedication';
  return `Pages ${spreads.filter((s) => s.kind === 'story').indexOf(spread) * 2 + 1}–${spreads.filter((s) => s.kind === 'story').indexOf(spread) * 2 + 2}`;
};

/** The substrate config for whichever spread is on screen. */
/**
 * The open spread. If it is gone (an undo removed it), the first story
 * spread, then anything at all.
 */
export const activeSpreadOf = (options) => {
  const spreads = options.spreads ?? [];
  return (
    spreads.find((s) => s.id === options.activeSpread) ??
    spreads.find((s) => s.kind === 'story') ??
    spreads[0] ??
    null
  );
};

export const spreadConfig = (options) => {
  const spreads = options.spreads ?? [];
  const spread = activeSpreadOf(options);
  if (!spread) return options;
  return {
    ...options,
    activePage: pageIndexOf(spreads, spread.id),
    ...(spread.kind === 'story'
      ? {
          sceneId: spread.sceneId,
          timeOfDay: spread.timeOfDay,
          weatherEffect: spread.weatherEffect,
          spreadLayout: spread.spreadLayout,
        }
      : {}),
  };
};

/* ---------------------------------------------------------------- stage -- */

/**
 * Where people stand on a spread. On a full spread the art runs across both
 * pages and the words sit on the left, so the cast stands on the right; on a
 * framed page they stand inside the illustration window.
 */
export const bookStage = (artboard, layout = 'panoramic') => {
  const { width, height } = artboard;
  if (layout === 'framed') {
    const s = bookStageRect(width, height, { spreadLayout: 'framed' });
    return {
      x0: s.stageX + 8,
      x1: s.stageX + s.stageW - 8,
      feet: s.stageY + s.stageH * 0.9,
      top: s.stageY,
      adultHeight: s.stageH * 0.56,
    };
  }
  return {
    x0: width * 0.5 + 6,
    x1: width - 30,
    feet: height * 0.88,
    top: 28,
    adultHeight: height * 0.44,
  };
};

const roleOrder = {
  hero: (m) => m.kind === 'person' && m.age !== 'adult',
  grownup: (m) => m.kind === 'person' && m.age === 'adult',
  pet: (m) => m.kind === 'pet',
};

/** Who plays each role in a moment: the first kid, the first grown-up, the first pet. */
export const castForRoles = (cast) => {
  const used = new Set();
  const pickFor = (role) => {
    const m =
      cast.find((c) => roleOrder[role](c) && !used.has(c.id)) ??
      (role !== 'pet'
        ? cast.find((c) => c.kind === 'person' && !used.has(c.id))
        : null);
    if (m) used.add(m.id);
    return m ?? null;
  };
  return {
    hero: pickFor('hero'),
    grownup: pickFor('grownup'),
    pet: pickFor('pet'),
  };
};

const fillNames = (text, roles) =>
  text
    .replace(/\{hero\}/g, memberName(roles.hero, 'our hero'))
    .replace(/\{grownup\}/g, memberName(roles.grownup, 'their grown-up'));

/**
 * The layers a moment lays down on one spread: scenery behind, the cast,
 * scenery in front, then the words on the prose card. Ids are derived from
 * the spread so the same book renders the same on server and client.
 */
export const momentLayers = (moment, { cast, artboard, spread }) => {
  const stage = bookStage(artboard, spread.spreadLayout);
  const span = stage.x1 - stage.x0;
  const k = stage.adultHeight / ADULT_HEIGHT;
  const roles = castForRoles(cast);
  let n = 0;
  const id = (kind) => `${spread.id}-${kind}-${(n += 1)}`;

  const piece = (p) => {
    const art = pieceArt(p.piece);
    const scale = k * (p.scale ?? 1);
    const height = art.height * scale;
    const x = stage.x0 + span * p.at;
    const y =
      p.sky != null
        ? stage.top + artboard.height * p.sky + height / 2
        : stage.feet - height / 2 + (p.front ? 6 : 0);
    return {
      id: id('piece'),
      type: 'piece',
      name: pieceById(p.piece).name,
      piece: p.piece,
      x,
      y,
      width: art.width * scale,
      height,
      page: spread.id,
      fromMoment: true,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      lockAspect: true,
      tint: null,
      flipX: false,
    };
  };

  const people = moment.cast
    .map((c) => ({ c, member: roles[c.role] }))
    .filter(({ member }) => member)
    .map(({ c, member }, i, all) => {
      const x = stage.x0 + span * c.at;
      const neighbour = all
        .filter((o) => o.c !== c)
        .sort((a, b) => Math.abs(a.c.at - c.at) - Math.abs(b.c.at - c.at))[0];
      const side = neighbour ? Math.sign(neighbour.c.at - c.at) : 0;
      const spec = placeMember(member, {
        x,
        feet: stage.feet,
        adultHeight: stage.adultHeight,
        pose: c.pose ?? 'stand',
        mood: c.mood ?? 'smile',
        prop: c.prop ?? 'none',
        side,
      });
      return (
        spec && {
          ...spec,
          id: id('cast'),
          page: spread.id,
          fromMoment: true,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          lockAspect: true,
          flipX: false,
        }
      );
    })
    .filter(Boolean);

  const card = bookStageRect(artboard.width, artboard.height, {
    spreadLayout: spread.spreadLayout,
  });
  const words = moment.text && {
    id: id('text'),
    type: 'text',
    name: 'Story text',
    slotRole: 'body',
    text: fillNames(moment.text, roles),
    x: card.cardX + card.cardW / 2,
    y: card.cardY + card.cardH / 2,
    width: card.cardW - 40,
    height: card.cardH * 0.6,
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: 400,
    color: '#2b2433',
    align: 'center',
    lineHeight: 1.45,
    letterSpacing: 0,
    textTransform: 'none',
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    page: spread.id,
    fromMoment: true,
  };

  return [
    ...moment.pieces.filter((p) => !p.front).map(piece),
    ...people,
    ...moment.pieces.filter((p) => p.front).map(piece),
    ...(words ? [words] : []),
  ];
};

/** A new book: cover, dedication and three story spreads already acted out. */
export const starterBook = ({ cast, artboard }) => {
  const stories = ['picnic', 'forest', 'bedtime'].map((id, i) => ({
    ...createStorySpread(momentById(id)),
    id: `spread-${i + 1}`,
  }));
  const spreads = [
    { id: 'cover', kind: 'cover' },
    { id: 'dedication', kind: 'dedication' },
    ...stories,
  ];
  const layers = stories.flatMap((spread) =>
    momentLayers(momentById(spread.moment), { cast, artboard, spread })
  );
  return { spreads, activeSpread: stories[0].id, layers };
};
