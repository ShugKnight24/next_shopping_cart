import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Products } from '../Components/Products';
import { ModalContext } from '../context/ModalProvider';
import { Modal } from '../Components/Modal';

export default function Home() {
	const { showModal } = useContext(ModalContext);

	const [selectedProduct, setSelectedProduct] = useState('');
	const [recommendedProduct, setRecommendedProduct] = useState('');
	const [recItem, setRecItem] = useState(null);


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
				<Products />
				<Link href='/products'>
					<a className="all-products-link">See All Products</a>
				</Link>
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
