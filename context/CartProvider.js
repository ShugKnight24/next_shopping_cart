import { createContext, useReducer } from 'react';
import { initialState, reducer } from '../store/CartReducer';

export const CartContext = createContext();

export function CartProvider({ children }){
	const [state, dispatch] = useReducer(reducer, initialState);
	
	return(
		<CartContext.Provider value={{ state, dispatch }}>
			{ children }
		</CartContext.Provider>
	);
}