export function actionDispatcher(dispatch, type, itemid = false, needsPayload = false, quantity = null){
	let payload = null;

	if (needsPayload){
		if (needsPayload === 'quantity'){
			payload = {
				productId: itemid,
				quantity: quantity
			}
		} else {
			payload = {
				productId: itemid,
			}
		}
	}

	console.log('custom hook', payload)

	dispatch({ 
		type,
		payload
	});
}