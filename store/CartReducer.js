import productList from '../data/items.json';
const initialInventory = JSON.parse(JSON.stringify(productList));
export const initialState = {
	inventory: [...productList],
	cart: [],
};

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
			currentItem = inventory.find((product) => product.itemid === productId);
			// TODO: // Error logging / alert
			if (currentItem.available === 0) return { ...state }
			
			const cartItem = cart.find((product) => product.itemid === productId);
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
			currentItem = cart.find(product => product.itemid === productId);
			currentItem.quantity = quantity;
			return { ...state };
		case 'REMOVE_ITEM':
			productId = action.payload.productId;
			const currentCartItemIndex = cart.indexOf((product) => product.itemid === productId);
			currentItem = inventory.find((product) => product.itemid === productId);
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