import { describe, expect, it } from 'vitest';
import { castStarring } from '../Components/Studio/cast/castModel';
import {
  decodeDesign,
  encodeDesign,
} from '../Components/Studio/core/designCodec';

// What a hand-edited or truncated `?d=` link decodes to.
const encodeRaw = (raw) =>
  btoa(JSON.stringify(raw))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

describe('decoding a design link', () => {
  it('round-trips a real design', () => {
    const doc = decodeDesign(
      encodeDesign({
        v: 2,
        mode: 'poster',
        options: { size: '18x24' },
        layers: [{ id: 'a', type: 'text', x: 1, y: 2, text: 'Hi' }],
        meta: { idea: 'adventure', hero: { look: 'zara' } },
      })
    );

    expect(doc.options).toEqual({ size: '18x24' });
    expect(doc.layers[0]).toMatchObject({ type: 'text', text: 'Hi' });
    expect(doc.meta.hero).toEqual({ look: 'zara' });
  });

  it('returns null for garbage', () => {
    expect(decodeDesign('not-base64!!')).toBeNull();
    expect(decodeDesign(encodeRaw([1, 2, 3]))).toBeNull();
    expect(decodeDesign(encodeRaw({ m: 'nonsense' }))).toBeNull();
  });

  it('drops malformed fields instead of passing them to the editors', () => {
    const doc = decodeDesign(
      encodeRaw({
        v: 2,
        m: 'poster',
        o: 'oops',
        l: [null, 7, { t: 42 }, { t: 'text', c: 'kept' }],
        idea: { evil: true },
        h: { look: 'zara', name: { first: 'x' } },
      })
    );

    expect(doc.options).toEqual({});
    expect(doc.layers).toHaveLength(1);
    expect(doc.layers[0].text).toBe('kept');
    expect(doc.meta.idea).toBeNull();
    expect(doc.meta.hero).toEqual({ look: 'zara' });
  });

  it('caps how many layers a link can carry', () => {
    const doc = decodeDesign(
      encodeRaw({
        v: 2,
        m: 'poster',
        l: Array.from({ length: 5000 }, () => ({ t: 'text' })),
      })
    );

    expect(doc.layers.length).toBeLessThanOrEqual(300);
  });

  it('casts a hero even when the name is not a string', () => {
    const hero = castStarring('zara', { first: 'x' }).find(
      (m) => m.id === 'cast-hero'
    );

    expect(typeof hero.name).toBe('string');
  });
});
