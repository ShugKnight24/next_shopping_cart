import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_LIMIT = 60;

/**
 * Undo/redo for a studio's layer stack.
 *
 * Replaces the copy of this logic that each studio grew independently. Two bugs
 * are fixed here rather than three times over:
 *
 *  - the old `handleUpdateStickers` sliced `history` using the `historyIndex`
 *    captured by its closure while advancing the index functionally, so two
 *    edits in one tick wrote a branch computed from a stale cursor;
 *  - the stack was never trimmed, so a long session held every intermediate
 *    drag frame alive.
 *
 * Both past and future live in one ref-backed reducer step so concurrent edits
 * always read the cursor that is actually current.
 */
export const useDesignHistory = (
  initialLayers = [],
  { limit = DEFAULT_LIMIT } = {}
) => {
  const [state, setState] = useState(() => ({
    entries: [initialLayers],
    index: 0,
  }));

  const commit = useCallback(
    (next) => {
      setState((prev) => {
        const resolved =
          typeof next === 'function' ? next(prev.entries[prev.index]) : next;

        // Previews (drag frames) overwrite the present entry; `pending` keeps
        // what it was before the gesture, so the identity commit at gesture
        // end records the whole gesture as one real step.
        const base = prev.pending;

        // Identical stacks (a drag that ended where it began) should not
        // consume an undo step.
        if (resolved === (base ?? prev.entries[prev.index])) {
          if (!base) return prev;
          const entries = prev.entries.slice();
          entries[prev.index] = base;
          return { ...prev, entries, pending: undefined };
        }

        const truncated = prev.entries.slice(0, prev.index + (base ? 0 : 1));
        if (base) truncated.push(base);
        truncated.push(resolved);

        const overflow = Math.max(0, truncated.length - limit);
        const entries = overflow ? truncated.slice(overflow) : truncated;

        return { entries, index: entries.length - 1, pending: undefined };
      });
    },
    [limit]
  );

  /** In-flight change (drag frames) — updates the present without a new step. */
  const preview = useCallback((next) => {
    setState((prev) => {
      const resolved =
        typeof next === 'function' ? next(prev.entries[prev.index]) : next;
      if (resolved === prev.entries[prev.index]) return prev;

      const entries = prev.entries.slice();
      entries[prev.index] = resolved;
      return {
        ...prev,
        entries,
        pending: prev.pending ?? prev.entries[prev.index],
      };
    });
  }, []);

  /** The shape a canvas editor calls: `(layers, { commit })`. */
  const update = useCallback(
    (next, { commit: shouldCommit = true } = {}) =>
      shouldCommit ? commit(next) : preview(next),
    [commit, preview]
  );

  const undo = useCallback(
    () =>
      setState((prev) => {
        // Uncommitted previews are the newest change: undo them first.
        // Cancelling a gesture that never committed keeps the redo tail.
        if (prev.pending) {
          const entries = prev.entries.slice();
          entries[prev.index] = prev.pending;
          return { entries, index: prev.index, pending: undefined };
        }
        return prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev;
      }),
    []
  );

  const redo = useCallback(
    () =>
      setState((prev) =>
        prev.index < prev.entries.length - 1 && !prev.pending
          ? { ...prev, index: prev.index + 1 }
          : prev
      ),
    []
  );

  /** Discard all history — loading a saved design, or "start over". */
  const reset = useCallback(
    (layers = []) =>
      setState((prev) => ({
        entries: [
          typeof layers === 'function'
            ? layers(prev.entries[prev.index])
            : layers,
        ],
        index: 0,
      })),
    []
  );

  const present = state.entries[state.index];

  return useMemo(
    () => ({
      present,
      update,
      commit,
      preview,
      undo,
      redo,
      reset,
      canUndo: state.index > 0 || Boolean(state.pending),
      canRedo: state.index < state.entries.length - 1 && !state.pending,
      depth: state.entries.length,
    }),
    [
      present,
      update,
      commit,
      preview,
      undo,
      redo,
      reset,
      state.index,
      state.entries.length,
      state.pending,
    ]
  );
};

/**
 * Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z, skipped while a text field has focus so the
 * browser's own text undo still works inside the studio's inputs.
 */
export const useUndoRedoShortcuts = ({ undo, redo, enabled = true }) => {
  const handlers = useRef({ undo, redo });
  handlers.current = { undo, redo };

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      if (key !== 'z' || !(event.metaKey || event.ctrlKey)) return;

      const tag = event.target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        event.target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) handlers.current.redo();
      else handlers.current.undo();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
};
