import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { QuickView } from './QuickView';
import { HeartIcon } from '../Icons';

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

  // Build product object for QuickView
  const productData = {
    itemid,
    productName,
    manufacturer,
    price,
    originalPrice,
    image,
    available,
    badges: badge ? [badge, ...badges] : badges,
    rating,
    description,
    variants,
    specifications,
  };

  function handleAddToCart(itemid, qty = 1) {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: itemid,
        quantity: qty,
      },
    });
  }

  function handleRemoveFromCart(itemid) {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId: itemid,
      },
    });
  }

  function handleDecreaseQuantity(itemid) {
    dispatch({
      type: 'DECREASE_QUANTITY',
      payload: {
        productId: itemid,
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
  const trimmedLowerProductName = productName.toLowerCase().replace(/\s+/g, '');
  const canAddMore = cartQuantity < available;

  // Determine stock status
  const getStockStatus = () => {
    if (available === 0) return 'out-of-stock';
    if (available <= 5) return 'low-stock';
    return '';
  };

  return (
    <>
      <div className="product">
        {/* Image Section */}
        <div className="product-image-wrapper">
          <img
            className={`product-image ${trimmedLowerProductName}`}
            src={image}
            alt={`${productName} made by ${manufacturer}`}
          />
          <div className="image-overlay" />

          {/* Quick View Button */}
          <button
            className="quick-view-btn"
            onClick={() => setShowQuickView(true)}
            aria-label={`Quick view ${productName}`}
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

          {/* Product Badge */}
          {badge && (
            <div className="product-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>{badge}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="product-content">
          {/* Name & Favorite */}
          <div className="name-favorite">
            <h2 className="product-name">{productName}</h2>
            {favorite ? (
              <button
                className="favorite-button is-favorite remove-favorite"
                onClick={() => handleRemoveFavorite()}
                aria-label="Remove from favorites"
              >
                <HeartIcon filled={true} size={18} />
              </button>
            ) : (
              <button
                className="favorite-button add-favorite"
                onClick={() => handleFavorite()}
                aria-label="Add to favorites"
              >
                <HeartIcon filled={false} size={18} />
              </button>
            )}
          </div>

          {/* Manufacturer Tag */}
          <div className="product-manufacturer">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 7h-9M14 17H5" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
            <span>{manufacturer}</span>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <p className="product-description">{description}</p>

            {/* Price & Availability */}
            <div className="price-availability">
              <p className="product-price">{formatCurrency(price)}</p>
              <p className="product-quantity">
                <span className="quantity-label">In Stock:</span>
                <span className={`quantity-value ${getStockStatus()}`}>
                  {available === 0 ? 'Out' : available}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="product-actions">
              {/* Quantity Controls - Only shown when item is in cart */}
              {isInCart && (
                <div className="quantity-controls">
                  <span className="quantity-label-text">Quantity in Cart</span>
                  <div className="quantity-stepper">
                    <button
                      className={`quantity-btn ${cartQuantity <= 1 ? 'remove-btn' : ''}`}
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
                    >
                      {cartQuantity <= 1 ? (
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      ) : (
                        '−'
                      )}
                    </button>
                    <span className="quantity-display">{cartQuantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleAddToCart(itemid)}
                      disabled={!canAddMore}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <button className="action-btn more-info-button">
                <Link href={`/products/${itemid.toString()}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  View Details
                </Link>
              </button>

              {/* Add to Cart / In Cart Button */}
              {isInCart ? (
                <button className="action-btn in-cart-button" disabled>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  In Cart
                </button>
              ) : (
                <button
                  className={`action-btn add-cart-button ${disabledButton ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(itemid)}
                  disabled={disabledButton}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    <path d="M12 9v6M9 12h6" />
                  </svg>
                  {disabledButton ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
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
