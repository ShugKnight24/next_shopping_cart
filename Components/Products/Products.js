import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { InstantSearch } from '../InstantSearch/InstantSearch';
import { ProductCard } from './ProductCard';
import { getCurrentItem } from '../../utils/getItem';
import PropTypes from 'prop-types';

export function Products({ setSelectedProduct, setRecommendedProduct }){
	const { state } = useContext(CartContext);
	const { inventory, cart } = state;
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
			inventory.map(({ available, description, favorite, image, itemid, manufacturer, price, productName })=> {
				const isInCart = getCurrentItem(cart, itemid) ? true : false;
				return(
					<ProductCard 
						key={ itemid }
						available={ available }
						description={ description }
						image={ image }
						favorite={ favorite }
						isInCart={ isInCart }
						itemid={ itemid }
						manufacturer={ manufacturer }
						price={ price }
						productName={ productName }
					/>
				)
			})
		}
		</div>
	)
}

// TODO:// Update object shape when rec system is implemented
Products.propTypes = {
	setSelectedProduct: PropTypes.object,
	setRecommendedProduct: PropTypes.object
};