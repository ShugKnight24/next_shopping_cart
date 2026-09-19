import { describe, expect, it } from 'vitest';
import { applyTemplate, SLOT_ROLES } from '../Components/Studio/workbench/layerModel';
import { STYLE_PRESETS } from '../Components/Studio/workbench/stylePresets';
import { TEMPLATES_BY_MODE } from '../Components/Studio/workbench/templates';

/**
 * Templates and style presets are data, and data rots quietly: a template whose
 * text sits off the artboard, or a preset that mutates the stack it was handed,
 * fails in the picker rather than at the keyboard. These assertions are cheap
 * and catch the whole class.
 */

const MODES = ['poster', 'apparel', 'book'];
const MINIMUM = { poster: 12, apparel: 10, book: 8 };

describe.each(MODES)('%s templates', (mode) => {
  const templates = TEMPLATES_BY_MODE[mode];

  it('meets the agreed count', () => {
    expect(templates.length).toBeGreaterThanOrEqual(MINIMUM[mode]);
  });

  it('has unique ids', () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('groups into more than one category', () => {
    expect(new Set(templates.map((t) => t.category)).size).toBeGreaterThan(1);
  });

  it.each(templates.map((t) => [t.id, t]))(
    '%s is well formed',
    (_id, template) => {
      expect(template.name).toBeTruthy();
      expect(template.artboard?.width).toBeGreaterThan(0);
      expect(template.artboard?.height).toBeGreaterThan(0);
      expect(template.layers.length).toBeGreaterThan(0);

      const seeded = applyTemplate(template, []);

      seeded.forEach((layer) => {
        expect(Number.isFinite(layer.x), `${layer.type} x`).toBe(true);
        expect(Number.isFinite(layer.y), `${layer.type} y`).toBe(true);
        expect(layer.width).toBeGreaterThan(0);
        expect(layer.height).toBeGreaterThan(0);

        // Centres inside the artboard: a layer centred outside it is invisible
        // and unselectable without panning off the page.
        expect(layer.x).toBeGreaterThanOrEqual(0);
        expect(layer.y).toBeGreaterThanOrEqual(0);
        expect(layer.x).toBeLessThanOrEqual(template.artboard.width);
        expect(layer.y).toBeLessThanOrEqual(template.artboard.height);

        if (layer.slotRole) expect(SLOT_ROLES).toContain(layer.slotRole);
      });
    }
  );

  it('every template has a title slot so a swap never loses the headline', () => {
    templates.forEach((template) => {
      const seeded = applyTemplate(template, []);
      expect(
        seeded.some((l) => l.slotRole === 'title'),
        `${template.id} has no title slot`
      ).toBe(true);
    });
  });

  it('contains no emoji in its copy', () => {
    // The product rule is zero emoji app-wide; placeholder copy is still copy.
    const emoji = /\p{Extended_Pictographic}/u;

    templates.forEach((template) => {
      applyTemplate(template, [])
        .filter((l) => l.type === 'text')
        .forEach((l) => {
          expect(emoji.test(l.text ?? ''), `${template.id}: ${l.text}`).toBe(
            false
          );
        });
    });
  });
});

describe.each(MODES)('%s style presets', (mode) => {
  const presets = STYLE_PRESETS[mode];
  const sample = () => applyTemplate(TEMPLATES_BY_MODE[mode][0], []);

  it('offers several looks', () => {
    expect(presets.length).toBeGreaterThanOrEqual(6);
  });

  it.each(presets.map((p) => [p.id, p]))('%s restyles purely', (_id, preset) => {
    const input = sample();
    const frozen = JSON.stringify(input);

    const output = preset.apply(input);

    expect(Array.isArray(output)).toBe(true);
    expect(output).toHaveLength(input.length);
    // Pure: the caller's array must come back untouched.
    expect(JSON.stringify(input)).toBe(frozen);
  });

  it.each(presets.map((p) => [p.id, p]))(
    '%s restyles without moving anything',
    (_id, preset) => {
      const input = sample();
      const output = preset.apply(input);

      output.forEach((layer, i) => {
        const before = input[i];
        expect(layer.id).toBe(before.id);
        expect(layer.x).toBe(before.x);
        expect(layer.y).toBe(before.y);
        expect(layer.width).toBe(before.width);
        expect(layer.height).toBe(before.height);
        expect(layer.rotation).toBe(before.rotation);
        // A style changes how it looks, never what it says.
        if (before.type === 'text') expect(layer.text).toBe(before.text);
      });
    }
  );
});
