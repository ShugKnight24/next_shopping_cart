import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useReducer, useState } from 'react';
import { initialState, reducer } from '../store/CartReducer';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const LOCAL_STORAGE_CART_KEY = 'shopping_cart.cart';

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
    } catch {
      // ignore storage errors in restricted environments
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