/**
 * localStorage-backed shelf of saved designs, plus a per-mode autosaved draft.
 *
 * Exposed as an external store rather than component state so every studio,
 * and the "My Designs" shelf on the studio landing page, see the same list
 * without prop-drilling or a provider. `getServerSnapshot` returns the frozen
 * empty list, which keeps SSR markup identical to the first client paint.
 */

import { migrateDesignDoc } from './designDoc';

const DESIGNS_KEY = 'shopping_cart.studio.designs';
const DRAFT_KEY = (mode) => `shopping_cart.studio.draft.${mode}`;

/** Keep the shelf bounded — localStorage quota is ~5MB and docs are not tiny. */
const MAX_SAVED = 24;

const EMPTY = Object.freeze([]);

let cache = null;
const listeners = new Set();

const readStorage = () => {
  try {
    const raw = window.localStorage.getItem(DESIGNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private mode, disabled storage, or corrupt JSON. A studio that cannot
    // save is still a studio that must open.
    return [];
  }
};

const writeStorage = (next) => {
  cache = next;
  try {
    window.localStorage.setItem(DESIGNS_KEY, JSON.stringify(next));
  } catch {
    /* quota exceeded — the in-memory shelf still works for this session */
  }
  listeners.forEach((fn) => fn());
};

export const subscribeToDesigns = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDesignsSnapshot = () => {
  if (typeof window === 'undefined') return EMPTY;
  if (cache === null) cache = readStorage();
  return cache;
};

export const getDesignsServerSnapshot = () => EMPTY;

export const saveDesign = ({ name, doc, thumbnail, mode, summary }) => {
  const entry = {
    id: `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name?.trim() || 'Untitled design',
    mode: mode ?? doc?.mode,
    doc,
    thumbnail,
    summary,
    savedAt: Date.now(),
  };

  writeStorage([entry, ...getDesignsSnapshot()].slice(0, MAX_SAVED));
  return entry;
};

export const renameDesign = (id, name) =>
  writeStorage(
    getDesignsSnapshot().map((d) =>
      d.id === id ? { ...d, name: name.trim() || d.name } : d
    )
  );

export const deleteDesign = (id) =>
  writeStorage(getDesignsSnapshot().filter((d) => d.id !== id));

export const getDesign = (id) =>
  getDesignsSnapshot().find((d) => d.id === id) ?? null;

/* ---------------------------------------------------------------- drafts -- */

/**
 * Work-in-progress autosave. Separate from the shelf: a draft is implicit and
 * per-mode, overwritten as the shopper works, so refreshing mid-design or
 * following a link away and back does not lose the piece.
 */
export const writeDraft = (mode, doc) => {
  try {
    window.localStorage.setItem(
      DRAFT_KEY(mode),
      JSON.stringify({ doc, at: Date.now() })
    );
  } catch {
    /* non-fatal */
  }
};

export const readDraft = (mode) => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY(mode));
    if (!raw) return null;

    const { doc, at } = JSON.parse(raw);
    const migrated = migrateDesignDoc(doc);
    return migrated ? { doc: migrated, at } : null;
  } catch {
    return null;
  }
};

export const clearDraft = (mode) => {
  try {
    window.localStorage.removeItem(DRAFT_KEY(mode));
  } catch {
    /* non-fatal */
  }
};

/** Test seam — resets module memo so suites do not leak state between cases. */
export const __resetDesignStoreCache = () => {
  cache = null;
};
