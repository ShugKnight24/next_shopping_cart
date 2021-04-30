import { createContext, useEffect, useReducer, useState } from 'react';
import { initialState, reducer } from '../store/CartReducer';

export const CartContext = createContext();

export function CartProvider({ children }){
	const [isInitialized, setIsInitialized] = useState(false);
	const [state, dispatch] = useReducer(reducer, initialState);
	const LOCAL_STORAGE_CART_KEY = 'shopping_cart.cart';
	
	function save(){
		localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(state));
	}
	
	useEffect(() => {
		if (isInitialized) save();
	}, [state]);
	
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