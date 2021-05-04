import productList from '../data/items.json';
import { getCurrentItem } from '../utils/getItem';

const initialInventory = JSON.parse(JSON.stringify(productList));
export const initialState = {
	inventory: [...productList],
	cart: [],
};

function findCurrentKey(targetArray, desiredValue){
	for(let i = 0; i < targetArray.length; i++){
		for (var key in targetArray[i]){
			if(targetArray[i][key] === desiredValue){
				return targetArray[i];
			}
		}
	}
}

export const reducer = (state, action) => {
	const { inventory, cart } = state;
	let productId;
	let currentItem;
	switch (action.type) {
		case 'SET_CART':
			state = action.payload;
			return { ...state };
		case 'ADD_ITEM':
			productId = action.payload.productId;
			currentItem = getCurrentItem(inventory, productId);
			// TODO: // Error logging / alert
			if (currentItem.available === 0) return { ...state }
			
			const cartItem = getCurrentItem(cart, productId);
			if (cartItem){
				cartItem.quantity += 1;
			} else {
				state.cart = ([
					...cart,
					{
						...currentItem,
						quantity: 1
					}
				]);
			}
			currentItem.available -= 1;
			return { ...state };
		case 'UPDATE_QUANTITY':
			productId = action.payload.productId;
			let quantity = parseFloat(action.payload.quantity);
			currentItem = getCurrentItem(cart, productId);
			currentItem.quantity = quantity;
			return { ...state };
		case 'REMOVE_ITEM':
			productId = action.payload.productId;
			const currentCartItemIndex = findCurrentKey(cart, productId);
			currentItem = getCurrentItem(inventory, productId);
			currentItem.available += 1;
			cart.splice(currentCartItemIndex, 1);
			return { ...state };
		case 'EMPTY_CART':
			state.cart = [];
			state.inventory = [...JSON.parse(JSON.stringify(initialInventory))];
			return { ...state };
		default:
			throw new Error(`No recognized action was run... ${ action.type }`);
	}
};