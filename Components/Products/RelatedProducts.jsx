import PropTypes from 'prop-types';
import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { getCurrentItem } from '../../utils/getItem';
import { ProductCard } from './ProductCard';
import styles from './RelatedProducts.module.css';

export function RelatedProducts({ products = [] }) {
  const { state } = useContext(CartContext);
  const { cart } = state;

  if (!products || products.length === 0) return null;

  return (
    <section className={styles.relatedSection} data-testid="related-products">
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <span className={styles.tagline}>Curated For You</span>
          <h2 className={styles.title}>You Might Also Like</h2>
        </div>
      </div>

      <div className={styles.grid}>
        {products.map((item) => {
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

RelatedProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};
