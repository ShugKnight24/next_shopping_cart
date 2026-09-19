import { useRouter } from 'next/router';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { buildShareUrl, decodeDesign } from './designCodec';
import {
  clearDraft,
  deleteDesign,
  getDesignsServerSnapshot,
  getDesignsSnapshot,
  readDraft,
  renameDesign,
  saveDesign,
  subscribeToDesigns,
  writeDraft,
} from './designStore';

const AUTOSAVE_DEBOUNCE_MS = 900;

/** The saved-design shelf, live across every component that reads it. */
export const useSavedDesigns = (mode) => {
  const all = useSyncExternalStore(
    subscribeToDesigns,
    getDesignsSnapshot,
    getDesignsServerSnapshot
  );

  return mode ? all.filter((d) => d.mode === mode) : all;
};

/**
 * Autosave, restore, share and the named shelf for one studio.
 *
 * `doc` is the live design document. The caller keeps owning its state; this
 * hook only mirrors it to storage and hands back the ways in.
 *
 * Restore is deliberately *offered*, not applied. Silently replacing what is on
 * screen with a draft from three days ago is hostile, and a shopper who opened
 * the studio to start something new should see a blank canvas.
 */
export const useDesignPersistence = ({ mode, doc, enabled = true }) => {
  const router = useRouter();
  const saved = useSavedDesigns(mode);

  const [restorable, setRestorable] = useState(null);
  const [sharedDoc, setSharedDoc] = useState(null);
  const [shareState, setShareState] = useState({ status: 'idle' });

  const timerRef = useRef(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  /* ------------------------------------------------------------ autosave -- */

  useEffect(() => {
    if (!enabled || !doc || typeof window === 'undefined') return undefined;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => writeDraft(mode, doc),
      AUTOSAVE_DEBOUNCE_MS
    );

    // A pending timer must not outlive the studio, and a second edit inside the
    // window must cancel the first rather than race it.
    return () => clearTimeout(timerRef.current);
  }, [enabled, mode, doc]);

  /* ---------------------------------------- one-shot restore + share read -- */

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current || typeof window === 'undefined') return;
    hasCheckedRef.current = true;

    const shareParam = new URLSearchParams(window.location.search).get('d');
    if (shareParam) {
      const decoded = decodeDesign(shareParam);
      if (decoded?.mode === mode) {
        setSharedDoc(decoded);
        return;
      }
    }

    const draft = readDraft(mode);
    if (draft) setRestorable(draft);
  }, [mode]);

  const dismissRestore = useCallback(() => {
    setRestorable(null);
    clearDraft(mode);
  }, [mode]);

  const acknowledgeShared = useCallback(() => setSharedDoc(null), []);

  /* ----------------------------------------------------------- the shelf -- */

  const save = useCallback(
    ({ name, thumbnail, summary }) =>
      saveDesign({ name, doc: docRef.current, thumbnail, summary, mode }),
    [mode]
  );

  /* ----------------------------------------------------------- share URL -- */

  const share = useCallback(async () => {
    if (typeof window === 'undefined') return null;

    const built = buildShareUrl(
      docRef.current,
      window.location.origin,
      router?.pathname ?? window.location.pathname
    );

    if (!built) {
      setShareState({ status: 'error', message: 'Could not build a link.' });
      return null;
    }

    if (built.isTooLong) {
      setShareState({
        status: 'error',
        message:
          'This design is too detailed to fit in a link. Save it to My Designs instead.',
      });
      return null;
    }

    try {
      await navigator.clipboard.writeText(built.url);
      setShareState({ status: 'copied', url: built.url });
    } catch {
      // Clipboard is blocked without a user gesture in some browsers, and
      // absent entirely in jsdom. Hand the URL back so the UI can show it.
      setShareState({ status: 'manual', url: built.url });
    }

    return built.url;
  }, [router?.pathname]);

  const resetShareState = useCallback(
    () => setShareState({ status: 'idle' }),
    []
  );

  return {
    saved,
    save,
    rename: renameDesign,
    remove: deleteDesign,
    restorable,
    dismissRestore,
    sharedDoc,
    acknowledgeShared,
    share,
    shareState,
    resetShareState,
  };
};
