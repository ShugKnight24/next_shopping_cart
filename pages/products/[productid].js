import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import productList from '../../data/items.json';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';

export const getStaticPaths = async () => {
	const pagePaths = productList.map(({ itemid }) => {
		return {
			params: { 
				productid: itemid.toString(),
			}
		}
	});

	return {
		paths: pagePaths,
		fallback: false
	}
}

export const getStaticProps = (context) => {

	const currentid = context.params.productid;
	const currentProduct = getCurrentItem(productList, currentid);
	return {
		props: { 
			currentProduct: currentProduct
		}
	}
}

export default function ProductID({ currentProduct }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const currentItem = getCurrentItem(inventory, currentProduct.itemid)
	const disabledButton = currentItem.available === 0 ? true : false;
	const { available, description, image, itemid, manufacturer, price, productName } = currentProduct;

	// TODO: Finish Add to Cart functionality
	// function handleSubmit(event){
	// 	event.preventDefault();
	// 	console.log(event);
	// }

	return(
		<>
			<Head>
				<title>{ productName } | Product Page</title>
			</Head>
			<div className="product-page">
				<div className="product-container">
				<Link href="/products">
					<a className="product-return">
						<i className="fas fa-chevron-left"></i>
						All Products
					</a>
				</Link>
				{
					<div
						className="product"
						key={ itemid }
					>
						<div className="page-header">
							<h1>{ productName } Details</h1>
							<h2>Manufactured By: { manufacturer }</h2>
						</div>
						<img 
							src={ image }
							alt={`${ productName } by ${ manufacturer }`}
							/>
						<p className="product-description">{ description }</p>
						<p className="product-price">{ formatCurrency(price) }</p>
						<p className="product-quantity">Currently Available: { currentItem.available }</p>
						<button
							className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
							onClick={ () => dispatch({ 
								type: 'ADD_ITEM',
								payload: {
									productId: itemid
								}
							}) }
						>Add To Cart</button>
						{/* <form
							className="add-to-cart-form"
							onSubmit={ (event) => handleSubmit(event) }
						>
							<label htmlFor="quantity">Quantity:</label>
							<input
								id="quantity"
								className="quantity-input"
								type="number"
								name="quantity"
								value="1"
								min="0"
								max={ currentProduct.available }
								onChange={ (event) => updateQuantity(event) }
							/>
							<button 
								className="button add-cart-button"
								type="submit"
							>Add To Cart</button>
						</form> */}
					</div>
				}
				</div>
			</div>
		</>
	);
}