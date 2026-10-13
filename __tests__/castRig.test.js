import { describe, expect, it } from 'vitest';
import {
  MOMENTS,
  castForRoles,
  momentLayers,
  pageIndexOf,
  spreadConfig,
  starterBook,
} from '../Components/Studio/book/bookPages';
import {
  createPerson,
  createPet,
  placeMember,
  starterCast,
} from '../Components/Studio/cast/castModel';
import {
  DEFAULT_PERSON,
  MOODS,
  PERSON_FIELDS,
  POSES,
  PROPS,
  describePerson,
  normalizePerson,
  personArt,
} from '../Components/Studio/cast/castRig';
import { PIECES, pieceArt } from '../Components/Studio/cast/scenePieces';
import {
  createLayer,
  reframeLayer,
  resizeLayer,
} from '../Components/Studio/workbench/layerModel';
import { facingOf } from '../Components/Studio/workbench/renderLayers';

/**
 * The cast rig must honour every option it offers. The studio's
 * characteristic bug is the pickable-but-invisible option, so each value of
 * each person field is drawn against the defaults and must change the art.
 */

/** Some options only show when another one makes room for them. */
const CONTEXT = {
  hatColor: { hat: 'cap' },
  accentColor: { pattern: 'stripes' },
  bottomColor: { bottom: 'jeans' },
  facialHair: { age: 'adult' },
};

const markup = (person, placement) =>
  personArt(person, placement).markup.replace(/cast-pat-\d+/g, 'pat');

describe('cast rig', () => {
  Object.entries(PERSON_FIELDS).forEach(([field, table]) => {
    it(`draws every ${field} option differently`, () => {
      const base = { ...DEFAULT_PERSON, ...CONTEXT[field] };
      const reference = markup(base);
      table
        .filter((option) => option.id !== base[field])
        .forEach((option) => {
          expect(
            markup({ ...base, [field]: option.id }),
            `${field}: ${option.id}`
          ).not.toBe(reference);
        });
    });
  });

  it('draws the blush and freckles toggles', () => {
    expect(markup({ ...DEFAULT_PERSON, blush: false })).not.toBe(
      markup(DEFAULT_PERSON)
    );
    expect(markup({ ...DEFAULT_PERSON, freckles: true })).not.toBe(
      markup(DEFAULT_PERSON)
    );
  });

  it.each([
    ['pose', POSES, 'stand'],
    ['mood', MOODS, 'smile'],
    ['prop', PROPS, 'none'],
  ])('draws every %s placement differently', (key, table, fallback) => {
    const reference = markup(DEFAULT_PERSON, { [key]: fallback });
    table
      .filter((o) => o.id !== fallback)
      .forEach((o) =>
        expect(
          markup(DEFAULT_PERSON, { [key]: o.id }),
          `${key}: ${o.id}`
        ).not.toBe(reference)
      );
  });

  it('frames the art tightly with the feet on the bottom edge', () => {
    const art = personArt(DEFAULT_PERSON);
    expect(art.width).toBeGreaterThan(40);
    expect(art.height).toBeGreaterThan(art.width);
    // viewBox runs from above the head down to just under the feet (y = 0).
    expect(art.viewBox[1] + art.viewBox[3]).toBeGreaterThanOrEqual(0);
    expect(art.viewBox[1] + art.viewBox[3]).toBeLessThan(12);
  });

  it('grows the frame for outstretched arms and tall props', () => {
    const standing = personArt(DEFAULT_PERSON);
    expect(personArt(DEFAULT_PERSON, { pose: 'point' }).width).toBeGreaterThan(
      standing.width
    );
    expect(
      personArt(DEFAULT_PERSON, { prop: 'balloon' }).height
    ).toBeGreaterThan(standing.height);
    expect(
      personArt(DEFAULT_PERSON, { prop: 'umbrella' }).height
    ).toBeGreaterThan(standing.height);
  });

  it('draws grown-ups taller than kids, and kids taller than little ones', () => {
    const h = (age) => personArt({ ...DEFAULT_PERSON, age }).height;
    expect(h('adult')).toBeGreaterThan(h('kid'));
    expect(h('kid')).toBeGreaterThan(h('toddler'));
  });

  it('reaches toward the partner when holding hands', () => {
    expect(markup(DEFAULT_PERSON, { pose: 'reach', side: 1 })).not.toBe(
      markup(DEFAULT_PERSON, { pose: 'reach', side: -1 })
    );
  });

  it('normalizes unknown values back to the defaults', () => {
    const p = normalizePerson({ hair: 'mullet', skin: 'green', top: 'hoodie' });
    expect(p.hair).toBe(DEFAULT_PERSON.hair);
    expect(p.skin).toBe(DEFAULT_PERSON.skin);
    expect(p.top).toBe('hoodie');
  });

  it('describes a person for the order sheet', () => {
    expect(describePerson({ ...DEFAULT_PERSON, top: 'sundress' })).toMatch(
      /sundress/i
    );
    expect(describePerson(DEFAULT_PERSON)).toMatch(/jeans/i);
  });
});

describe('scenery pieces', () => {
  it('draws every piece, and recolours the tintable ones', () => {
    PIECES.forEach((p) => {
      const art = pieceArt(p.id);
      expect(art.svg, p.id).toMatch(/<(path|rect|circle|ellipse)/);
      if (p.tint) expect(pieceArt(p.id, '#123456').svg, p.id).not.toBe(art.svg);
    });
  });
});

describe('character and scenery layers', () => {
  it('scales locked-aspect layers uniformly from any handle', () => {
    const layer = createLayer('character', {
      x: 100,
      y: 100,
      width: 50,
      height: 100,
    });
    const wider = resizeLayer(layer, { fx: 1, fy: 0 }, 50, 0);
    expect(wider.width).toBeCloseTo(100);
    expect(wider.height).toBeCloseTo(200);
  });

  it('keeps scale and feet when the art changes shape', () => {
    const layer = createLayer('character', {
      x: 100,
      y: 100,
      width: 50,
      height: 100,
    });
    const next = reframeLayer(
      layer,
      { width: 50, height: 100 },
      { width: 80, height: 120 }
    );
    expect(next.height).toBeCloseTo(120);
    expect(next.width).toBeCloseTo(80);
    expect(next.y + next.height / 2).toBeCloseTo(layer.y + layer.height / 2);
  });

  it('knows which way each character faces their nearest neighbour', () => {
    const a = createLayer('character', { x: 100 });
    const b = createLayer('character', { x: 200 });
    const facing = facingOf([a, b]);
    expect(facing.get(a.id)).toBe(1);
    expect(facing.get(b.id)).toBe(-1);
  });

  it('places a member with grown-ups taller than kids', () => {
    const at = { x: 300, feet: 500, adultHeight: 240 };
    const adult = placeMember(createPerson('adult'), at);
    const kid = placeMember(createPerson('kid'), at);
    const pet = placeMember(createPet(), at);
    expect(adult.height).toBeGreaterThan(kid.height);
    expect(kid.height).toBeGreaterThan(pet.height);
    expect(adult.y + adult.height / 2).toBeCloseTo(500);
  });
});

describe('storybook pages', () => {
  const artboard = { width: 620, height: 620 };
  const cast = starterCast();

  it('casts the hero, the grown-up and the pet', () => {
    const roles = castForRoles(cast);
    expect(roles.hero.name).toBe('Maya');
    expect(roles.grownup.age).toBe('adult');
    expect(roles.pet.kind).toBe('pet');
  });

  it.each(MOMENTS.map((m) => [m.name, m]))(
    'acts out "%s" on its own spread',
    (_, moment) => {
      const spread = { id: 'p1', kind: 'story', spreadLayout: 'panoramic' };
      const layers = momentLayers(moment, { cast, artboard, spread });
      expect(layers.every((l) => l.page === 'p1')).toBe(true);
      expect(layers.filter((l) => l.type === 'character')).toHaveLength(
        moment.cast.length
      );
      expect(layers.filter((l) => l.type === 'piece')).toHaveLength(
        moment.pieces.length
      );
      const words = layers.find((l) => l.type === 'text');
      expect(words.text).not.toMatch(/\{/);
      expect(new Set(layers.map((l) => l.id)).size).toBe(layers.length);
    }
  );

  it('numbers the cover, the dedication and the story spreads', () => {
    const book = starterBook({ cast, artboard });
    expect(pageIndexOf(book.spreads, 'cover')).toBe(0);
    expect(pageIndexOf(book.spreads, 'dedication')).toBe(1);
    expect(pageIndexOf(book.spreads, book.activeSpread)).toBe(2);
  });

  it("paints each spread's own scene", () => {
    const book = starterBook({ cast, artboard });
    const options = { spreads: book.spreads, activeSpread: book.spreads[3].id };
    const config = spreadConfig(options);
    expect(config.activePage).toBe(3);
    expect(config.sceneId).toBe(book.spreads[3].sceneId);
  });
});

describe('rig markup', () => {
  it('draws the same person as the same markup every time', () => {
    // The server render and the browser must agree, or hydration fails.
    const person = createPerson('kid', { pattern: 'stars' });
    const first = personArt(person, {}).svg;

    expect(first).toContain('<pattern');
    expect(personArt(person, {}).svg).toBe(first);
  });
});
