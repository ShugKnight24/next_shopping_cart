import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';

export function ClearCart(){
	const { dispatch } = useContext(CartContext);
	const { setShowModal, setModalType } = useContext(ModalContext);

	function closeAndClearModal(){
		setModalType(null);
		setShowModal(false);
	}

	function handleCancel(){
		closeAndClearModal();
	}

	function handleClearCart(){
		dispatch({ 
			type: 'EMPTY_CART'
		});
		closeAndClearModal();
	}

	return(
		<div className="clear-cart-modal">
			<h2>Confirm Clear Cart</h2>
			<p>Are you sure you want to clear your cart? This is not reversible</p>
			<p>Hitting the close button will cancel this action</p>
			<div className="actions clear-cart-actions">
				<button
					className="cancel"
					onClick={ () => handleCancel() }
				>
					Cancel
				</button>
				<button
					className="clear-cart"
					onClick={ () => handleClearCart() }
				>
					Clear Cart
				</button>
			</div>
		</div>
	)
}