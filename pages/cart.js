import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { formatCurrency, totalQuantity, totalPrice } from '../utils/cartUtils';

export default function Cart(){
	const { state, dispatch } = useContext(CartContext);
	const { cart } = state;
	const itemsInCart = cart.length > 0 ? true : false;

	return(
		<>
			<Head>
				<title>Shopping Cart | Cart</title>
			</Head>
			<div className="cart-container">
				<div className="page-header">
					<h1>Cart</h1>
					<h2>Find everything okay?</h2>
				</div>
				{
					itemsInCart
					?
						<>
							<div className="cart-header">
								<span className="product-header">Product</span>
								<span className="quantity">Quantity</span>
								<span className="remove">Remove Item</span>
								<span className="price">Price</span>
							</div>
							{
								cart &&
								cart.map(cartItem => {
									return(
										<div 
											className="cart-item"
											key={ cartItem.itemid } 
										>
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
											<button className="delete-item"
												onClick={() =>  dispatch({ 
													type: 'REMOVE_ITEM',
													payload: {
														productId: cartItem.itemid
													}
												})}
											>
												<i className="far fa-trash-alt"></i>
											</button>
											<p className="product-price">{ formatCurrency(cartItem.price * cartItem.quantity) }</p>
										</div>
									)
								}
							)}
							<div className="cart-info">
								<div className="total-quantity">
									<p>Total Items: { totalQuantity(cart) }</p>
								</div>
								<div className="total-price">
									<p>SubTotal: { formatCurrency(totalPrice(cart)) }</p>
								</div>
							</div>
							<div className="cart-actions">
								{/* TODO:// Confirm Modal */}
								<button
									className="clear-cart"
									onClick={ () => dispatch({ 
										type: 'EMPTY_CART'
									}) }
								>
									Empty Cart
								</button>
								<button className="checkout">
									Proceed to Checkout
								</button>
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
			</div>
		</>
	);
}