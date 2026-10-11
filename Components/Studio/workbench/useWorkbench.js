import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useDesignHistory,
  useUndoRedoShortcuts,
} from '../core/useDesignHistory';
import { alignLayer, createLayer, duplicateLayer, reorder } from './layerModel';

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 8;
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

/**
 * Editor state for one workbench: the layer stack and its history, the current
 * selection, the active tool, and the viewport transform.
 *
 * Substrate options (garment, paper, frame, scene…) stay with the route — they
 * are product-specific and the workbench has no opinion about them.
 *
 * Each history entry is `{ layers, doc }`. `doc` holds the options that must
 * undo *with* the layers — a book's cast and pages — so undoing "delete page"
 * brings back the page and its art together. Routes opt keys in through
 * `initialDoc`.
 *
 * `scope` (or `pageScope(doc)`) pages the stack: `{ id, fallback }` shows and
 * edits only the layers whose `page` is `id` (a layer with no page belongs to
 * `fallback`), while one history covers every page. New layers are stamped
 * with the current page. Without a scope, every layer is in view.
 */
const sameList = (a, b) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

export const useWorkbench = ({
  artboard,
  initialLayers = [],
  initialDoc = null,
  scope: scopeProp = null,
  pageScope = null,
}) => {
  const history = useDesignHistory(
    { layers: initialLayers, doc: initialDoc ?? {} },
    { limit: 80 }
  );
  const allLayers = history.present.layers;
  const doc = history.present.doc;

  const scope = pageScope ? pageScope(doc) : scopeProp;
  const scopeId = scope?.id ?? null;
  const fallback = scope?.fallback ?? null;
  const inScope = useCallback(
    (layer) => scopeId == null || (layer.page ?? fallback) === scopeId,
    [scopeId, fallback]
  );

  const layers = useMemo(() => allLayers.filter(inScope), [allLayers, inScope]);

  /** Apply `next` to the current page's layers; other pages pass through. */
  const applyScoped = useCallback(
    (current, next) => {
      if (scopeId == null)
        return typeof next === 'function' ? next(current) : next;
      const mine = current.filter(inScope);
      const value = typeof next === 'function' ? next(mine) : next;
      // A no-op must stay a no-op, or it costs an undo step.
      if (sameList(mine, value)) return current;
      const rest = current.filter((l) => !inScope(l));
      return [
        ...rest,
        ...value.map((l) => (l.page === scopeId ? l : { ...l, page: scopeId })),
      ];
    },
    [inScope, scopeId]
  );

  const update = useCallback(
    (next, options) =>
      history.update((entry) => {
        const nextLayers = applyScoped(entry.layers, next);
        return nextLayers === entry.layers
          ? entry
          : { ...entry, layers: nextLayers };
      }, options),
    [history, applyScoped]
  );

  /** Every page's layers, unscoped. */
  const setAllLayers = useCallback(
    (next, options) =>
      history.update((entry) => {
        const nextLayers =
          typeof next === 'function' ? next(entry.layers) : next;
        return nextLayers === entry.layers
          ? entry
          : { ...entry, layers: nextLayers };
      }, options),
    [history]
  );

  /** Patch the undoable document options. `commit: false` folds into the current step. */
  const setDoc = useCallback(
    (patch, options) =>
      history.update((entry) => {
        const value = typeof patch === 'function' ? patch(entry.doc) : patch;
        const changed = Object.keys(value).some(
          (key) => value[key] !== entry.doc[key]
        );
        return changed ? { ...entry, doc: { ...entry.doc, ...value } } : entry;
      }, options),
    [history]
  );

  /** One undo step for a change to both: `fn({ layers, doc }) => { layers?, doc? }`. */
  const transact = useCallback(
    (fn, options) =>
      history.update((entry) => {
        const out = fn(entry) ?? {};
        return {
          layers: out.layers ?? entry.layers,
          doc: out.doc ? { ...entry.doc, ...out.doc } : entry.doc,
        };
      }, options),
    [history]
  );

  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoomState] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // The artboard may follow the document (a format or orientation that
  // undoes with the layers it reframed).
  const computed = typeof artboard === 'function' ? artboard(doc) : artboard;
  // Same size, same object: everything keyed on the artboard stays put.
  const lastBoard = useRef(computed);
  if (
    lastBoard.current.width !== computed.width ||
    lastBoard.current.height !== computed.height
  )
    lastBoard.current = computed;
  const board = lastBoard.current;
  const artboardRef = useRef(board);
  artboardRef.current = board;

  useUndoRedoShortcuts({ undo: history.undo, redo: history.redo });

  const selection = useMemo(
    () => layers.find((l) => l.id === selectedId) ?? null,
    [layers, selectedId]
  );

  /* ------------------------------------------------------------ layers -- */

  const setLayers = update;

  const updateLayer = useCallback(
    (id, patch, { commit = true } = {}) => {
      update(
        (current) =>
          current.map((layer) =>
            layer.id === id
              ? {
                  ...layer,
                  ...(typeof patch === 'function' ? patch(layer) : patch),
                }
              : layer
          ),
        { commit }
      );
    },
    [update]
  );

  const addLayer = useCallback(
    (type, overrides = {}) => {
      const board = artboardRef.current;
      const layer = createLayer(type, {
        x: board.width / 2,
        y: board.height / 2,
        ...overrides,
      });

      update((current) => [...current, layer]);
      setSelectedId(layer.id);
      setTool('select');
      return layer;
    },
    [update]
  );

  const removeLayer = useCallback(
    (id) => {
      update((current) => current.filter((l) => l.id !== id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [update]
  );

  const duplicate = useCallback(
    (id) => {
      const source = layers.find((l) => l.id === id);
      if (!source) return null;

      const copy = duplicateLayer(source);
      update((current) => [...current, copy]);
      setSelectedId(copy.id);
      return copy;
    },
    [update, layers]
  );

  const reorderLayer = useCallback(
    (id, direction) => update((current) => reorder(current, id, direction)),
    [update]
  );

  const align = useCallback(
    (edge) => {
      if (!selectedId) return;
      const board = artboardRef.current;
      update((current) =>
        current.map((layer) =>
          layer.id === selectedId ? alignLayer(layer, edge, board) : layer
        )
      );
    },
    [update, selectedId]
  );

  const resetLayers = useCallback(
    (next, nextDoc) => {
      // Functional, so a document patch queued in the same tick survives.
      history.reset((entry) => ({ layers: next, doc: nextDoc ?? entry.doc }));
      setSelectedId(null);
    },
    [history]
  );

  /* ---------------------------------------------------------- viewport -- */

  const setZoom = useCallback((next) => {
    setZoomState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    });
  }, []);

  const zoomIn = useCallback(
    () =>
      setZoom(
        (current) => ZOOM_STEPS.find((s) => s > current + 0.001) ?? ZOOM_MAX
      ),
    [setZoom]
  );

  const zoomOut = useCallback(
    () =>
      setZoom(
        (current) =>
          [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001) ?? ZOOM_MIN
      ),
    [setZoom]
  );

  /** Fit the artboard inside a viewport box, with breathing room. */
  const fit = useCallback((viewport) => {
    if (!viewport?.width || !viewport?.height) return;

    const board = artboardRef.current;
    const padding = 72;
    const scale = Math.min(
      (viewport.width - padding) / board.width,
      (viewport.height - padding) / board.height
    );

    setZoomState(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale)));
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomToActual = useCallback(() => {
    setZoomState(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    artboard: board,

    // layers
    layers,
    allLayers,
    setAllLayers,
    doc,
    setDoc,
    transact,
    setLayers,
    addLayer,
    updateLayer,
    removeLayer,
    duplicate,
    reorder: reorderLayer,
    align,
    resetLayers,

    // selection
    selection,
    selectedId,
    select: setSelectedId,

    // history
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,

    // tool
    tool,
    setTool,

    // viewport
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    fit,
    zoomToActual,
    pan,
    setPan,
  };
};
