// add money conversion util

export function totalPrice(array){
	return array.reduce((total, { price, quantity }) => {
		return total + (price * quantity);
	}, 0);
}
export function totalQuantity(array){
	return array.reduce((total, { quantity }) => {
		return total + quantity;
	}, 0);
}
