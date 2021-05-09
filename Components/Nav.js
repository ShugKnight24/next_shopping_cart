import { useContext } from 'react';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { totalQuantity } from '../utils/cartUtils';

export default function Nav(){
	const { state } = useContext(CartContext);
	const { cart } = state;
	const cartCount = totalQuantity(cart) > 99 ? '99+' : totalQuantity(cart);

	return(
		<div className="nav-container">
			<nav>
				<Link href="/"><a>Shop</a></Link>
				<Link href="/products"><a>Products</a></Link>
				<Link href="/cart">
					<a className="cart-nav-item">
						<span className="cart-count">{ cartCount }</span>
					</a>
				</Link>
			</nav>
		</div>
	);
}