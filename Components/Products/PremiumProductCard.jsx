import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { BadgeGroup } from '../UI/Badge';
import { RatingStars } from '../UI/RatingStars';
import { BoltIcon } from '../Icons';
import styles from './PremiumProductCard.module.css';

export function PremiumProductCard({
  product,
  onQuickView,
  onAddToCart,
  showQuickActions = true,
}) {
  const { dispatch } = useContext(CartContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.favorite || false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const {
    itemid,
    productName,
    manufacturer,
    price,
    originalPrice,
    image,
    available,
    badges = [],
    rating,
    shortDescription,
  } = product;

  const isOnSale = originalPrice && originalPrice > price;
  const isLowStock = available > 0 && available <= 3;
  const isOutOfStock = available === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAddingToCart) return;

    setIsAddingToCart(true);

    dispatch({
      type: 'ADD_ITEM',
      payload: { productId: itemid },
    });

    if (onAddToCart) {
      onAddToCart(product);
    }

    // Visual feedback delay
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsFavorite(!isFavorite);

    dispatch({
      type: isFavorite ? 'REMOVE_FAVORITE' : 'ADD_FAVORITE',
      payload: { productId: itemid },
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onQuickView) {
      onQuickView(product);
    }
  };

  // Combine static badges with dynamic ones
  const allBadges = [...badges, ...(isLowStock ? ['lowstock'] : [])];

  return (
    <article
      className={`${styles.card} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${itemid}`} className={styles.imageWrapper}>
        {/* Badges */}
        {allBadges.length > 0 && (
          <div className={styles.badges}>
            <BadgeGroup badges={allBadges} max={2} />
          </div>
        )}

        {/* Favorite button */}
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
          onClick={handleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Product image */}
        <div className={styles.imageContainer}>
          <img
            src={image}
            alt={`${manufacturer} ${productName}`}
            className={styles.image}
            loading="lazy"
          />
        </div>

        {/* Quick actions overlay */}
        {showQuickActions && (
          <div className={styles.quickActions}>
            <button
              className={styles.quickViewBtn}
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Quick View
            </button>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className={styles.outOfStock}>
            <span>Out of Stock</span>
          </div>
        )}
      </Link>

      <div className={styles.content}>
        {/* Brand */}
        <span className={styles.brand}>{manufacturer}</span>

        {/* Product name */}
        <h3 className={styles.name}>
          <Link href={`/products/${itemid}`}>{productName}</Link>
        </h3>

        {/* Rating */}
        {rating && (
          <div className={styles.rating}>
            <RatingStars
              rating={rating.average}
              count={rating.count}
              size="small"
            />
          </div>
        )}

        {/* Short description */}
        {shortDescription && (
          <p className={styles.description}>{shortDescription}</p>
        )}

        {/* Price */}
        <div className={styles.priceContainer}>
          <span className={`${styles.price} ${isOnSale ? styles.sale : ''}`}>
            {formatCurrency(price)}
          </span>
          {isOnSale && (
            <span className={styles.originalPrice}>
              {formatCurrency(originalPrice)}
            </span>
          )}
          {isOnSale && (
            <span className={styles.discount}>
              -{Math.round((1 - price / originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {isLowStock && !isOutOfStock && (
          <p className={styles.stockWarning}>
            <BoltIcon size={14} />
            <span>Only {available} left in stock</span>
          </p>
        )}

        {/* Add to cart button */}
        <button
          className={`${styles.addToCart} ${isOutOfStock ? styles.disabled : ''} ${isAddingToCart ? styles.adding : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
        >
          {isAddingToCart ? (
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
              Added!
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
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}

PremiumProductCard.propTypes = {
  product: PropTypes.shape({
    itemid: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    manufacturer: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    image: PropTypes.string.isRequired,
    available: PropTypes.number,
    badges: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    shortDescription: PropTypes.string,
    favorite: PropTypes.bool,
  }).isRequired,
  onQuickView: PropTypes.func,
  onAddToCart: PropTypes.func,
  showQuickActions: PropTypes.bool,
};
