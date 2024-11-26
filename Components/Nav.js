import { useContext } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { CartContext } from '../context/CartProvider';
import { totalQuantity } from '../utils/cartUtils';

export default function Nav() {
  const { state } = useContext(CartContext);
  const { cart } = state;
  const cartCount = totalQuantity(cart) > 99 ? '99+' : totalQuantity(cart);
  const cartIconSize =
    cartCount === '99+' ? 'huge' : cartCount >= 10 ? 'xl' : '';

  return (
    <div className="nav-container">
      <Logo />
      <nav>
        <Link href="/">Shop</Link>
        <Link href="/favorites">Favorites</Link>
        <Link href="/products">Products</Link>
        <Link className="cart-nav-item" href="/cart">
          {/* <a className="cart-nav-item"> */}
          <span className={`cart-count ${cartIconSize}`}>{cartCount}</span>
          {/* </a> */}
        </Link>
      </nav>
    </div>
  );
}
