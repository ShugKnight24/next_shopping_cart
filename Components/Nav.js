import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartProvider';
import { totalQuantity } from '../utils/cartUtils';
import { Logo } from './Logo';
import PromoBanner from './PromoBanner/PromoBanner';
import { CommandPalette } from './Search/CommandPalette';
import { CartDrawer } from './Cart/CartDrawer';
import { SearchIcon, CartIcon } from './Icons';

// Import product data for search
import items from '../data/items.json';
import products from '../data/products.json';
import techItems from '../data/techItems.json';

// Merge all product sources and enhance with product data
const mergeProductData = () => {
  const allItems = [...items, ...techItems];

  return allItems.map((item) => {
    const enhanced = products.find((p) => p.itemid === item.itemid);
    return {
      ...item,
      rating: enhanced?.rating || null,
      badges: enhanced?.badges || [],
      originalPrice: enhanced?.originalPrice || null,
      category: enhanced?.category || '',
      tags: enhanced?.tags || [],
    };
  });
};

const allProducts = mergeProductData();

// Get popular products (ones with badges or high ratings)
const popularProducts = allProducts
  .filter(
    (p) =>
      p.badges?.includes('bestseller') ||
      p.badges?.includes('new') ||
      p.rating?.average >= 4.5
  )
  .slice(0, 4);

export default function Nav() {
  const { state, setIsCartOpen } = useContext(CartContext);
  const { cart } = state || { cart: [] };
  const cartCount = totalQuantity(cart) > 99 ? '99+' : totalQuantity(cart);
  const cartIconSize =
    cartCount === '99+' ? 'huge' : cartCount >= 10 ? 'xl' : '';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="nav-container">
      <div className="nav-header">
        <Link href="/" className="nav-logo-link" aria-label="Cart Commerce Home">
          <Logo />
        </Link>
        <div className="nav-controls">
          <nav className="nav-links" aria-label="Main Navigation">
            <Link href="/" aria-label="Home / Shop">
              Shop
            </Link>
            <Link href="/favorites" aria-label="Favorites">
              Favorites
            </Link>
            <Link href="/products" aria-label="Products">
              Products
            </Link>
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
            >
              <SearchIcon size={16} />
              <span className="search-shortcut">⌘K</span>
            </button>
            <button
              type="button"
              className="cart-nav-item"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open Cart Bag (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
            >
              <CartIcon size={24} className="cart-nav-svg" />
              <span className={`cart-count ${cartIconSize}`}>{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
      <PromoBanner />

      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-track">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
        recentSearches={recentSearches}
        popularProducts={popularProducts}
      />

      <CartDrawer />
    </div>
  );
}
