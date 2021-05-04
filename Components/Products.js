import { useContext, useState } from 'react';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { InstantSearch } from './InstantSearch/InstantSearch';
import { formatCurrency } from '../utils/cartUtils';

export function Products({ setSelectedProduct, setRecommendedProduct }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const [showHitsClosed, setShowHitsClosed] = useState(null);

	function closeInstantSearch(event){
		const element = document.querySelector('.instant-search-container');

		// work around
		// functional components won't rerender if state is reset to same
		if (event.target !== element && !element.contains(event.target)) {
			setShowHitsClosed(false);
			setTimeout(() => {
				setShowHitsClosed(null);
			}, 500)
		};
	}

	return(
		<div
			className="products-container"
			onClick={
				(event) => closeInstantSearch(event) 
			}
		>
			<div
				className="product-search-container"
			>
				<InstantSearch 
					showHitsClosed={ showHitsClosed }
					setSelectedProduct={ setSelectedProduct }
					setRecommendedProduct={ setRecommendedProduct }
				/>
			</div>
		{
			inventory &&
			inventory.map(product => {
				const disabledButton = product.available === 0 ? true : false;
				return(
					<div
						className="product"
						key={ product.itemid }
					>
						<img 
							src={ product.image }
							alt={`${ product.productName } made by ${ product.manufacturer }`}
						/>
						<h2>{ product.productName }</h2>
						<h3>Manufactured By: { product.manufacturer }</h3>
						<div className="product-info">
							{/* TODO:// Trim description Text `...Read More` => Head to Specific product */}
							<p className="product-description">
								<span className="bold-text">Description</span>: { product.description }
							</p>
							<p className="product-price">
								<span className="bold-text">Price</span>: { formatCurrency(product.price) }
							</p>
							<p className="product-quantity">
								<span className="bold-text">Currently Available</span>: { product.available }
							</p>
							<div className="product-actions">
								<button className="button more-info-button">
									<Link href={`/products/${ product.itemid.toString() }`}><a>More Info</a></Link>
								</button>
								<button
									className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
									onClick={ () => dispatch({ 
										type: 'ADD_ITEM',
										payload: {
											productId: product.itemid
										}
									}) }
								>Add To Cart</button>
							</div>
						</div>
					</div>
				)
			})
		}
		</div>
	)
}