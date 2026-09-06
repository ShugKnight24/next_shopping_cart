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

  const currentRealm = router.pathname.startsWith('/studio') ? 'kids' : 'shop';

  const availableMascots = useMemo(
    () => Object.values(MASCOTS).filter((m) => m.realm === currentRealm),
    [currentRealm]
  );

  // Auto-switch mascot realm when switching between shop and kids platform
  useEffect(() => {
    if (!isInitialized) return;

    const currentMascot = MASCOTS[activeMascotId];
    if (currentRealm === 'kids' && (!currentMascot || currentMascot.realm !== 'kids')) {
      const savedKids = localStorage.getItem('shopping_cart.mascot_active_kids');
      setActiveMascotId(savedKids && MASCOTS[savedKids] ? savedKids : 'leo');
    } else if (currentRealm === 'shop' && (!currentMascot || currentMascot.realm !== 'shop')) {
      const savedShop = localStorage.getItem('shopping_cart.mascot_active_shop');
      setActiveMascotId(savedShop && MASCOTS[savedShop] ? savedShop : 'carty');
    }
  }, [currentRealm, isInitialized, activeMascotId]);

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
    const target = MASCOTS[mascotId];
    if (!target) return;
    setActiveMascotId(mascotId);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, mascotId);
      if (target.realm === 'kids') {
        localStorage.setItem('shopping_cart.mascot_active_kids', mascotId);
      } else {
        localStorage.setItem('shopping_cart.mascot_active_shop', mascotId);
      }
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
      availableMascots,
      currentRealm,
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
      availableMascots,
      currentRealm,
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
