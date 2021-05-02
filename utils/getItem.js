export function getCurrentItem(targetArray, productID){
	return targetArray.find(({ itemid }) => itemid === productID);
}