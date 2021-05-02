export function formatCurrency(num){
	const number = parseFloat(num)
	return '$' + number?.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

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
