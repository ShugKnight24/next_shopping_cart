import { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { ModalContext } from '../context/ModalProvider';
import { Modal } from '../Components/Modal';
import { formatCurrency, totalQuantity, totalPrice } from '../utils/cartUtils';
import { ClearCart } from '../Components/Modals/ClearCart';
import { DeleteItem } from '../Components/Modals/DeleteItem';

export default function Cart(){
	const { showModal, setShowModal, modalType, setModalType } = useContext(ModalContext);
	const { state, dispatch } = useContext(CartContext);
	const { cart } = state;
	const itemsInCart = cart.length > 0 ? true : false;
	const [tempDelItem, setTempDelItem] = useState(null);

	function handleClearCart(){
		setShowModal(true);
		setModalType('Clear');
	}

	function handleDeleteItem(itemid){
		setShowModal(true);
		setModalType('Delete');
		setTempDelItem(itemid);
	}

	return(
		<>
			<Head>
				<title>Shopping Cart | Cart</title>
			</Head>
			<div className="cart-container">
				<div className="page-header">
					<h1>Shopping Cart</h1>
					<h2>Find everything okay?</h2>
				</div>
				{
					itemsInCart
					?
						<>
							<div className="cart-and-info">
								<div className="cart">
									<div className="cart-header">
										<span className="remove">Remove Item</span>
										<span className="product-header">Product</span>
										<span className="quantity">Quantity</span>
										<span className="price">Price</span>
										<span className="subtotal">SubTotal</span>
									</div>
								{
									cart &&
										cart.map(cartItem => {
											return(
												<div 
													className="cart-item"
													key={ cartItem.itemid } 
												>
													<button className="delete-item"
														onClick={() => handleDeleteItem(cartItem.itemid) }
													>
														<i className="far fa-trash-alt"></i>
													</button>
													<div className="cart-product-info">
														<img 
															src={ cartItem.image }
															alt={`${ cartItem.productName } made by ${ cartItem.manufacturer }`}
														/>
														<h2>{ cartItem.productName }</h2>
													</div>
													<input
														id="cart-quantity"
														className="quantity-input"
														type="number"
														name="quantity"
														value={ cartItem.quantity }
														min="1"
														max={ cartItem.available }
														onChange={(event) =>  dispatch({ 
															type: 'UPDATE_QUANTITY',
															payload: {
																productId: cartItem.itemid,
																quantity: event.target.value
															}
														})}
													/>
													<p className="product-price">{ formatCurrency(cartItem.price) }</p>
													<p className="product-subtotal">{ formatCurrency(cartItem.price * cartItem.quantity) }</p>
												</div>
											)
										}
								)}
								</div>
								<div className="cart-info">
									<div className="cart-header">
										<span>Cart Total</span>
									</div>
									<div className="total-quantity">
										<p><span className="bold-text">Total Items</span>:</p><p>{ totalQuantity(cart) }</p>
									</div>
									<div className="subtotal-price">
										<p><span className="bold-text">Subtotal</span>:</p><p>{ formatCurrency(totalPrice(cart)) }</p>
									</div>
									<div className="tax">
										<p><span className="bold-text">Tax</span>:</p><p>Based Off Location</p>
									</div>
									<div className="total-price">
										<p><span className="bold-text">Total</span>:</p><p>{ formatCurrency(totalPrice(cart)) }</p>
									</div>
									<div className="cart-actions">
									<button
										className="clear-cart"
										onClick={ () => handleClearCart() }
									>
										Empty Cart
									</button>
									<button className="checkout">
										Proceed to Checkout
									</button>
								</div>
								</div>
							</div>
							
						</>
					: (
						<div className="empty-cart">
							<p>Your cart is currently empty, add some items and come back</p>
							<Link href="/"><a>Home</a></Link>
							<Link href="/products"><a>Products</a></Link>
						</div>
					)
				}
				{ 
					showModal ? (
						<Modal>
							{
								modalType === 'Clear' &&
								<ClearCart />
							}
							{
								modalType === 'Delete' &&
								<DeleteItem 
									itemid={ tempDelItem }
								/>
							}
						</Modal>
					) : null
				}
			</div>
		</>
	);
}