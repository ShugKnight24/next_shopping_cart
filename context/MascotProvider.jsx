import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_MASCOT_ID, MASCOTS } from '../config/mascots';

export const MascotContext = createContext();

const STORAGE_KEY_ENABLED = 'shopping_cart.mascot_enabled';
const STORAGE_KEY_ACTIVE = 'shopping_cart.mascot_active';

export function MascotProvider({ children }) {
  const router = useRouter();

  const [isMascotEnabled, setIsMascotEnabled] = useState(true);
  const [activeMascotId, setActiveMascotId] = useState(DEFAULT_MASCOT_ID);
  const [speech, setSpeech] = useState({
    message: '',
    mood: 'idle',
    isVisible: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (storedEnabled !== null) {
        setIsMascotEnabled(storedEnabled === 'true');
      }

      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (storedActive && MASCOTS[storedActive]) {
        setActiveMascotId(storedActive);
      }
    } catch {
      // ignore storage errors
    }
    setIsInitialized(true);
  }, []);

  const activeMascot = useMemo(
    () => MASCOTS[activeMascotId] || MASCOTS[DEFAULT_MASCOT_ID],
    [activeMascotId]
  );

  const toggleMascot = useCallback(() => {
    setIsMascotEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_ENABLED, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setMascot = useCallback((mascotId) => {
    if (!MASCOTS[mascotId]) return;
    setActiveMascotId(mascotId);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, mascotId);
    } catch {
      // ignore
    }
  }, []);

  const dismissSpeech = useCallback(() => {
    setSpeech((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const speak = useCallback((message, mood = 'idle', durationMs = 0) => {
    setSpeech({
      message,
      mood,
      isVisible: true,
    });

    if (durationMs > 0) {
      setTimeout(() => {
        setSpeech((prev) => ({ ...prev, isVisible: false }));
      }, durationMs);
    }
  }, []);

  // Update speech based on route changes
  useEffect(() => {
    if (!isInitialized) return;

    const path = router.pathname;
    let newQuote = activeMascot.defaultMessage;

    if (path === '/') {
      newQuote = activeMascot.quotes.home || activeMascot.defaultMessage;
    } else if (path.startsWith('/products')) {
      newQuote = activeMascot.quotes.products || activeMascot.defaultMessage;
    } else if (path.startsWith('/favorites')) {
      newQuote = activeMascot.quotes.favorites || activeMascot.defaultMessage;
    } else if (path.startsWith('/studio')) {
      newQuote = activeMascot.quotes.studio || activeMascot.defaultMessage;
    }

    setSpeech({
      message: newQuote,
      mood: 'idle',
      isVisible: true,
    });
  }, [router.pathname, activeMascot, isInitialized]);

  const value = useMemo(
    () => ({
      isMascotEnabled,
      toggleMascot,
      activeMascotId,
      setMascot,
      activeMascot,
      speech,
      speak,
      dismissSpeech,
    }),
    [
      isMascotEnabled,
      toggleMascot,
      activeMascotId,
      setMascot,
      activeMascot,
      speech,
      speak,
      dismissSpeech,
    ]
  );

  return (
    <MascotContext.Provider value={value}>{children}</MascotContext.Provider>
  );
}

MascotProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
}
