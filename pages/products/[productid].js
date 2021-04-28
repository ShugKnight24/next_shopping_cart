import Head from 'next/head';
import productList from '../../data/items.json';

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

	// TODO: Finish Update Qty functionality
	function updateQuantity(event){
		console.log(event)
	}

	// TODO: Finish Add to Cart functionality
	function handleSubmit(event){
		event.preventDefault();
		console.log(event);
	}

	// Long Term Goal
	// Product Added Modal
		// Continue shopping ...
		// Go to cart ...

	return(
		<>
			<Head>
				<title>{ currentProduct.productName } | Product Page</title>
				<link rel="stylesheet" href="../static/normalize.css"></link>
			</Head>
			<div className="product-page">
				<div className="product-container">
					{/* Link back to all products page */}
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
							<p className="product-Price">Price: ${ currentProduct.price }</p>
							<p className="product-quantity">Currently Available: { currentProduct.available }</p>
							<form
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
							</form>
						</div>
					}
				</div>
			</div>
		</>
	);
}