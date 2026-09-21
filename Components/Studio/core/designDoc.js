/**
 * The canonical, serializable description of one customized product.
 *
 * Every studio (character, apparel, poster, storybook, social) produces one of
 * these. It is the single thing that gets autosaved, shared by URL, stored on
 * the cart line, and replayed to reopen an editor. Anything not in here is lost
 * when the shopper leaves the page, so options belong in `options` — never in
 * component state alone.
 */

export const DESIGN_SCHEMA_VERSION = 2;

/** Studios that can round-trip a design document. */
export const DESIGN_MODES = ['storybook', 'poster', 'apparel', 'social'];

export const createDesignDoc = ({
  mode,
  options = {},
  layers = [],
  meta = {},
}) => ({
  v: DESIGN_SCHEMA_VERSION,
  mode,
  options,
  layers,
  meta: { createdAt: Date.now(), updatedAt: Date.now(), ...meta },
});

/**
 * Accept a doc from localStorage or a share link, which may have been written
 * by an older build. Unknown/absent fields fall back rather than throw — a
 * shopper returning with a stale link should get a usable editor, not a crash.
 */
export const migrateDesignDoc = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  if (!DESIGN_MODES.includes(raw.mode)) return null;

  const layers = Array.isArray(raw.layers) ? raw.layers : [];

  return {
    v: DESIGN_SCHEMA_VERSION,
    mode: raw.mode,
    options: raw.options && typeof raw.options === 'object' ? raw.options : {},
    // v1 stored bare sticker arrays without ids; backfill so React keys and
    // layer selection stay stable.
    layers: layers.map((layer, i) => ({
      id: layer?.id ?? `layer-${i}-${Math.random().toString(36).slice(2, 8)}`,
      scale: 1,
      rotation: 0,
      ...layer,
    })),
    meta: {
      createdAt: Date.now(),
      ...(raw.meta && typeof raw.meta === 'object' ? raw.meta : {}),
      updatedAt: Date.now(),
    },
  };
};

/**
 * Human-readable order spec shown on the cart line, the checkout summary, and
 * the production sheet. Labels are what the shopper saw in the editor.
 */
export const summarizeDesign = (doc, labelMap = {}) => {
  if (!doc?.options) return {};

  return Object.entries(doc.options).reduce((acc, [key, value]) => {
    const spec = labelMap[key];
    if (!spec || value == null || value === '') return acc;

    const label = typeof spec === 'string' ? spec : spec.label;
    const format = typeof spec === 'string' ? null : spec.format;

    acc[label] = format ? format(value) : String(value);
    return acc;
  }, {});
};

/**
 * Build the cart payload. `image` must be a render of what the shopper actually
 * designed — callers pass the live canvas snapshot, never a stock illustration.
 */
export const designToCartItem = ({
  doc,
  itemid,
  productName,
  manufacturer,
  price,
  image,
  quantity = 1,
  customAttributes = {},
}) => ({
  itemid,
  productName,
  manufacturer,
  price,
  image,
  quantity,
  available: 99,
  favorite: false,
  isCustom: true,
  customMode: doc.mode,
  customAttributes,
  // The full document rides along so the cart line can be reopened in its
  // editor and so production can reproduce the artwork exactly.
  designDoc: doc,
});

/** Stable id per add-to-cart. `Date.now()` alone collides on rapid adds. */
export const createDesignId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
