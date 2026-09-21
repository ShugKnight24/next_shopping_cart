/**
 * Encode a design document into a URL-safe string and back, so a shopper can
 * share a work-in-progress with `?d=…` and reopen it anywhere. No backend.
 *
 * Coordinates are rounded and the payload is key-shortened before encoding —
 * a sticker-heavy poster is otherwise several KB, and browsers start dropping
 * URLs past ~2000 characters.
 */

import { migrateDesignDoc } from './designDoc';

/** Long key -> short key. Only shrink keys that appear once per layer. */
const LAYER_KEYS = {
  id: 'i',
  type: 't',
  x: 'x',
  y: 'y',
  scale: 's',
  rotation: 'r',
  flipX: 'f',
  text: 'c',
};

const LAYER_KEYS_INVERSE = Object.fromEntries(
  Object.entries(LAYER_KEYS).map(([long, short]) => [short, long])
);

const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);

const packLayer = (layer) =>
  Object.entries(layer).reduce((acc, [key, value]) => {
    // Only absent values are dropped. `false` is a real choice — dropping it
    // silently un-hid every hidden layer that round-tripped through a link.
    if (value == null) return acc;
    acc[LAYER_KEYS[key] ?? key] = round(value);
    return acc;
  }, {});

const unpackLayer = (packed) =>
  Object.entries(packed).reduce((acc, [key, value]) => {
    acc[LAYER_KEYS_INVERSE[key] ?? key] = value;
    return acc;
  }, {});

/** base64url over UTF-8, so emoji and smart quotes in text layers survive. */
const toBase64Url = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const fromBase64Url = (str) => {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const encodeDesign = (doc) => {
  if (!doc) return '';
  try {
    return toBase64Url(
      JSON.stringify({
        v: doc.v,
        m: doc.mode,
        o: doc.options,
        l: (doc.layers ?? []).map(packLayer),
        // `meta` carries the preview handoff: a template id plus the slot text
        // the visitor typed, so the designer can rebuild the stack instead of
        // the link having to carry every seeded layer.
        ...(doc.meta?.template ? { tpl: doc.meta.template } : {}),
        ...(doc.meta?.slots && Object.keys(doc.meta.slots).length
          ? { s: doc.meta.slots }
          : {}),
      })
    );
  } catch {
    return '';
  }
};

export const decodeDesign = (encoded) => {
  if (!encoded) return null;
  try {
    const raw = JSON.parse(fromBase64Url(encoded));
    return migrateDesignDoc({
      v: raw.v,
      mode: raw.m,
      options: raw.o,
      layers: (raw.l ?? []).map(unpackLayer),
      meta: { template: raw.tpl ?? null, slots: raw.s ?? null },
    });
  } catch {
    return null;
  }
};

/** Browsers truncate very long URLs; tell the caller before it copies one. */
export const SHARE_URL_SAFE_LIMIT = 1800;

export const buildShareUrl = (doc, origin, pathname) => {
  const encoded = encodeDesign(doc);
  if (!encoded) return null;

  const url = `${origin}${pathname}?d=${encoded}`;
  return { url, encoded, isTooLong: url.length > SHARE_URL_SAFE_LIMIT };
};
