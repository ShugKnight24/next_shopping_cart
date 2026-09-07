import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { CartContext } from '../context/CartProvider';
import { totalQuantity } from '../utils/cartUtils';
import { Logo } from './Logo';
import PromoBanner from './PromoBanner/PromoBanner';
import { CommandPalette } from './Search/CommandPalette';
import { CartDrawer } from './Cart/CartDrawer';
import { BrandVariantPickerModal } from './Brand/BrandVariantPicker';
import { SearchIcon, CartIcon } from './Icons';
import styles from './Nav.module.css';

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
  const router = useRouter();
  const { state, setIsCartOpen } = useContext(CartContext);
  const { cart } = state || { cart: [] };
  const cartCount = totalQuantity(cart) > 99 ? '99+' : totalQuantity(cart);
  const cartIconSize =
    cartCount === '99+' ? 'huge' : cartCount >= 10 ? 'xl' : '';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBrandPickerOpen, setIsBrandPickerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isStudioDropdownOpen, setIsStudioDropdownOpen] = useState(false);
  const studioDropdownRef = useRef(null);
  const dropdownTimerRef = useRef(null);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsStudioDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    // 350ms buffer so moving cursor diagonally or crossing any gap never drops the menu
    dropdownTimerRef.current = setTimeout(() => {
      setIsStudioDropdownOpen(false);
    }, 350);
  };

  const handleDropdownTriggerClick = (e) => {
    e.stopPropagation();
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsStudioDropdownOpen((prev) => !prev);
  };

  const handleDropdownItemClick = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsStudioDropdownOpen(false);
  };

  // Close studio dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        studioDropdownRef.current &&
        !studioDropdownRef.current.contains(event.target)
      ) {
        if (dropdownTimerRef.current) {
          clearTimeout(dropdownTimerRef.current);
          dropdownTimerRef.current = null;
        }
        setIsStudioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close studio dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (dropdownTimerRef.current) {
          clearTimeout(dropdownTimerRef.current);
          dropdownTimerRef.current = null;
        }
        setIsStudioDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Cleanup timer on unmount and route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current);
        dropdownTimerRef.current = null;
      }
      setIsStudioDropdownOpen(false);
    };

    router.events?.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current);
      }
    };
  }, [router.events]);

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
    <div className={styles.navContainer}>
      <div className={styles.navHeader}>
        <Link href="/" className={styles.navLogoLink} aria-label="Cart Commerce Home">
          <Logo className={styles.brandLogoSvg} />
        </Link>
        <div className={styles.navControls}>
          <nav className={styles.navLinks} aria-label="Main Navigation">
            <Link href="/" aria-label="Home / Shop">
              Shop
            </Link>
            <Link href="/products" aria-label="Products">
              Products
            </Link>
            <Link href="/favorites" aria-label="Favorites">
              Favorites
            </Link>
            <Link href="/cart" className={styles.cartDirectLink} aria-label="Cart Bag">
              Cart
            </Link>

            {/* Studios Dropdown Submenu */}
            <div
              className={styles.studioDropdown}
              ref={studioDropdownRef}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                type="button"
                className={styles.studioDropdownTrigger}
                onClick={handleDropdownTriggerClick}
                aria-expanded={isStudioDropdownOpen}
                aria-haspopup="true"
                aria-label="Studios creation suites menu"
              >
                <span>Studios</span>
                <span className={styles.studioBadge}>SUITE</span>
                <svg
                  className={`${styles.dropdownChevron} ${
                    isStudioDropdownOpen ? styles.dropdownChevronOpen : ''
                  }`}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isStudioDropdownOpen && (
                <div
                  className={styles.dropdownMenu}
                  role="menu"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <Link
                    href="/studio"
                    className={styles.dropdownItem}
                    onClick={handleDropdownItemClick}
                    role="menuitem"
                  >
                    <div className={styles.dropdownItemHeader}>
                      <span className={styles.dropdownTitle}>Custom W2P Studio</span>
                      <span className={styles.dropdownItemBadgeW2p}>W2P</span>
                    </div>
                    <span className={styles.dropdownDesc}>
                      Personalized Books, Framed Posters & Kids' Kicks
                    </span>
                  </Link>

                  <Link
                    href="/studio/social"
                    className={styles.dropdownItem}
                    onClick={handleDropdownItemClick}
                    role="menuitem"
                  >
                    <div className={styles.dropdownItemHeader}>
                      <span className={styles.dropdownTitle}>Social Media Studio</span>
                      <span className={styles.dropdownItemBadgeHot}>NEW</span>
                    </div>
                    <span className={styles.dropdownDesc}>
                      Figma-Style Flier, Banner & Post Creator
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.brandTrigger}
              onClick={() => setIsBrandPickerOpen(true)}
              aria-label="Brand Logo Variant Selector"
              title="Switch Brand Logo Style (Geometric, Minimal, Crest)"
            >
              <span className={styles.brandTriggerStar}>✦</span>
              <span className={styles.brandTriggerLabel}>Brand</span>
            </button>
            <button
              type="button"
              className={styles.searchTrigger}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
            >
              <SearchIcon size={16} />
              <span className={styles.searchShortcut}>⌘K</span>
            </button>
            <button
              type="button"
              className={styles.cartNavItem}
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open Cart Bag (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
            >
              <CartIcon size={24} className={styles.cartNavSvg} />
              <span className={`${styles.cartCount} ${cartIconSize ? styles[cartIconSize] : ''}`.trim()}>{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
      <PromoBanner />

      {/* Scroll Progress Indicator */}
      <div className={styles.scrollProgressTrack}>
        <div
          className={styles.scrollProgressBar}
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
      <BrandVariantPickerModal
        isOpen={isBrandPickerOpen}
        onClose={() => setIsBrandPickerOpen(false)}
      />
    </div>
  );
}
