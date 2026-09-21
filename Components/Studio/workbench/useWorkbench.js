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
 */
export const useWorkbench = ({ artboard, initialLayers = [] }) => {
  const history = useDesignHistory(initialLayers, { limit: 80 });
  const layers = history.present;

  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoomState] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const artboardRef = useRef(artboard);
  artboardRef.current = artboard;

  useUndoRedoShortcuts({ undo: history.undo, redo: history.redo });

  const selection = useMemo(
    () => layers.find((l) => l.id === selectedId) ?? null,
    [layers, selectedId]
  );

  /* ------------------------------------------------------------ layers -- */

  const setLayers = history.update;

  const updateLayer = useCallback(
    (id, patch, { commit = true } = {}) => {
      history.update(
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
    [history]
  );

  const addLayer = useCallback(
    (type, overrides = {}) => {
      const board = artboardRef.current;
      const layer = createLayer(type, {
        x: board.width / 2,
        y: board.height / 2,
        ...overrides,
      });

      history.update((current) => [...current, layer]);
      setSelectedId(layer.id);
      setTool('select');
      return layer;
    },
    [history]
  );

  const removeLayer = useCallback(
    (id) => {
      history.update((current) => current.filter((l) => l.id !== id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [history]
  );

  const duplicate = useCallback(
    (id) => {
      const source = layers.find((l) => l.id === id);
      if (!source) return null;

      const copy = duplicateLayer(source);
      history.update((current) => [...current, copy]);
      setSelectedId(copy.id);
      return copy;
    },
    [history, layers]
  );

  const reorderLayer = useCallback(
    (id, direction) =>
      history.update((current) => reorder(current, id, direction)),
    [history]
  );

  const align = useCallback(
    (edge) => {
      if (!selectedId) return;
      const board = artboardRef.current;
      history.update((current) =>
        current.map((layer) =>
          layer.id === selectedId ? alignLayer(layer, edge, board) : layer
        )
      );
    },
    [history, selectedId]
  );

  const resetLayers = useCallback(
    (next) => {
      history.reset(next);
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
    // layers
    layers,
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
