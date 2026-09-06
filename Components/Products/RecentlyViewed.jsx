import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { getCurrentItem } from '../../utils/getItem';
import { getAllProducts } from '../../utils/productCatalog';
import { ProductCard } from './ProductCard';
import styles from './RecentlyViewed.module.css';

const STORAGE_KEY = 'shopping_cart_recently_viewed';

export function RecentlyViewed({ currentProductId }) {
  const { state } = useContext(CartContext);
  const { cart } = state;
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let updated = stored;

      if (currentProductId) {
        // Prepend current product and deduplicate
        updated = [currentProductId, ...stored.filter((id) => id !== currentProductId)].slice(0, 8);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      // Filter out current product for the display list
      const displayIds = updated.filter((id) => id !== currentProductId).slice(0, 4);
      const all = getAllProducts();
      const items = displayIds
        .map((id) => all.find((p) => p.itemid === id))
        .filter(Boolean);

      setRecentItems(items);
    } catch {
      // Ignore localStorage errors
    }
  }, [currentProductId]);

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentItems([]);
    } catch {
      // Ignore
    }
  };

  if (recentItems.length === 0) return null;

  return (
    <section className={styles.recentSection} data-testid="recently-viewed">
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <span className={styles.tagline}>Browsing History</span>
          <h2 className={styles.title}>Recently Viewed</h2>
        </div>
        <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear recently viewed history">
          Clear History
        </button>
      </div>

      <div className={styles.grid}>
        {recentItems.map((item) => {
          const cartItem = getCurrentItem(cart, item.itemid);
          const isInCart = Boolean(cartItem);
          const cartQuantity = cartItem ? cartItem.quantity : 0;

          return (
            <ProductCard
              key={item.itemid}
              available={item.available}
              description={item.description}
              image={item.image}
              favorite={item.favorite}
              isInCart={isInCart}
              itemid={item.itemid}
              manufacturer={item.manufacturer}
              price={item.price}
              productName={item.productName}
              badge={item.badge}
              badges={item.badges}
              rating={item.rating}
              originalPrice={item.originalPrice}
              cartQuantity={cartQuantity}
              variants={item.variants}
              specifications={item.specifications}
            />
          );
        })}
      </div>
    </section>
  );
}

RecentlyViewed.propTypes = {
  currentProductId: PropTypes.string,
};
