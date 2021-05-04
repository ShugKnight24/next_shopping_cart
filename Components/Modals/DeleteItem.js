import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { getCurrentItem } from '../../utils/getItem';

export function DeleteItem({ itemid }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const currentItem = getCurrentItem(inventory, itemid);
	const { setShowModal, setModalType } = useContext(ModalContext);

	function closeAndClearModal(){
		setModalType(null);
		setShowModal(false);
	}

	function handleCancel(){
		closeAndClearModal();
	}

	function handleDeleteItem(){
		dispatch({ 
			type: 'REMOVE_ITEM',
			payload: {
				productId: itemid
			}
		})
		closeAndClearModal();
	}

	return(
		<div className="delete-item-modal">
			<h2>Confirm Delete Item</h2>
			<p>You are deleting <span className="bold-text">{ currentItem.productName }</span> from your cart. Would you like to remove this item from your cart?</p>
			<p>Hitting the close button will cancel this action</p>
			<div className="actions add-to-cart-actions">
				<button
					className="cancel"
					onClick={ () => handleCancel() }
				>
					Cancel
				</button>
				<button
					className="delete-item"
					onClick={ () => handleDeleteItem() }
				>
					Delete Item
				</button>
			</div>
		</div>
	)
}