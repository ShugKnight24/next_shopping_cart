import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Products } from '../../Components/Products';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { Modal } from '../../Components/Modal';
// import { getCurrentItem } from '../../utils/getItem';
// import { formatCurrency } from '../../utils/cartUtils';
import { AddToCart } from '../../Components/Modals/AddToCart';

export default function ProductsPage(){
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