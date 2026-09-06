import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/cartUtils';
import { CartIcon, AlertTriangleIcon, CheckCircleIcon } from '../Icons';
import styles from './StickyBuyBar.module.css';

export function StickyBuyBar({
  product,
  selectedVariant,
  totalPrice,
  onAddToCart,
  disabled = false,
  triggerSelector = '.product-actions',
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const triggerEl = document.querySelector(triggerSelector);
      if (!triggerEl) {
        setIsVisible(window.scrollY > 400);
        return;
      }
      const rect = triggerEl.getBoundingClientRect();
      // Show when the main add-to-cart button has scrolled past the top of viewport
      setIsVisible(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerSelector]);

  if (!product) return null;

  const { productName, manufacturer, image, available } = product;
  const priceToDisplay = totalPrice !== undefined ? totalPrice : product.price;
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available <= 5;

  return (
    <div
      className={`${styles.stickyBar} ${isVisible ? styles.visible : ''}`}
      data-testid="sticky-buy-bar"
      aria-hidden={!isVisible}
    >
      <div className={styles.productInfo}>
        <img
          src={image || '/images/placeholder.svg'}
          alt={productName}
          className={styles.thumbnail}
        />
        <div className={styles.meta}>
          <span className={styles.brand}>{manufacturer}</span>
          <h4 className={styles.name}>{productName}</h4>
          {selectedVariant && (
            <span className={styles.variantNote}>
              Selected: {selectedVariant.name || selectedVariant}
            </span>
          )}
        </div>
      </div>

      <div className={styles.actionSection}>
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            {formatCurrency(priceToDisplay)}
          </span>
          {isOutOfStock ? (
            <span className={`${styles.stockBadge} ${styles.lowStock}`}>
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className={`${styles.stockBadge} ${styles.lowStock}`}>
              <AlertTriangleIcon size={12} /> Only {available} left
            </span>
          ) : (
            <span className={styles.stockBadge}>
              <CheckCircleIcon size={12} /> In Stock
            </span>
          )}
        </div>

        <button
          className={styles.addCartBtn}
          onClick={onAddToCart}
          disabled={disabled || isOutOfStock}
          aria-label="Add product to cart"
        >
          <CartIcon size={16} />
          <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}

StickyBuyBar.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string,
    manufacturer: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.number,
    available: PropTypes.number,
  }),
  selectedVariant: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  totalPrice: PropTypes.number,
  onAddToCart: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  triggerSelector: PropTypes.string,
};
