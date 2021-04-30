import { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { InstantSearch } from '../Components/InstantSearch/InstantSearch';

export default function Home() {
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const [showHitsClosed, setShowHitsClosed] = useState(null);

	function handleClick(event){
		const element = document.querySelector('.instant-search');

		if (event.target !== element && !element.contains(event.target)) setShowHitsClosed(false);
	}

	return (
		<>
			<Head>
				<title>Shopping Cart | Home</title>
			</Head>
			<div className="home-container">
				<div className="page-header">
					<h1>Home Page</h1>
					<h2>Our Most Popular Products</h2>
				</div>
				<div className="products-container"
					onClick={
						(event) => handleClick(event) 
					}
				>
					<InstantSearch 
						showHitsClosed={ showHitsClosed }
					/>
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
									{/* TODO:// Trim description Text `...Read More` */}
									<p className="product-description">{ product.description }</p>
									<p className="product-Price">Price: ${ product.price }</p>
									{/* 
										TODO:// Reduce this number as items are added to cart... 
										Can't add more than currently available
									*/}
									<p className="product-quantity">Currently Available: { product.available }</p>
									<div className="product-actions">
										<Link href={`/products/${ product.itemid.toString() }`}>
											<button className="button more-info-button">
												<a>More Info</a>
											</button>
										</Link>
										{/* TODO:// Add to cart functionality */}
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
					<Link href='/products'><a className="all-products-link">See All Products</a></Link>
				</div>
			</div>
		</>
	);
}
