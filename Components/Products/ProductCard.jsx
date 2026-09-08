import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { trackAddToCart, trackRemoveFromCart, trackSelectItem } from '../../analytics/google';
import { QuickView } from './QuickView';
import { RatingStars } from '../UI/RatingStars';
import styles from './ProductCard.module.css';
import {
  HeartIcon,
  CartIcon,
  TrashIcon,
  CheckCircleIcon,
  EyeIcon,
  InfoIcon,
  TagIcon,
  SparklesIcon,
} from '../Icons';

export function ProductCard({
  available,
  description,
  image,
  favorite,
  isInCart,
  itemid,
  manufacturer,
  price,
  productName,
  badge,
  cartQuantity = 0,
  rating,
  originalPrice,
  badges = [],
  variants = [],
  specifications = {},
}) {
  const { dispatch } = useContext(CartContext);
  const [showQuickView, setShowQuickView] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const displayImage = hasImgError || !image ? '/images/placeholder.svg' : image;

  // Build product object for QuickView
  const productData = {
    itemid,
    productName,
    manufacturer,
    price,
    originalPrice,
    image: displayImage,
    available,
    badges: badge ? [badge, ...badges] : badges,
    rating,
    description,
    variants,
    specifications,
  };

  function handleAddToCart(productId, qty = 1) {
    trackAddToCart(productData, qty);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId,
        quantity: qty,
      },
    });
  }

  function handleRemoveFromCart(productId) {
    trackRemoveFromCart(productData, 1);
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId,
      },
    });
  }

  function handleDecreaseQuantity(productId) {
    dispatch({
      type: 'DECREASE_QUANTITY',
      payload: {
        productId,
      },
    });
  }

  function handleFavorite() {
    dispatch({
      type: 'ADD_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
  }

  function handleRemoveFavorite() {
    dispatch({
      type: 'REMOVE_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
  }

  const disabledButton = available === 0;
  const trimmedLowerProductName = (productName || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  const canAddMore = cartQuantity < available;

  // Determine stock status
  const getStockStatus = () => {
    if (available === 0) return 'out-of-stock';
    if (available <= 5) return 'low-stock';
    return '';
  };

  const getStockBadgeClass = () => {
    if (available === 0) return styles.stockBadgeOut;
    if (available <= 5) return styles.stockBadgeLow;
    return '';
  };

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <>
      <div className={`${styles.productCard} product`}>
        {/* Image Presentation Stage */}
        <div className={`${styles.imageWrapper} product-image-wrapper`}>
          <img
            className={`${styles.image} product-image ${trimmedLowerProductName}`}
            src={displayImage}
            alt={`${productName} made by ${manufacturer}`}
            loading="lazy"
            onError={() => setHasImgError(true)}
          />
          <div className={`${styles.imageOverlay} image-overlay`} />

          {/* Quick View Button */}
          <button
            className={`${styles.quickViewBtn} quick-view-btn`}
            onClick={() => setShowQuickView(true)}
            aria-label={`Quick view ${productName}`}
            type="button"
          >
            <EyeIcon size={16} strokeWidth={2} />
            <span>Quick View</span>
          </button>

          {/* Badges Container */}
          <div className={`${styles.badgeGroup} badge-group`}>
            {discountPercent && (
              <div
                className={`${styles.badge} ${styles.saleBadge} product-badge sale-badge`}
              >
                <TagIcon size={12} strokeWidth={2} />
                <span>-{discountPercent}%</span>
              </div>
            )}
            {badge && (
              <div className={`${styles.badge} product-badge`}>
                <SparklesIcon size={12} />
                <span>{badge}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className={`${styles.cardContent} product-content`}>
          {/* Header Row: Title & Favorite */}
          <div className={`${styles.headerRow} name-favorite`}>
            <h2 className={`${styles.productTitle} product-name`} title={productName}>
              {productName}
            </h2>
            {favorite ? (
              <button
                className={`${styles.favoriteBtn} ${styles.favoriteBtnActive} favorite-button is-favorite remove-favorite`}
                onClick={handleRemoveFavorite}
                aria-label="Remove from favorites"
                type="button"
              >
                <HeartIcon filled={true} size={18} />
              </button>
            ) : (
              <button
                className={`${styles.favoriteBtn} favorite-button add-favorite`}
                onClick={handleFavorite}
                aria-label="Add to favorites"
                type="button"
              >
                <HeartIcon filled={false} size={18} />
              </button>
            )}
          </div>

          {/* Manufacturer & Rating Meta Row */}
          <div className={`${styles.metaRow} product-meta-row`}>
            <div className={`${styles.manufacturerTag} product-manufacturer`}>
              <TagIcon size={12} strokeWidth={2} />
              <span>{manufacturer}</span>
            </div>
            {rating && (
              <div className={`${styles.ratingStars} product-rating-stars`}>
                <RatingStars
                  rating={rating.average || 5.0}
                  count={rating.count || 0}
                  size="small"
                  showCount={true}
                />
              </div>
            )}
          </div>

          {/* Product Description */}
          <p className={`${styles.description} product-description`}>
            {description}
          </p>

          {/* Price & Availability Row */}
          <div className={`${styles.priceRow} price-availability`}>
            <div className={`${styles.priceStack} price-stack`}>
              <p className={`${styles.price} product-price`}>
                {formatCurrency(price)}
              </p>
              {originalPrice && originalPrice > price && (
                <span
                  className={`${styles.originalPrice} product-original-price`}
                >
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            <div className={`${styles.stockStatus} product-quantity`}>
              <span className={`${styles.stockLabel} quantity-label`}>
                In Stock:
              </span>
              <span
                className={`${styles.stockBadge} ${getStockBadgeClass()} ${getStockStatus()} quantity-value`}
              >
                {available === 0 ? 'Out' : available}
              </span>
            </div>
          </div>

          {/* Action Buttons & Stepper */}
          <div className={`${styles.actionsRow} product-actions`}>
            {/* Quantity Controls - Only shown when item is in cart */}
            {isInCart && (
              <div className={`${styles.quantityControls} quantity-controls`}>
                <span className={`${styles.quantityLabel} quantity-label-text`}>
                  In Cart
                </span>
                <div className={`${styles.quantityStepper} quantity-stepper`}>
                  <button
                    className={`${styles.stepperBtn} ${cartQuantity <= 1 ? styles.removeBtn : ''} quantity-btn`}
                    onClick={() =>
                      cartQuantity <= 1
                        ? handleRemoveFromCart(itemid)
                        : handleDecreaseQuantity(itemid)
                    }
                    aria-label={
                      cartQuantity <= 1
                        ? 'Remove from cart'
                        : 'Decrease quantity'
                    }
                    type="button"
                  >
                    {cartQuantity <= 1 ? (
                      <TrashIcon size={15} strokeWidth={2} />
                    ) : (
                      '−'
                    )}
                  </button>
                  <span
                    className={`${styles.stepperValue} quantity-display`}
                  >
                    {cartQuantity}
                  </span>
                  <button
                    className={`${styles.stepperBtn} quantity-btn`}
                    onClick={() => handleAddToCart(itemid)}
                    disabled={!canAddMore}
                    aria-label="Increase quantity"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* View Details Link */}
            <Link
              href={`/products/${itemid.toString()}`}
              className={`${styles.actionBtn} ${styles.detailsBtn} action-btn more-info-button`}
              onClick={() => trackSelectItem(productData)}
            >
              <InfoIcon size={16} strokeWidth={2} />
              <span>View Details</span>
            </Link>

            {/* Add to Cart / In Cart Button */}
            {isInCart ? (
              <button
                className={`${styles.actionBtn} ${styles.inCartBtn} action-btn in-cart-button`}
                disabled
                type="button"
              >
                <CheckCircleIcon size={16} strokeWidth={2} />
                <span>In Cart</span>
              </button>
            ) : (
              <button
                className={`${styles.actionBtn} ${disabledButton ? styles.outOfStockBtn : styles.cartBtn} action-btn add-cart-button`}
                onClick={() => handleAddToCart(itemid)}
                disabled={disabledButton}
                type="button"
              >
                <CartIcon size={16} strokeWidth={2} />
                <span>{disabledButton ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickView
        product={productData}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}

ProductCard.propTypes = {
  available: PropTypes.number,
  description: PropTypes.string,
  image: PropTypes.string,
  favorite: PropTypes.bool,
  isInCart: PropTypes.bool,
  itemid: PropTypes.string,
  manufacturer: PropTypes.string,
  price: PropTypes.number,
  productName: PropTypes.string,
  badge: PropTypes.string,
  cartQuantity: PropTypes.number,
  rating: PropTypes.shape({
    average: PropTypes.number,
    count: PropTypes.number,
  }),
  originalPrice: PropTypes.number,
  badges: PropTypes.arrayOf(PropTypes.string),
  variants: PropTypes.array,
  specifications: PropTypes.object,
};
