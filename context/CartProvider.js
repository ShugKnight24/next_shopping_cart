import { createContext, useCallback, useEffect, useReducer, useState } from 'react';
import { initialState, reducer } from '../store/CartReducer';
import PropTypes from 'prop-types';

export const CartContext = createContext();

export function CartProvider({ children }){
	const [isInitialized, setIsInitialized] = useState(false);
	const [state, dispatch] = useReducer(reducer, initialState);
	const LOCAL_STORAGE_CART_KEY = 'shopping_cart.cart';
	
	const save = useCallback(() => {
		localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(state));
	}, [state]);
	
	useEffect(() => {
		if (isInitialized) save();
	}, [isInitialized, save]);
	
	useEffect(() => {
		const localCartData = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
		const currentData = localCartData ? JSON.parse(localCartData) : initialState;

		dispatch({
			type: 'SET_CART',
			payload: currentData
		})
		setIsInitialized(true);
	}, []);

	return(
		<CartContext.Provider value={{ state, dispatch }}>
			{ children }
		</CartContext.Provider>
	);
}

CartProvider.propTypes = {
	children: PropTypes.element.isRequired
};