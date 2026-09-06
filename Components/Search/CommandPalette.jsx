import Link from 'next/link';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BadgeGroup } from '../UI/Badge';
import { RatingStars } from '../UI/RatingStars';
import styles from './CommandPalette.module.css';

export function CommandPalette({
  isOpen,
  onClose,
  products = [],
  recentSearches = [],
  popularProducts = [],
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Search products
  const searchProducts = useCallback(
    (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      // Simulate search delay for UX
      setTimeout(() => {
        const filtered = products.filter((product) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            product.productName?.toLowerCase().includes(searchLower) ||
            product.manufacturer?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.tags?.some((tag) =>
              tag.toLowerCase().includes(searchLower)
            ) ||
            product.category?.toLowerCase().includes(searchLower)
          );
        });

        setResults(filtered.slice(0, 8));
        setSelectedIndex(0);
        setIsLoading(false);
      }, 150);
    },
    [products]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const maxIndex = results.length > 0 ? results.length - 1 : 0;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = `/products/${results[selectedIndex].itemid}`;
          onClose();
        }
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search products, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className={styles.escKey}>ESC</kbd>
        </div>

        {/* Results area */}
        <div className={styles.content}>
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Searching...</span>
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className={styles.noResults}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15s1.5-2 4-2 4 2 4 2" />
                <line
                  x1="9"
                  y1="9"
                  x2="9.01"
                  y2="9"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="15"
                  y1="9"
                  x2="15.01"
                  y2="9"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <p>No products found for "{query}"</p>
              <span>Try a different search term</span>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className={styles.results} ref={resultsRef}>
              <div className={styles.sectionHeader}>
                <span>Products</span>
                <span className={styles.resultCount}>
                  {results.length} results
                </span>
              </div>
              {results.map((product, index) => (
                <Link
                  key={product.itemid}
                  href={`/products/${product.itemid}`}
                  className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.productImage}>
                    <img src={product.image} alt={product.productName} />
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <span className={styles.manufacturer}>
                        {product.manufacturer}
                      </span>
                      {product.badges && (
                        <BadgeGroup badges={product.badges} max={2} />
                      )}
                    </div>
                    <h4 className={styles.productName}>
                      {product.productName}
                    </h4>
                    <div className={styles.productMeta}>
                      {product.rating && (
                        <RatingStars
                          rating={product.rating.average}
                          count={product.rating.count}
                          size="small"
                        />
                      )}
                    </div>
                  </div>
                  <div className={styles.productPrice}>
                    <span className={styles.price}>
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className={styles.originalPrice}>
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <>
              {recentSearches.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span>Recent Searches</span>
                  </div>
                  <div className={styles.chips}>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className={styles.chip}
                        onClick={() => setQuery(search)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {popularProducts.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span>Popular Products</span>
                  </div>
                  <div className={styles.popularGrid}>
                    {popularProducts.slice(0, 4).map((product) => (
                      <Link
                        key={product.itemid}
                        href={`/products/${product.itemid}`}
                        className={styles.popularItem}
                        onClick={onClose}
                      >
                        <div className={styles.popularImage}>
                          <img src={product.image} alt={product.productName} />
                        </div>
                        <div className={styles.popularInfo}>
                          <span className={styles.popularBrand}>
                            {product.manufacturer}
                          </span>
                          <span className={styles.popularName}>
                            {product.productName}
                          </span>
                          <span className={styles.popularPrice}>
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.tips}>
                <div className={styles.tip}>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> to navigate
                </div>
                <div className={styles.tip}>
                  <kbd>↵</kbd> to select
                </div>
                <div className={styles.tip}>
                  <kbd>esc</kbd> to close
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array,
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  popularProducts: PropTypes.array,
};

// Hook for keyboard shortcut to open
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
