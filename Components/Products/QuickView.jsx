import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { trackAddToCart } from '../../analytics/google';
import { useToast } from '../UI/Toast';
import { BadgeGroup } from '../UI/Badge';
import { RatingStars } from '../UI/RatingStars';
import styles from './QuickView.module.css';

export function QuickView({ product, isOpen, onClose }) {
  const { dispatch } = useContext(CartContext);
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0] || null
  );
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !product) return null;

  const {
    itemid,
    productName,
    manufacturer,
    price,
    originalPrice,
    image,
    images = [],
    available,
    badges = [],
    rating,
    description,
    variants = [],
    specifications = {},
  } = product;

  const isOnSale = originalPrice && originalPrice > price;
  const isOutOfStock = available === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);

    trackAddToCart(product, quantity, selectedVariant);

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: itemid,
        quantity: quantity,
        variant: selectedVariant?.name || selectedVariant || null,
        selectedVariant,
      },
    });

    showToast(
      `Added ${quantity} × ${productName}${selectedVariant ? ` (${selectedVariant.name || selectedVariant})` : ''} to bag`,
      'success'
    );

    const timer = setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 400);

    return () => clearTimeout(timer);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Product image */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {badges.length > 0 && (
              <div className={styles.badges}>
                <BadgeGroup badges={badges} />
              </div>
            )}
            <img src={image} alt={`${manufacturer} ${productName}`} />
          </div>
          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.slice(0, 4).map((img, index) => (
                <button key={index} className={styles.thumbnail}>
                  <img src={img} alt={`${productName} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details */}
        <div className={styles.detailsSection}>
          <span className={styles.brand}>{manufacturer}</span>
          <h2 className={styles.name}>{productName}</h2>

          {rating && (
            <div className={styles.rating}>
              <RatingStars rating={rating.average} count={rating.count} />
            </div>
          )}

          <div className={styles.priceContainer}>
            <span className={`${styles.price} ${isOnSale ? styles.sale : ''}`}>
              {formatCurrency(price)}
            </span>
            {isOnSale && (
              <>
                <span className={styles.originalPrice}>
                  {formatCurrency(originalPrice)}
                </span>
                <span className={styles.discount}>
                  Save {Math.round((1 - price / originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className={styles.description}>{description}</p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className={styles.variants}>
              <label className={styles.label}>
                Color: <span>{selectedVariant?.name}</span>
              </label>
              <div className={styles.variantOptions}>
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`${styles.variantBtn} ${
                      selectedVariant?.id === variant.id ? styles.selected : ''
                    } ${!variant.available ? styles.unavailable : ''}`}
                    onClick={() =>
                      variant.available && setSelectedVariant(variant)
                    }
                    disabled={!variant.available}
                    title={variant.name}
                  >
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: variant.value }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className={styles.quantitySection}>
            <label className={styles.label}>Quantity:</label>
            <div className={styles.quantityPicker}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max={available}
              />
              <button
                onClick={() => setQuantity(Math.min(available, quantity + 1))}
                disabled={quantity >= available}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <span className={styles.stock}>{available} in stock</span>
          </div>

          {/* Specifications preview */}
          {Object.keys(specifications).length > 0 && (
            <div className={styles.specs}>
              <h4>Key Specifications</h4>
              <dl>
                {Object.entries(specifications)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div key={key} className={styles.specRow}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={`${styles.addToCart} ${isAdding ? styles.adding : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
            >
              {isAdding ? (
                <>
                  <svg
                    className={styles.checkIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added to Cart!
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart — {formatCurrency(price * quantity)}
                </>
              )}
            </button>
            <Link
              href={`/products/${itemid}`}
              className={styles.viewDetails}
              onClick={onClose}
            >
              View Full Details
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

QuickView.propTypes = {
  product: PropTypes.shape({
    itemid: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    manufacturer: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    image: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    available: PropTypes.number,
    badges: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    description: PropTypes.string,
    variants: PropTypes.array,
    specifications: PropTypes.object,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
