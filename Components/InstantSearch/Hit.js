import { useContext } from 'react';
import Link from 'next/link';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';
import PropTypes from 'prop-types';

export function Hit({ itemid, setSelectedProduct, setRecommendedProduct }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const { setShowModal } = useContext(ModalContext);

	function handleButtonClick(event, productId){
		event.preventDefault();
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId
			}
		});

		// if (productId === 'SM58') {
		// 	setShowModal(true);
		// 	setSelectedProduct('SM58');
		// 	setRecommendedProduct('SM57');
		// }
	}

	const { available, image, manufacturer, price, productName } = getCurrentItem(inventory, itemid);
	const disabledButton = available === 0 ? true : false;

	return(
		<li 
			className="hit-container"
		>
			<Link href={`/products/${ itemid.toString() }`}>
				<a>
					<div className="hit-content">
						<img
							className="hit-image"
							src={ image }
							alt={`${ productName } made by ${ manufacturer }`}
						/>
						<div className="name-manufacturer">
							<h2>{ productName }</h2>
							<h3>Made By: { manufacturer }</h3>
							<p>Available: { available }</p>
							<p>{ formatCurrency(price) }</p>
						</div>
						<button 
							className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
							onClick={ (event) => handleButtonClick(event, itemid) }
						>Add To Cart</button>
					</div>
				</a>
			</Link>
		</li>
	)
}

// TODO:// Update object shape when rec system is implemented
Hit.propTypes = {
	itemid: PropTypes.string.isRequired,
	setSelectedProduct: PropTypes.func,
	setRecommendedProduct: PropTypes.func
};