import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { trackSearch } from '../../analytics/google';
import { CartContext } from '../../context/CartProvider';
import { buildSearchIndex, searchProducts } from '../../utils/productSearch';
import { Hit } from './Hit';
import styles from './InstantSearch.module.css';

export function InstantSearch({
  showHitsClosed,
  setSelectedProduct,
  setRecommendedProduct,
}) {
  const { state } = useContext(CartContext);
  const { inventory } = state;

  const [showHits, setShowHits] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Index once per inventory change; rank on every keystroke
  const searchIndex = useMemo(() => buildSearchIndex(inventory), [inventory]);

  // Fuzzy-match inventory: typo tolerant, prefix on the word being typed.
  // Empty query shows helper text instead of results.
  const hitList = useMemo(
    () => searchProducts(searchIndex, searchQuery, { limit: 5 }),
    [searchIndex, searchQuery]
  );

  function handleInput(event) {
    setSearchQuery(event.target.value);
  }

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const timer = setTimeout(() => {
      trackSearch(trimmed, hitList.length);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, hitList.length]);

  useEffect(() => {
    if (showHitsClosed === false) setShowHits(false);
  }, [showHitsClosed]);

  return (
    <div
      className={`${styles.instantSearchContainer} ${showHits ? styles.populated : ''}`.trim()}
    >
      <input
        className={styles.instantSearch}
        type="text"
        placeholder="Search Products"
        value={searchQuery}
        onFocus={() => setShowHits(true)}
        onChange={handleInput}
      />
      {showHits && (
        <ul className={styles.instantList}>
          {hitList.length !== 0 ? (
            hitList.map((product) => (
              <Hit
                key={product.itemid}
                itemid={product.itemid}
                query={searchQuery}
                setSelectedProduct={setSelectedProduct}
                setRecommendedProduct={setRecommendedProduct}
              />
            ))
          ) : searchQuery.trim() ? (
            <li>
              <a>No Matches Found</a>
            </li>
          ) : (
            <>
              <li>
                <a>Find the products you want</a>
              </li>
              <li>
                <a>Filter by name and manufacturer</a>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}

// TODO:// Update object shape when rec system is implemented
InstantSearch.propTypes = {
  showHitsClosed: PropTypes.bool,
  setSelectedProduct: PropTypes.func,
  setRecommendedProduct: PropTypes.func,
};
