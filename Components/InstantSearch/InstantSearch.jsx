import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { trackSearch } from '../../analytics/google';
import { CartContext } from '../../context/CartProvider';
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

  // Filter inventory based on search query
  const hitList = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];

    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      // Show no results when no query - helper text will display instead
      return [];
    }

    return inventory
      .filter((product) => {
        const productName = (product.productName || '').toLowerCase();
        const manufacturer = (product.manufacturer || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const itemid = (product.itemid || '').toLowerCase();

        return (
          productName.includes(query) ||
          manufacturer.includes(query) ||
          description.includes(query) ||
          itemid.includes(query)
        );
      })
      .slice(0, 5); // Limit to 5 results
  }, [inventory, searchQuery]);

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
