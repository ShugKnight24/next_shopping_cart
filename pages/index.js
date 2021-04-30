import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { InstantSearch } from '../Components/InstantSearch/InstantSearch';
import { ModalContext } from '../context/ModalProvider';
import { Modal } from '../Components/Modal';

export default function Home() {
	const { state, dispatch } = useContext(CartContext);
	const { inventory } = state;
	const [showHitsClosed, setShowHitsClosed] = useState(null);
	const { showModal } = useContext(ModalContext);

	const [selectedProduct, setSelectedProduct] = useState('');
	const [recommendedProduct, setRecommendedProduct] = useState('');
	const [recItem, setRecItem] = useState(null);

	function handleClick(event){
		const element = document.querySelector('.instant-search');

		// work around
		// functional components won't rerender if state is reset to same
		if (event.target !== element && !element.contains(event.target)) {
			setShowHitsClosed(false);
			setTimeout(() => {
				setShowHitsClosed(null);
			}, 500)
		};
	}

	useEffect(() => {
		const currentItem = inventory.find(product => product.itemid === recommendedProduct);
		setRecItem(currentItem ? currentItem : null);
	}, [selectedProduct]);

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
						setSelectedProduct={ setSelectedProduct }
						setRecommendedProduct={ setRecommendedProduct }
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
				{ 
					showModal ? (
						<Modal>
							<div className="modal-body">
								You selected { selectedProduct }, it pairs well with { recommendedProduct }. want this too?

								<h2>{ recommendedProduct } Details</h2>
								{ recItem &&
									(
										<Link href={`/products/${ recItem.itemid.toString() }`}>
										<a>
											<div className="hit-content">
												<img
													className="hit-image"
													src={ recItem.image }
													alt={`${ recItem.productName } made by ${ recItem.manufacturer }`}
												/>
												<div className="name-manufacturer">
													<h2>{ recItem.productName }</h2>
													<h3>Made By: { recItem.manufacturer }</h3>
													<p>Available: { recItem.available }</p>
												</div>
												<button 
													className={`button add-cart-button`}
													onClick={ () => dispatch({ 
														type: 'ADD_ITEM',
														payload: {
															productId: recItem.itemid
														}
													}) }
												>Add To Cart</button>
											</div>
										</a>
									</Link>
									)
								}
							</div>
						</Modal>
					) : null
				}
			</div>
		</>
	);
}
