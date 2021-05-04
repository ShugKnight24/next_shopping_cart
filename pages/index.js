import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Products } from '../Components/Products';
import { CartContext } from '../context/CartProvider';
import { ModalContext } from '../context/ModalProvider';
import { Modal } from '../Components/Modal';
// import { getCurrentItem } from '../utils/getItem';
// import { formatCurrency } from '../utils/cartUtils';

export default function Home() {
	const { showModal, setShowModal } = useContext(ModalContext);
	const { state, dispatch } = useContext(CartContext)
	const { inventory } = state;

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [recommendedProduct, setRecommendedProduct] = useState(null);
	const [recItem, setRecItem] = useState(null);

	// useEffect(() => {
	// 	const currentItem = getCurrentItem(inventory, recommendedProduct);
	// 	setRecItem(currentItem ? currentItem : null);
	// }, [selectedProduct]);

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
				<Products 
					setSelectedProduct={ setSelectedProduct }
					setRecommendedProduct={ setRecommendedProduct }
				/>
				<Link href='/products'>
					<a className="all-products-link">See All Products</a>
				</Link>
				{ 
					showModal ? (
						<Modal>
						</Modal>
					) : null
				}
			</div>
		</>
	);
}
