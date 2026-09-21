/**
 * The layer model shared by every workbench editor.
 *
 * A design is a substrate (the product itself — a hoodie, a poster, a book
 * spread) plus an ordered stack of layers drawn on top of it. Templates seed
 * that stack with styled *slots*; the shopper can restyle a slot, and can add
 * arbitrary layers of their own anywhere on the artboard.
 *
 * Every layer carries the same transform fields so selection, dragging,
 * resizing, rotation, alignment and z-ordering are written once rather than
 * per type. Type-specific fields live alongside and are only read by the
 * painter for that type.
 */

export const LAYER_TYPES = ['text', 'shape', 'art', 'image'];

/** Slots come from a template and carry a role so the inspector can label them
 *  ("Title", "Subtitle") and a template swap can map old content onto new. */
export const SLOT_ROLES = [
  'title',
  'subtitle',
  'body',
  'eyebrow',
  'caption',
  'badge',
  'image',
  'accent',
];

const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const BASE = {
  x: 0,
  y: 0,
  width: 200,
  height: 60,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
};

export const createTextLayer = (overrides = {}) => ({
  ...BASE,
  id: uid('text'),
  type: 'text',
  name: 'Text',
  text: 'Your text here',
  fontFamily: 'display',
  fontSize: 32,
  fontWeight: 700,
  color: '#ffffff',
  align: 'center',
  lineHeight: 1.16,
  letterSpacing: 0,
  textTransform: 'none',
  ...overrides,
});

export const createShapeLayer = (overrides = {}) => ({
  ...BASE,
  id: uid('shape'),
  type: 'shape',
  name: 'Shape',
  shape: 'rect',
  fill: '#f59e0b',
  stroke: null,
  strokeWidth: 0,
  radius: 8,
  ...overrides,
});

/** `art` is one of the hand-drawn vector stamps in `drawStamp`. */
export const createArtLayer = (overrides = {}) => ({
  ...BASE,
  id: uid('art'),
  type: 'art',
  name: 'Artwork',
  art: 'star',
  width: 96,
  height: 96,
  tint: null,
  flipX: false,
  ...overrides,
});

export const createImageLayer = (overrides = {}) => ({
  ...BASE,
  id: uid('image'),
  type: 'image',
  name: 'Image',
  src: null,
  fit: 'cover',
  radius: 0,
  ...overrides,
});

const FACTORIES = {
  text: createTextLayer,
  shape: createShapeLayer,
  art: createArtLayer,
  image: createImageLayer,
};

export const createLayer = (type, overrides) =>
  (FACTORIES[type] ?? createTextLayer)(overrides);

/* ------------------------------------------------------------ geometry -- */

/** Axis-aligned bounds in artboard space, ignoring rotation. */
export const boundsOf = (layer) => ({
  left: layer.x - layer.width / 2,
  top: layer.y - layer.height / 2,
  right: layer.x + layer.width / 2,
  bottom: layer.y + layer.height / 2,
});

/**
 * Point-in-layer, accounting for rotation. Rotate the point into the layer's
 * local frame and test an axis-aligned box there — the same maths the canvas
 * uses to draw it, inverted.
 */
export const hitTest = (layer, px, py) => {
  if (!layer.visible || layer.locked) return false;

  const radians = (-(layer.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const dx = px - layer.x;
  const dy = py - layer.y;

  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return (
    Math.abs(localX) <= layer.width / 2 && Math.abs(localY) <= layer.height / 2
  );
};

/** Topmost layer under a point. The stack paints bottom-up, so search down. */
export const layerAt = (layers, px, py) => {
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    if (hitTest(layers[i], px, py)) return layers[i];
  }
  return null;
};

/** The eight resize handles, in artboard space, for the selection chrome. */
export const HANDLES = [
  { id: 'nw', fx: -1, fy: -1 },
  { id: 'n', fx: 0, fy: -1 },
  { id: 'ne', fx: 1, fy: -1 },
  { id: 'e', fx: 1, fy: 0 },
  { id: 'se', fx: 1, fy: 1 },
  { id: 's', fx: 0, fy: 1 },
  { id: 'sw', fx: -1, fy: 1 },
  { id: 'w', fx: -1, fy: 0 },
];

export const handlePositions = (layer) => {
  const radians = ((layer.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const hw = layer.width / 2;
  const hh = layer.height / 2;

  return HANDLES.map(({ id, fx, fy }) => {
    const lx = fx * hw;
    const ly = fy * hh;
    return {
      id,
      fx,
      fy,
      x: layer.x + lx * cos - ly * sin,
      y: layer.y + lx * sin + ly * cos,
    };
  });
};

/** Rotation grip sits above the top edge, in the layer's own frame. */
export const rotationHandlePosition = (layer, distance = 28) => {
  const radians = ((layer.rotation || 0) * Math.PI) / 180;
  const ly = -(layer.height / 2 + distance);
  return {
    x: layer.x - ly * Math.sin(radians),
    y: layer.y + ly * Math.cos(radians),
  };
};

/* --------------------------------------------------------------- edits -- */

export const MIN_SIZE = 12;

export const resizeLayer = (layer, handle, dx, dy) => {
  // Work in the layer's local frame so a rotated layer resizes along its own
  // axes rather than the screen's.
  const radians = (-(layer.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const localDx = dx * cos - dy * sin;
  const localDy = dx * sin + dy * cos;

  const width = Math.max(MIN_SIZE, layer.width + localDx * handle.fx);
  const height = Math.max(MIN_SIZE, layer.height + localDy * handle.fy);

  // Keep the opposite edge pinned: the centre moves by half the size change.
  const shiftX = (handle.fx * (width - layer.width)) / 2;
  const shiftY = (handle.fy * (height - layer.height)) / 2;

  const worldRadians = ((layer.rotation || 0) * Math.PI) / 180;
  const wc = Math.cos(worldRadians);
  const ws = Math.sin(worldRadians);

  return {
    ...layer,
    width,
    height,
    x: layer.x + shiftX * wc - shiftY * ws,
    y: layer.y + shiftX * ws + shiftY * wc,
  };
};

export const moveLayer = (layer, dx, dy) => ({
  ...layer,
  x: layer.x + dx,
  y: layer.y + dy,
});

export const reorder = (layers, id, direction) => {
  const index = layers.findIndex((l) => l.id === id);
  if (index === -1) return layers;

  const target =
    direction === 'front'
      ? layers.length - 1
      : direction === 'back'
        ? 0
        : index + (direction === 'up' ? 1 : -1);

  if (target < 0 || target >= layers.length || target === index) return layers;

  const next = layers.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
};

export const duplicateLayer = (layer) => ({
  ...layer,
  id: uid(layer.type),
  name: `${layer.name} copy`,
  x: layer.x + 16,
  y: layer.y + 16,
});

/* ------------------------------------------------------------ alignment -- */

export const alignLayer = (layer, edge, artboard) => {
  const half = { x: layer.width / 2, y: layer.height / 2 };

  const positions = {
    left: { x: half.x },
    center: { x: artboard.width / 2 },
    right: { x: artboard.width - half.x },
    top: { y: half.y },
    middle: { y: artboard.height / 2 },
    bottom: { y: artboard.height - half.y },
  };

  return { ...layer, ...positions[edge] };
};

/* --------------------------------------------------------------- guides -- */

const SNAP_TOLERANCE = 6;

/**
 * Centre and edge guides against the artboard and the other layers, the way a
 * design tool nudges you into alignment. Returns the snapped position plus the
 * guides to draw, so the viewport can show why it moved.
 */
export const snapPosition = (layer, layers, artboard) => {
  const guides = [];
  let { x, y } = layer;

  const verticalTargets = [
    artboard.width / 2,
    0 + layer.width / 2,
    artboard.width - layer.width / 2,
    ...layers.filter((l) => l.id !== layer.id && l.visible).map((l) => l.x),
  ];

  const horizontalTargets = [
    artboard.height / 2,
    0 + layer.height / 2,
    artboard.height - layer.height / 2,
    ...layers.filter((l) => l.id !== layer.id && l.visible).map((l) => l.y),
  ];

  const nearestV = nearest(x, verticalTargets);
  if (nearestV != null) {
    x = nearestV;
    guides.push({ axis: 'v', at: nearestV });
  }

  const nearestH = nearest(y, horizontalTargets);
  if (nearestH != null) {
    y = nearestH;
    guides.push({ axis: 'h', at: nearestH });
  }

  return { x, y, guides };
};

const nearest = (value, targets) => {
  let best = null;
  let bestDistance = SNAP_TOLERANCE;

  targets.forEach((target) => {
    const distance = Math.abs(value - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = target;
    }
  });

  return best;
};

/* ------------------------------------------------------------ templates -- */

/**
 * Apply a template to the current stack.
 *
 * Content the shopper has already typed is carried across by slot role, so
 * browsing templates does not destroy their words — the single most annoying
 * behaviour a template picker can have. Layers they added themselves are kept.
 */
export const applyTemplate = (template, currentLayers = []) => {
  const byRole = new Map();
  currentLayers
    .filter((l) => l.slotRole && l.type === 'text' && l.text)
    .forEach((l) => {
      if (!byRole.has(l.slotRole)) byRole.set(l.slotRole, l.text);
    });

  const seeded = template.layers.map((spec) => {
    const layer = createLayer(spec.type, {
      ...spec,
      id: uid(spec.type),
      // Mark provenance rather than inferring it. Filtering on `slotRole`
      // instead would treat a template's own rules, bands and stamps as
      // user-added, so browsing template A then B would keep A's decorations
      // forever and the stack would grow on every swap.
      fromTemplate: true,
    });

    const carried = layer.slotRole ? byRole.get(layer.slotRole) : null;
    return carried && layer.type === 'text'
      ? { ...layer, text: carried }
      : layer;
  });

  const freeLayers = currentLayers.filter((l) => !l.fromTemplate);

  return [...seeded, ...freeLayers];
};

export const describeLayer = (layer) => {
  if (layer.type === 'text') return layer.text?.slice(0, 28) || 'Empty text';
  if (layer.type === 'art') return layer.art;
  if (layer.type === 'shape') return layer.shape;
  if (layer.type === 'image') return layer.src ? 'Image' : 'Empty image';
  return layer.type;
};
