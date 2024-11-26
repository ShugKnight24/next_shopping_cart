import Link from 'next/link';
import { useContext } from 'react';
import { CartContext } from '../context/CartProvider';
import { totalQuantity } from '../utils/cartUtils';
import { Logo } from './Logo';

export default function Nav() {
  const { state } = useContext(CartContext);
  const { cart } = state || { cart: [] };
  const cartCount = totalQuantity(cart) > 99 ? '99+' : totalQuantity(cart);
  const cartIconSize =
    cartCount === '99+' ? 'huge' : cartCount >= 10 ? 'xl' : '';

  return (
    <div className="nav-container">
      <Link href="/" aria-label="Home / Shop">
        <Logo />
      </Link>
      <nav>
        <Link href="/" aria-label="Home / Shop">
          Shop
        </Link>
        <Link href="/favorites" aria-label="Favorites">
          Favorites
        </Link>
        <Link href="/products" aria-label="Products">
          Products
        </Link>
        <Link className="cart-nav-item" href="/cart" aria-label="Cart">
          <span className={`cart-count ${cartIconSize}`}>{cartCount}</span>
        </Link>
      </nav>
    </div>
  );
}
