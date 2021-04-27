export const initialState = {
	inventory: [],
	cart: [],
	totalItems: 0,
	totalAmount: 0
};

export const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_CART':
			return { ...state, ...action.payload };
		case 'ADD_ITEM':
			return { ...state, ...action.payload };
		case 'UPDATE_QUANTITY':
			return { ...state, ...action.payload };
		case 'REMOVE_ITEM':
			return { ...state, ...action.payload };
		default:
			throw new Error(`No recognized action was run... ${ action.type }`);
	}
};