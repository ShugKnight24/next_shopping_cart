import { useContext } from 'react';
import Link from 'next/link';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import PropTypes from 'prop-types';

export function ProductCard({ 
	available,
	description,
	image,
	favorite,
	isInCart,
	itemid,
	manufacturer,
	price,
	productName,
}){
	const { dispatch } = useContext(CartContext);

	function handleAddToCart(itemid){
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId: itemid
			}
		});
	}
	
	function handleRemoveFromCart(itemid){
		dispatch({ 
			type: 'REMOVE_ITEM',
			payload: {
				productId: itemid
			}
		});
	}

	function handleFavorite(){
		dispatch({ 
			type: 'ADD_FAVORITE',
			payload: {
				productId: itemid
			}
		});
	}

	function handleRemoveFavorite(){
		dispatch({ 
			type: 'REMOVE_FAVORITE',
			payload: {
				productId: itemid
			}
		});
	}

	const disabledButton = available === 0 ? true : false;
	const trimmedLowerProductName = productName.toLowerCase().replace(/\s+/g, '');
	return (
		<div
			className="product"
		>
			<img
				className={`product-image ${ trimmedLowerProductName }`}
				src={ image }
				alt={`${ productName } made by ${ manufacturer }`}
			/>
			<div className="name-favorite">
				<h2 className="product-name">{ manufacturer } { productName }</h2>
				{
					favorite === null
					?
						<button
							className="favorite-button add-favorite"
							onClick={ () => handleFavorite() }
						>
							<i className="fas fa-heart"></i>
						</button>
					:
						<button
							className="favorite-button remove-favorite"
							onClick={ () => handleRemoveFavorite() }
						>
							<i className="far fa-heart"></i>
						</button>
				}
			</div>
			<div className="product-info">
				<p className="product-description">
					{ description }
				</p>
				<p className="product-price">
					{ formatCurrency(price) }
				</p>
				<p className="product-quantity">
					<span className="bold-text">Currently Available</span>: { available }
				</p>
				<div className="product-actions">
					<button className="button more-info-button">
						<Link href={`/products/${ itemid.toString() }`}><a>More Info</a></Link>
					</button>
					{
						isInCart &&
						<button
							className="button delete-item"
							onClick={ () => handleRemoveFromCart(itemid) }
						>Remove Item</button>
					}
					<button
						className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
						onClick={ () => handleAddToCart(itemid) }
					>Add To Cart
						<i className="fas fa-cart-plus"></i>
					</button>
				</div>
			</div>
		</div>
	)
}

ProductCard.propTypes = {
	available: PropTypes.number,
	description: PropTypes.string,
	image: PropTypes.string,
	favorite: PropTypes.bool,
	isInCart: PropTypes.bool,
	itemid: PropTypes.string,
	manufacturer: PropTypes.string,
	price: PropTypes.number,
	productName: PropTypes.string
};