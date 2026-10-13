/**
 * SVG cast and scenery art, ready for the canvas.
 *
 * The workbench paints in immediate mode, so an SVG has to become a decoded
 * image first. Images are cached by the exact art they show; the first paint
 * of a new look returns null (the layer draws a soft placeholder) and
 * `onRasterReady` listeners repaint once it decodes, which takes a frame or
 * two. jsdom never decodes, so tests see the placeholder path.
 */

import { personArt } from './castRig';
import { pieceArt } from './scenePieces';

const MAX_ENTRIES = 400;
const images = new Map();
const arts = new Map();
const listeners = new Set();

export const svgDataUrl = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const remember = (map, key, value) => {
  map.set(key, value);
  if (map.size > MAX_ENTRIES) map.delete(map.keys().next().value);
  return value;
};

/** Tell listeners once per frame, however many images decoded in it. */
let queued = 0;
const broadcast = () => {
  if (queued) return;
  const run = () => {
    queued = 0;
    listeners.forEach((fn) => fn());
  };
  queued =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(run)
      : setTimeout(run, 16);
};

/** A decoded image for some SVG, or null while it is still decoding. */
export const imageForSvg = (key, svg) => {
  let entry = images.get(key);
  if (!entry) {
    if (typeof Image === 'undefined') return null;
    const img = new Image();
    entry = { img, ready: false };
    remember(images, key, entry);
    img.onload = () => {
      entry.ready = true;
      broadcast();
    };
    // Forget a failed decode so the next paint asks again.
    img.onerror = () => images.delete(key);
    img.src = svgDataUrl(svg);
  }
  return entry.ready ? entry.img : null;
};

const URL_RETRY_MS = 5000;

/**
 * A decoded photo for an image layer (a product shot, an upload), or null
 * while it loads. Other origins are asked for CORS, so a photo that would
 * taint the canvas fails to load rather than breaking export later.
 */
export const imageForUrl = (src) => {
  if (!src) return null;
  const key = `url:${src}`;
  let entry = images.get(key);
  // A failed photo is tried again after a pause, not on every paint.
  if (entry?.failedAt && Date.now() - entry.failedAt > URL_RETRY_MS) {
    images.delete(key);
    entry = null;
  }
  if (!entry) {
    if (typeof Image === 'undefined') return null;
    const img = new Image();
    entry = { img, ready: false };
    remember(images, key, entry);
    if (!/^(data:|blob:|\/(?!\/))/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => {
      entry.ready = true;
      broadcast();
    };
    img.onerror = () => {
      entry.failedAt = Date.now();
    };
    img.src = src;
  }
  return entry.ready ? entry.img : null;
};

/** Resolve with the decoded image for some SVG (or null if it fails). */
export const decodeSvg = (key, svg) =>
  new Promise((resolve) => {
    const ready = imageForSvg(key, svg);
    if (ready) return resolve(ready);
    const entry = images.get(key);
    if (!entry) return resolve(null);
    entry.img.addEventListener('load', () => resolve(entry.img), {
      once: true,
    });
    entry.img.addEventListener('error', () => resolve(null), { once: true });
    return undefined;
  });

/** Repaint when any pending art finishes decoding. Returns an unsubscribe. */
export const onRasterReady = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/**
 * The person's art for a placement, memoised by everything that shapes it.
 * Paint runs every drag frame, so look up by the member object first and only
 * serialise the person when it is new.
 */
const byMember = new WeakMap();
export const personArtFor = (person, placement) => {
  const pkey = `${placement.pose}|${placement.mood}|${placement.prop}|${placement.side ?? 0}|${placement.propColor ?? ''}`;
  let perMember = byMember.get(person);
  if (!perMember) {
    perMember = new Map();
    byMember.set(person, perMember);
  }
  const hit = perMember.get(pkey);
  if (hit) return hit;
  const key = JSON.stringify([person, placement]);
  const art =
    arts.get(key) ??
    remember(arts, key, { key, ...personArt(person, placement) });
  perMember.set(pkey, art);
  return art;
};

export const pieceArtFor = (id, tint) => {
  const key = `piece:${id}:${tint ?? ''}`;
  return arts.get(key) ?? remember(arts, key, { key, ...pieceArt(id, tint) });
};
