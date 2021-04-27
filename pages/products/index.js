import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../../context/CartProvider';

export default function Products(){
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;

	return(
		<>
			<Head>
				<title>Shopping Cart | All Products Page</title>
			</Head>
			<div className="products-page">
				<div className="page-header">
					<h1>All Products</h1>
				</div>
				<div className="products-container">
					{
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
										<p className="product-description">{ product.description }</p>
										<p className="product-Price">Price: ${ product.price }</p>
										{/* 
											TODO:// Reduce this number as items are added to cart... 
											Can't add more than currently available
										*/}
										<p className="product-quantity">Currently Available: { product.available }</p>
										<div className="product-actions">
											<button className="button more-info-button">
												<Link href={`/products/${ product.itemid.toString() }`}><a>More Info</a></Link>
											</button>
											{/* TODO:// Add to cart functionality */}
											<button className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}>Add To Cart</button>
										</div>
									</div>
								</div>
							)
						})
					}
				</div>
			</div>
		</>
	);
}