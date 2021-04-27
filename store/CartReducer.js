export const initialState = {
	inventory: [...productList],
	cart: [],
	totalItems: 0,
	totalPrice: 0
};

export const reducer = (state, action) => {
	const { inventory, cart } = state;
	const { productId } = action.payload;
	switch (action.type) {
		case 'SET_CART':
			return { ...state, ...action.payload };
		case 'ADD_ITEM':
			const currentItem = inventory.find((product) => product.itemid === productId);
			// TODO: // Error logging / alert
			if (currentItem.available === 0) return { ...state }
			
			const cartItem = cart.find((product) => product.itemid === productId);
			if (cartItem){
				cartItem.quantity += 1;
				state.totalItems += 1;
				state.totalPrice += currentItem.price;
			} else {
				state.cart = ([
					...cart,
					{
						...currentItem,
						quantity: 1
					}
				]);
				state.totalItems += 1;
				state.totalPrice += currentItem.price;
			}
			currentItem.available -= 1;
		case 'UPDATE_QUANTITY':
			return { ...state, ...action.payload };
		case 'REMOVE_ITEM':
			return { ...state, ...action.payload };
		default:
			throw new Error(`No recognized action was run... ${ action.type }`);
	}
};