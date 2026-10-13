import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useToast } from '../Components/UI/Toast';
import { initialState, reducer } from '../store/CartReducer';

const isQuotaError = (error) =>
  error?.name === 'QuotaExceededError' ||
  error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
  error?.code === 22;

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const LOCAL_STORAGE_CART_KEY = 'shopping_cart.cart';
  // useToast hands back a new showToast each render; a ref keeps it out of
  // save's dependencies so the bag is only written when it changes.
  const toast = useRef(null);
  toast.current = useToast().showToast;
  const warnedFull = useRef(false);

  const save = useCallback(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_CART_KEY,
        JSON.stringify({
          cart: state.cart,
          promo: state.promo,
          favorites: (state.inventory || [])
            .filter((item) => item.favorite)
            .map((item) => item.itemid),
        })
      );
      warnedFull.current = false;
    } catch (error) {
      // Studio designs carry their artwork, so a few of them can fill the
      // browser's storage. Say so once, rather than lose the bag on reload.
      if (isQuotaError(error) && !warnedFull.current) {
        warnedFull.current = true;
        toast.current(
          'Your bag is too large to save on this device. Check out or remove a design before you leave this page.',
          'warning',
          { duration: 8000 }
        );
      }
      // Other storage errors (private mode, blocked storage) stay silent.
    }
  }, [state]);

  useEffect(() => {
    if (isInitialized) save();
  }, [isInitialized, save]);

  useEffect(() => {
    try {
      const localCartData = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      const currentData = localCartData
        ? JSON.parse(localCartData)
        : initialState;

      dispatch({
        type: 'SET_CART',
        payload: currentData,
      });
    } catch {
      dispatch({
        type: 'SET_CART',
        payload: initialState,
      });
    }
    setIsInitialized(true);
  }, []);

  return (
    <CartContext.Provider
      value={{ state, dispatch, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
