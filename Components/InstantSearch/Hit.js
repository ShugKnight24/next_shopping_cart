import { useContext } from 'react';
import Link from 'next/link';
import { CartContext } from '../../context/CartProvider';

export function Hit({ itemid, image, productName, manufacturer }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;

	function handleButtonClick(event, productId){
		event.stopPropagation();
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId
			}
		});
	}

	const currentItem = inventory.find(product => product.itemid === itemid);
	const disabledButton = currentItem.available === 0 ? true : false;

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
							<p>Available: { currentItem.available }</p>
						</div>
						<button 
							className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
							onClick={ (event) => handleButtonClick(event,  itemid) }
						>Add To Cart</button>
					</div>
				</a>
			</Link>
		</li>
	)
}