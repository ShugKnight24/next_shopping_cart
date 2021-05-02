import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Products } from '../../Components/Products';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { Modal } from '../../Components/Modal';
import { getCurrentItem } from '../../utils/getItem';

export default function ProductsPage(){
	const { showModal } = useContext(ModalContext);
	const { state, dispatch } = useContext(CartContext)
	const { inventory } = state;

	const [selectedProduct, setSelectedProduct] = useState('');
	const [recommendedProduct, setRecommendedProduct] = useState('');
	const [recItem, setRecItem] = useState(null);

	useEffect(() => {
		const currentItem = getCurrentItem(inventory, recommendedProduct);
		setRecItem(currentItem ? currentItem : null);
	}, [selectedProduct]);

	return(
		<>
			<Head>
				<title>Shopping Cart | All Products Page</title>
			</Head>
			<div className="products-page">
				<div className="page-header">
					<h1>All Products</h1>
				</div>
				<Products
					setSelectedProduct={ setSelectedProduct }
					setRecommendedProduct={ setRecommendedProduct }
				/>
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