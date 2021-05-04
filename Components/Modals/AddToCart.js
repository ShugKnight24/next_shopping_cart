import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { useRouter } from 'next/router';
import { getCurrentItem } from '../../utils/getItem';

export function AddToCart({ itemid }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const currentItem = getCurrentItem(inventory, itemid);
	const { setShowModal, setModalType } = useContext(ModalContext);
	const router = useRouter();

	function closeAndClearModal(){
		setModalType(null);
		setShowModal(false);
	}

	function handleContinueShopping(itemid){
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId: itemid
			}
		});
		closeAndClearModal();
	}

	function handleGoToCart(itemid){
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId: itemid
			}
		});
		closeAndClearModal();
		router.push('/cart');
	}

	return(
		<div className="add-to-cart-modal">
			<h2>Confirm Add To Cart</h2>
			<p>You added <span className="bold-text">{ currentItem.productName }</span> to your cart. Would you like to continue shopping or save and go to cart?</p>
			<p>Hitting the close button will cancel this action</p>
			<div className="actions add-to-cart-actions">
				<button
					className="continue-shopping"
					onClick={ () => handleContinueShopping(itemid) }
				>
					Save & Continue Shopping
				</button>
				<button
					className="add-cart-button go-to-cart"
					onClick={ () => handleGoToCart(itemid) }
				>
					Save & Go To Cart
				</button>
			</div>
		</div>
	)
}