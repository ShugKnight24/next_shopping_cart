/**
 * The cast of a design: the people (and pets) a shopper creates once and
 * places on any page. Stored in `options.cast` so it survives saves, share
 * links and reopened cart lines, like every other persisted choice.
 *
 *   person: { id, kind: 'person', name, ...castRig person fields }
 *   pet:    { id, kind: 'pet', name, ...characterSchema companion fields }
 */

import { DEFAULT_COMPANION, normalizeCompanion } from '../core/characterSchema';
import { personArtFor } from './castRaster';
import { ADULT_HEIGHT, PERSON_PRESETS, normalizePerson } from './castRig';

let seq = 0;
const castId = () =>
  `cast-${Date.now().toString(36)}-${(seq += 1).toString(36)}`;

export const createPerson = (preset = 'kid', overrides = {}) => ({
  ...normalizePerson(PERSON_PRESETS[preset] ?? PERSON_PRESETS.kid),
  id: castId(),
  kind: 'person',
  name: '',
  ...overrides,
});

export const createPet = (overrides = {}) => ({
  ...normalizeCompanion(DEFAULT_COMPANION),
  id: castId(),
  kind: 'pet',
  ...overrides,
});

/** A starter cast for a storybook: the hero, a grown-up and a pet. */
export const starterCast = () => [
  createPerson('kid', {
    id: 'cast-hero',
    name: 'Maya',
    hair: 'buns',
    hairColor: 'espresso',
    skin: 'caramel',
    top: 'tee',
    topColor: 'mustard',
    pattern: 'stars',
    accentColor: 'white',
    bottom: 'overalls',
    bottomColor: 'denim',
    shoes: 'sneakers',
    shoeColor: 'red',
  }),
  createPerson('adult', { id: 'cast-grownup', name: 'Mum' }),
  createPet({ id: 'cast-pet', name: 'Biscuit' }),
];

/**
 * Ready-made kids for places that offer a quick pick instead of the full
 * look editor (the studio page's previews). Each is a patch on the kid
 * preset, so a preview link can carry just the id.
 */
export const KID_LOOKS = [
  {
    id: 'maya',
    name: 'Maya',
    look: {
      skin: 'caramel',
      hair: 'buns',
      hairColor: 'espresso',
      top: 'tee',
      topColor: 'mustard',
      pattern: 'stars',
      accentColor: 'white',
      bottom: 'overalls',
      bottomColor: 'denim',
      shoes: 'sneakers',
      shoeColor: 'red',
    },
  },
  {
    id: 'sam',
    name: 'Sam',
    look: {
      skin: 'peach',
      freckles: true,
      hair: 'curlyTop',
      hairColor: 'ginger',
      eyeColor: 'green',
      glasses: 'round',
      top: 'tee',
      topColor: 'teal',
      pattern: 'stripes',
      accentColor: 'white',
      bottom: 'shorts',
      bottomColor: 'navy',
      shoes: 'sneakers',
      shoeColor: 'mustard',
    },
  },
  {
    id: 'zara',
    name: 'Zara',
    look: {
      skin: 'cocoa',
      hair: 'braids',
      hairColor: 'black',
      top: 'sundress',
      topColor: 'berry',
      pattern: 'dots',
      accentColor: 'white',
      shoes: 'sneakers',
      shoeColor: 'white',
    },
  },
  {
    id: 'kai',
    name: 'Kai',
    look: {
      skin: 'golden',
      hair: 'spiky',
      hairColor: 'black',
      top: 'hoodie',
      topColor: 'red',
      pattern: 'solid',
      bottom: 'jeans',
      bottomColor: 'denim',
      shoes: 'sneakers',
      shoeColor: 'black',
    },
  },
];

export const kidLookById = (id) =>
  KID_LOOKS.find((k) => k.id === id) ?? KID_LOOKS[0];

/** The starter cast, with one of the ready-made kids as its hero. */
export const castStarring = (lookId, name = null) => {
  const kid = kidLookById(lookId);
  return starterCast().map((member) =>
    member.id === 'cast-hero'
      ? {
          ...createPerson('kid', kid.look),
          id: 'cast-hero',
          name: name?.trim() || kid.name,
        }
      : member
  );
};

export const memberById = (cast, id) => cast?.find((m) => m.id === id) ?? null;

export const memberName = (member, fallback = 'Someone') =>
  member?.name?.trim() || (member?.kind === 'pet' ? 'Pet' : fallback);

/** Pets draw procedurally around their origin; this is their box at scale 1. */
export const PET_BOX = { width: 76, height: 64 };

const normalizedCache = new WeakMap();
const normalized = (member) => {
  let p = normalizedCache.get(member);
  if (!p) {
    p = normalizePerson(member);
    normalizedCache.set(member, p);
  }
  return p;
};

/**
 * The art for a character layer: the rig drawing for a person, the box of the
 * procedural pet. `side` is which way the nearest other character stands.
 */
export const artForLayer = (layer, member, side = 0) => {
  if (!member) return null;
  if (member.kind === 'pet') return { pet: true, ...PET_BOX };
  return personArtFor(normalized(member), {
    pose: layer.pose,
    mood: layer.mood,
    prop: layer.prop,
    side,
  });
};

/**
 * A character layer sized for an artboard: an adult stands `adultHeight`
 * tall, a child or a pet in proportion, with the feet at `feet`.
 */
export const placeMember = (
  member,
  {
    x,
    feet,
    adultHeight,
    pose = 'stand',
    mood = 'smile',
    prop = 'none',
    side = 0,
  }
) => {
  const art = artForLayer({ pose, mood, prop }, member, side);
  if (!art) return null;
  const k =
    member.kind === 'pet'
      ? (adultHeight * 0.32) / PET_BOX.height
      : adultHeight / ADULT_HEIGHT;
  const width = art.width * k;
  const height = art.height * k;
  return {
    type: 'character',
    name: memberName(member),
    castId: member.id,
    pose,
    mood,
    prop,
    x,
    y: feet - height / 2,
    width,
    height,
  };
};
