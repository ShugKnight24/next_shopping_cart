import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic'
import { Products } from '../Components/Products/Products';
import { CartContext } from '../context/CartProvider';
import { ModalContext } from '../context/ModalProvider';
import { Modal } from '../Components/Modal';
// import { getCurrentItem } from '../utils/getItem';
// import { formatCurrency } from '../utils/cartUtils';
import { AddToCart } from '../Components/Modals/AddToCart';

// For more info about Dynamic components and why they're used
// Look @ https://nextjs.org/docs/advanced-features/dynamic-import
const DynamicCarousel = dynamic(() =>
	import('../Components/Carousel/Carousel').then((mod) => mod.Carousel)
)

export default function Home() {
	const { showModal, setShowModal, modalType, setModalType } = useContext(ModalContext);
	const { state, dispatch } = useContext(CartContext)
	const { inventory } = state;

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [recommendedProduct, setRecommendedProduct] = useState(null);
	const [recItem, setRecItem] = useState(null);

	// useEffect(() => {
	// 	const currentItem = getCurrentItem(inventory, recommendedProduct);
	// 	setRecItem(currentItem ? currentItem : null);
	// }, [selectedProduct]);

	const isBrowser = typeof window !== 'undefined';

	return (
		<>
			<Head>
				<title>Shopping Cart | Home</title>
			</Head>
			<div className="home-container">
				{
					isBrowser && <DynamicCarousel /> 
				}
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
							{
								modalType === 'Add' &&
								<AddToCart
									itemid={ selectedProduct }
								/>
							}
						</Modal>
					) : null
				}
			</div>
		</>
	);
}
