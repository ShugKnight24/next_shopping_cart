import { describe, expect, it } from 'vitest';
import {
  alignLayer,
  applyTemplate,
  boundsOf,
  createLayer,
  duplicateLayer,
  handlePositions,
  hitTest,
  layerAt,
  moveLayer,
  reorder,
  resizeLayer,
  snapPosition,
} from '../Components/Studio/workbench/layerModel';

const artboard = { width: 400, height: 600 };

const text = (overrides) =>
  createLayer('text', { x: 200, y: 300, width: 100, height: 40, ...overrides });

describe('hit testing', () => {
  it('hits inside the box and misses outside', () => {
    const layer = text();
    expect(hitTest(layer, 200, 300)).toBe(true);
    expect(hitTest(layer, 249, 319)).toBe(true);
    expect(hitTest(layer, 260, 300)).toBe(false);
  });

  it('respects rotation rather than testing a circle', () => {
    const layer = text({ rotation: 90 });

    // Rotated 90deg, the box is now 40 wide and 100 tall.
    expect(hitTest(layer, 200, 345)).toBe(true);
    expect(hitTest(layer, 240, 300)).toBe(false);
  });

  it('never hits a hidden or locked layer', () => {
    expect(hitTest(text({ visible: false }), 200, 300)).toBe(false);
    expect(hitTest(text({ locked: true }), 200, 300)).toBe(false);
  });

  it('picks the topmost layer under the point', () => {
    const bottom = text({ id: 'bottom' });
    const top = text({ id: 'top' });
    expect(layerAt([bottom, top], 200, 300).id).toBe('top');
  });
});

describe('transforms', () => {
  it('moves by a delta', () => {
    expect(moveLayer(text(), 10, -5)).toMatchObject({ x: 210, y: 295 });
  });

  it('resizes from a handle and pins the opposite edge', () => {
    const layer = text();
    const before = boundsOf(layer);

    // Drag the east handle 20px right: width grows 20, the left edge holds.
    const resized = resizeLayer(layer, { fx: 1, fy: 0 }, 20, 0);

    expect(resized.width).toBe(120);
    expect(boundsOf(resized).left).toBeCloseTo(before.left, 5);
  });

  it('refuses to resize below the minimum', () => {
    const resized = resizeLayer(text(), { fx: 1, fy: 0 }, -500, 0);
    expect(resized.width).toBeGreaterThan(0);
  });

  it('places eight handles around the box', () => {
    const handles = handlePositions(text());
    expect(handles).toHaveLength(8);
    expect(handles.find((h) => h.id === 'e')).toMatchObject({ x: 250, y: 300 });
  });
});

describe('stack order', () => {
  const stack = () => [text({ id: 'a' }), text({ id: 'b' }), text({ id: 'c' })];
  const ids = (layers) => layers.map((l) => l.id).join('');

  it('moves a layer up and down', () => {
    expect(ids(reorder(stack(), 'a', 'up'))).toBe('bac');
    expect(ids(reorder(stack(), 'c', 'down'))).toBe('acb');
  });

  it('moves a layer to front and back', () => {
    expect(ids(reorder(stack(), 'a', 'front'))).toBe('bca');
    expect(ids(reorder(stack(), 'c', 'back'))).toBe('cab');
  });

  it('leaves the stack alone at the ends', () => {
    expect(ids(reorder(stack(), 'a', 'down'))).toBe('abc');
    expect(ids(reorder(stack(), 'c', 'up'))).toBe('abc');
  });

  it('gives a duplicate a new id and an offset', () => {
    const source = text({ id: 'a' });
    const copy = duplicateLayer(source);

    expect(copy.id).not.toBe(source.id);
    expect(copy.x).toBe(source.x + 16);
  });
});

describe('alignment', () => {
  it('aligns to each artboard edge', () => {
    const layer = text();
    expect(alignLayer(layer, 'left', artboard).x).toBe(50);
    expect(alignLayer(layer, 'center', artboard).x).toBe(200);
    expect(alignLayer(layer, 'right', artboard).x).toBe(350);
    expect(alignLayer(layer, 'top', artboard).y).toBe(20);
    expect(alignLayer(layer, 'bottom', artboard).y).toBe(580);
  });
});

describe('snapping', () => {
  it('snaps to the artboard centre and reports the guide', () => {
    const layer = text({ x: 203, y: 300 });
    const snapped = snapPosition(layer, [], artboard);

    expect(snapped.x).toBe(200);
    expect(snapped.guides).toContainEqual({ axis: 'v', at: 200 });
  });

  it('leaves a layer alone when nothing is near', () => {
    const layer = text({ x: 120, y: 120 });
    expect(snapPosition(layer, [], artboard).x).toBe(120);
  });

  it('snaps to a sibling layer', () => {
    const sibling = text({ id: 'sib', x: 90, y: 400 });
    const layer = text({ id: 'me', x: 93, y: 120 });

    expect(snapPosition(layer, [sibling], artboard).x).toBe(90);
  });
});

describe('applyTemplate', () => {
  const templateA = {
    layers: [
      { type: 'text', slotRole: 'title', text: 'A title', x: 100, y: 50 },
      { type: 'shape', shape: 'rect', x: 100, y: 200 },
    ],
  };

  const templateB = {
    layers: [
      { type: 'text', slotRole: 'title', text: 'B title', x: 120, y: 60 },
      { type: 'shape', shape: 'ellipse', x: 100, y: 250 },
    ],
  };

  it('carries the shopper typed content across by slot role', () => {
    const seeded = applyTemplate(templateA, []);
    const typed = seeded.map((l) =>
      l.slotRole === 'title' ? { ...l, text: 'For Maya' } : l
    );

    const swapped = applyTemplate(templateB, typed);
    expect(swapped.find((l) => l.slotRole === 'title').text).toBe('For Maya');
  });

  it('keeps layers the shopper added themselves', () => {
    const seeded = applyTemplate(templateA, []);
    const withOwn = [...seeded, createLayer('art', { id: 'mine', art: 'star' })];

    const swapped = applyTemplate(templateB, withOwn);
    expect(swapped.some((l) => l.id === 'mine')).toBe(true);
  });

  /**
   * The regression this guards: filtering "what the shopper added" by the
   * absence of a slotRole treated a template's own rules and bands as
   * user-added, so every swap stacked the previous template's decorations on
   * top of the new one and the layer count climbed without bound.
   */
  it('does not accumulate decorations across repeated swaps', () => {
    let layers = applyTemplate(templateA, []);
    const seededCount = layers.length;

    layers = applyTemplate(templateB, layers);
    layers = applyTemplate(templateA, layers);
    layers = applyTemplate(templateB, layers);

    expect(layers).toHaveLength(seededCount);
  });

  it('marks seeded layers with their provenance', () => {
    expect(applyTemplate(templateA, []).every((l) => l.fromTemplate)).toBe(true);
  });
});
