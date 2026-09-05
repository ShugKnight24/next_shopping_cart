import Head from 'next/head';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import items from '../../data/items.json';
import products from '../../data/products.json';
import techItems from '../../data/techItems.json';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';

import { ImageGallery } from '../../Components/Products/ImageGallery';
import { ProductTabs } from '../../Components/Products/ProductTabs';
import { ReviewList } from '../../Components/Products/ReviewCard';
import { Badge, RatingStars } from '../../Components/UI';
import { useToast } from '../../Components/UI/Toast';
import styles from '../../styles/pages/Products.module.css';
import {
  ChevronRight,
  AlertTriangleIcon,
  CheckCircleIcon,
  TimesCircleIcon,
  MinusIcon,
  PlusIcon,
  CartIcon,
  HeartIcon,
  TrashIcon,
  TruckIcon,
  CalendarIcon,
} from '../../Components/Icons';

// Merge legacy items with enhanced products data
const productList = [...items, ...techItems];

// Helper to find enhanced product data
const getEnhancedProduct = (itemid) => {
  return products.find((p) => p.itemid === itemid);
};

export const getStaticPaths = async () => {
  const pagePaths = productList.map(({ itemid }) => {
    return {
      params: {
        productid: itemid.toString(),
      },
    };
  });

  return {
    paths: pagePaths,
    fallback: false,
  };
};

export const getStaticProps = (context) => {
  const currentid = context.params.productid;
  const currentProduct = getCurrentItem(productList, currentid);
  const enhancedData = getEnhancedProduct(currentid);

  return {
    props: {
      currentProduct: currentProduct,
      enhancedProduct: enhancedData || null,
    },
  };
};

export default function ProductID({ currentProduct, enhancedProduct }) {
  const { state, dispatch } = useContext(CartContext);
  const { inventory, cart } = state;
  const { showToast } = useToast();

  const currentItem = getCurrentItem(inventory, currentProduct.itemid);
  const isInCart = getCurrentItem(cart, currentProduct.itemid) ? true : false;
  const cartItem = getCurrentItem(cart, currentProduct.itemid);
  const cartQuantity = cartItem?.quantity || 0;

  const disabledButton = currentItem
    ? currentItem.available === 0
    : currentProduct?.available === 0;
  const { description, image, itemid, manufacturer, price, productName } =
    currentProduct;

  // Use enhanced product data if available
  const rating = enhancedProduct?.rating || { average: 5.0, count: 10 };
  const badges = enhancedProduct?.badges || [];
  const variants = enhancedProduct?.variants || [];
  const specifications = enhancedProduct?.specifications || {};
  const reviews = enhancedProduct?.reviews || [];
  const shipping = enhancedProduct?.shipping || {};
  const originalPrice = enhancedProduct?.originalPrice;
  const rawImages = enhancedProduct?.images || enhancedProduct?.additionalImages || [];

  // Build images array for gallery
  const allImages = Array.from(new Set([image, ...rawImages])).filter(Boolean);

  const initialFavorite = Boolean(currentItem?.favorite);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);

  const isOnSale = badges.includes('sale') && originalPrice;
  const discountPercentage = isOnSale
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  function handleAddToCart(itemid, qty = 1) {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: itemid,
        quantity: qty,
      },
    });
    showToast(`Added ${qty} ${productName} to cart`, 'success');
  }

  function handleRemoveFromCart(itemid) {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId: itemid,
      },
    });
    showToast(`Removed ${productName} from cart`, 'info');
  }

  function handleFavorite(itemid) {
    dispatch({
      type: 'ADD_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
    setIsFavorite(true);
    showToast(`Added ${productName} to favorites`, 'success');
  }

  function handleRemoveFavorite(itemid) {
    dispatch({
      type: 'REMOVE_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
    setIsFavorite(false);
    showToast(`Removed from favorites`, 'info');
  }

  return (
    <>
      <Head>
        <title>{productName} | Product Page</title>
        <meta name="description" content={description} />
      </Head>
      <div className={`${styles.productsPage} product-page premium`}>
        {/* Breadcrumbs */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <Link href="/products">Products</Link>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span aria-current="page">{productName}</span>
        </nav>

        <div className="product-container">
          {/* Image Gallery Section */}
          <div className="product-images">
            <ImageGallery
              images={allImages}
              productName={`${manufacturer} ${productName}`}
            />
          </div>

          {/* Product Details Section */}
          <div className="product-details">
            {/* Badges */}
            {badges.length > 0 && (
              <div className="product-badges">
                {badges.map((badge) => (
                  <Badge key={badge} variant={badge} />
                ))}
              </div>
            )}

            {/* Brand & Name */}
            <div className="product-brand">
              <span className="brand-name">{manufacturer}</span>
              <h1 className="product-name">{productName}</h1>
            </div>

            {/* Reviews */}
            <div className="product-reviews">
              <RatingStars rating={rating.average} size="md" showValue />
              <span className="review-count">
                ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Description */}
            <p className="product-description">{description}</p>

            {/* Price */}
            <div className="product-pricing">
              <span className="product-price">{formatCurrency(price)}</span>
              {isOnSale && (
                <>
                  <span className="original-price">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="discount-badge">-{discountPercentage}%</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {currentItem.available > 0 ? (
                currentItem.available <= 5 ? (
                  <span className="low-stock">
                    <AlertTriangleIcon size={16} /> Only{' '}
                    {currentItem.available} left in stock
                  </span>
                ) : (
                  <span className="in-stock">
                    <CheckCircleIcon size={16} /> In Stock (
                    {currentItem.available} available)
                  </span>
                )
              ) : (
                <span className="out-of-stock">
                  <TimesCircleIcon size={16} /> Out of Stock
                </span>
              )}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="product-variants">
                <h3>Options</h3>
                <div className="variant-options">
                  {variants.map((variant) => (
                    <button
                      key={variant.name}
                      className={`variant-button ${selectedVariant?.name === variant.name ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.name}
                      {variant.priceModifier > 0 && (
                        <span className="variant-price">
                          +{formatCurrency(variant.priceModifier)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <MinusIcon size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentItem.available}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          currentItem.available,
                          parseInt(e.target.value) || 1
                        )
                      )
                    )
                  }
                  aria-label="Quantity"
                />
                <button
                  className="qty-btn"
                  onClick={() =>
                    setQuantity(Math.min(currentItem.available, quantity + 1))
                  }
                  disabled={quantity >= currentItem.available}
                  aria-label="Increase quantity"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
              {cartQuantity > 0 && (
                <span className="cart-quantity-note">
                  {cartQuantity} already in cart
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button
                className={`button add-cart-button primary ${disabledButton ? 'disabled' : ''}`}
                onClick={() => handleAddToCart(itemid, quantity)}
                disabled={disabledButton}
              >
                <CartIcon size={18} />
                {isInCart ? 'Add More to Cart' : 'Add to Cart'}
              </button>

              <button
                className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                onClick={() =>
                  isFavorite
                    ? handleRemoveFavorite(itemid)
                    : handleFavorite(itemid)
                }
                aria-label={
                  isFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <HeartIcon filled={isFavorite} size={20} />
              </button>
            </div>

            {isInCart && (
              <button
                className="button remove-item-link"
                onClick={() => handleRemoveFromCart(itemid)}
              >
                <TrashIcon size={16} /> Remove from Cart
              </button>
            )}

            {/* Shipping Info */}
            {shipping.freeShipping !== undefined && (
              <div className="shipping-info">
                {shipping.freeShipping ? (
                  <p className="free-shipping">
                    <TruckIcon size={16} /> Free Shipping
                  </p>
                ) : (
                  shipping.shippingCost && (
                    <p>
                      <TruckIcon size={16} /> Shipping:{' '}
                      {formatCurrency(shipping.shippingCost)}
                    </p>
                  )
                )}
                {shipping.estimatedDelivery && (
                  <p className="delivery-estimate">
                    <CalendarIcon size={16} /> Estimated delivery:{' '}
                    {shipping.estimatedDelivery}
                  </p>
                )}
              </div>
            )}

            {/* Quick Specs */}
            {Object.keys(specifications).length > 0 && (
              <div className="quick-specs">
                <h3>Key Specifications</h3>
                <dl>
                  {Object.entries(specifications)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key} className="spec-row">
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Product Tabs - Specifications, Reviews, etc. */}
        <ProductTabs product={currentProduct} specifications={specifications} />

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="reviews-section">
            <h2>Customer Reviews</h2>
            <ReviewList reviews={reviews} />
          </section>
        )}
      </div>
    </>
  );
}

ProductID.propTypes = {
  currentProduct: PropTypes.shape({
    description: PropTypes.string,
    image: PropTypes.string,
    favorite: PropTypes.bool,
    isInCart: PropTypes.bool,
    itemid: PropTypes.string,
    manufacturer: PropTypes.string,
    price: PropTypes.number,
    productName: PropTypes.string,
  }),
  enhancedProduct: PropTypes.shape({
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    badges: PropTypes.arrayOf(PropTypes.string),
    variants: PropTypes.arrayOf(PropTypes.object),
    specifications: PropTypes.object,
    reviews: PropTypes.array,
    shipping: PropTypes.object,
    originalPrice: PropTypes.number,
    additionalImages: PropTypes.arrayOf(PropTypes.string),
  }),
};
