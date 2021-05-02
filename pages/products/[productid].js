import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import productList from '../../data/items.json';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';

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
	const currentProduct = productList.filter(product => {
		return product.itemid.toString() === currentid;
	});
	return {
		props: { 
			currentProduct: currentProduct[0]
		}
	}
}

export default function ProductID({ currentProduct }){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const currentItem = inventory.find((product) => product.itemid === currentProduct.itemid)
	const disabledButton = currentItem.available === 0 ? true : false;

	// TODO: Finish Add to Cart functionality
	// function handleSubmit(event){
	// 	event.preventDefault();
	// 	console.log(event);
	// }

	// Long Term Goal
	// Product Added Modal
		// Continue shopping ...
		// Go to cart ...

	return(
		<>
			<Head>
				<title>{ currentProduct.productName } | Product Page</title>
			</Head>
			<div className="product-page">
				<div className="product-container">
				<Link href="/products"><a>All Products</a></Link>
				{
					<div
					className="product"
					key={ currentProduct.itemid }
					>
						<div className="page-header">
							<h1>{ currentProduct.productName } Details</h1>
							<h2>Manufactured By: { currentProduct.manufacturer }</h2>
						</div>
						<img 
							src={ currentProduct.image }
							alt={`${ currentProduct.productName } by ${ currentProduct.manufacturer }`}
							/>
						<p className="product-description"></p>
						<p className="product-price">Price: { formatCurrency(currentProduct.price) }</p>
						<p className="product-quantity">Currently Available: { currentItem.available }</p>
						<button
							className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
							onClick={ () => dispatch({ 
								type: 'ADD_ITEM',
								payload: {
									productId: currentProduct.itemid
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