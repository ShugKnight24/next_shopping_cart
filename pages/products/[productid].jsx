import Head from 'next/head';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  trackAddToCart,
  trackRemoveFromCart,
  trackViewItem,
} from '../../analytics/google';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';
import {
  getAllProducts,
  getProductById,
  getRelatedProducts,
} from '../../utils/productCatalog';

import {
  AlertTriangleIcon,
  CartIcon,
  CheckCircleIcon,
  ChevronRight,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  SparklesIcon,
  TimesCircleIcon,
  TrashIcon,
} from '../../Components/Icons';
import { ImageGallery } from '../../Components/Products/ImageGallery';
import { ProductTabs } from '../../Components/Products/ProductTabs';
import { RecentlyViewed } from '../../Components/Products/RecentlyViewed';
import { RelatedProducts } from '../../Components/Products/RelatedProducts';
import { StickyBuyBar } from '../../Components/Products/StickyBuyBar';
import { TrustBadges } from '../../Components/Products/TrustBadges';
import { Badge, RatingStars } from '../../Components/UI';
import { useToast } from '../../Components/UI/Toast';
import styles from '../../styles/pages/Products.module.css';

export const getStaticPaths = async () => {
  const all = getAllProducts();
  const pagePaths = all.map(({ itemid }) => ({
    params: {
      productid: itemid.toString(),
    },
  }));

  return {
    paths: pagePaths,
    fallback: false,
  };
};

export const getStaticProps = (context) => {
  const currentid = context.params.productid;
  const product = getProductById(currentid);

  if (!product) {
    return {
      notFound: true,
    };
  }

  const related = getRelatedProducts(product, 4);

  return {
    props: {
      currentProduct: product,
      relatedProducts: related,
    },
  };
};

export default function ProductID({ currentProduct, relatedProducts = [] }) {
  const { state, dispatch } = useContext(CartContext);
  const { inventory, cart } = state;
  const { showToast } = useToast();

  const safeProduct = currentProduct || {};
  const currentItem =
    getCurrentItem(inventory, safeProduct.itemid) || safeProduct;
  const isInCart = Boolean(getCurrentItem(cart, safeProduct.itemid));
  const cartItem = getCurrentItem(cart, safeProduct.itemid);
  const cartQuantity = cartItem?.quantity || 0;

  const disabledButton = currentItem.available === 0;
  const {
    description = '',
    itemid = '',
    manufacturer = '',
    price = 0,
    productName = '',
    rating = { average: 5, count: 0 },
    badges = [],
    variants = [],
    specifications = {},
    reviews = [],
    shipping = {},
    faqs = [],
    originalPrice = null,
    images = [],
    image = images[0] || '',
    category = '',
    available = currentItem.available ?? 1,
  } = safeProduct;

  const initialFavorite = Boolean(currentItem?.favorite);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const normalizedVariants = useMemo(() => {
    return (variants || []).map((v, idx) => {
      if (typeof v === 'string') {
        return { id: `var-${idx}-${v}`, name: v, priceModifier: 0 };
      }
      return {
        id: v?.id || `var-${idx}-${v?.name || idx}`,
        name: v?.name || String(v),
        priceModifier: v?.priceModifier || 0,
        ...v,
      };
    });
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState(
    normalizedVariants[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  // Dynamic price calculation based on selected variant modifier
  const modifier = selectedVariant?.priceModifier || 0;
  const effectivePrice = price + modifier;
  const effectiveOriginalPrice = originalPrice
    ? originalPrice + modifier
    : null;

  const isOnSale = badges.includes('sale') && effectiveOriginalPrice;
  const discountPercentage = isOnSale
    ? Math.round((1 - effectivePrice / effectiveOriginalPrice) * 100)
    : 0;

  useEffect(() => {
    if (currentProduct) {
      trackViewItem(currentProduct, selectedVariant);
    }
  }, [currentProduct, selectedVariant]);

  if (!currentProduct) {
    return (
      <div className="product-not-found" data-testid="product-not-found">
        <Head>
          <title>Product Not Found | Cart Commerce</title>
        </Head>
        <div
          style={{
            padding: '5rem 2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <AlertTriangleIcon size={32} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: '0.75rem',
            }}
          >
            Product Unavailable
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            The requested item could not be retrieved from our inventory or is
            currently out of circulation.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#1e3a5f',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <span>Back to All Products</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  function handleAddToCart(productId, qty = 1, variant = selectedVariant) {
    trackAddToCart(currentProduct, qty, variant);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId,
        quantity: qty,
        variant: variant?.name || variant || null,
        selectedVariant: variant,
      },
    });
    showToast(
      `Added ${qty} × ${productName}${variant ? ` (${variant.name || variant})` : ''} to cart`,
      'success'
    );
  }

  function handleRemoveFromCart(productId) {
    trackRemoveFromCart(currentProduct, cartQuantity);
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId,
      },
    });
    showToast(`Removed ${productName} from cart`, 'info');
  }

  function handleFavorite(productId) {
    dispatch({
      type: 'ADD_FAVORITE',
      payload: {
        productId,
      },
    });
    setIsFavorite(true);
    showToast(`Saved ${productName} to your favorites`, 'success');
  }

  function handleRemoveFavorite(productId) {
    dispatch({
      type: 'REMOVE_FAVORITE',
      payload: {
        productId,
      },
    });
    setIsFavorite(false);
    showToast(`Removed from favorites`, 'info');
  }

  function handleShare() {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      navigator
        .share({
          title: `${productName} | Shopping Cart`,
          text: `Check out ${productName} by ${manufacturer}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: images && images.length > 0 ? images : [image],
    description: description,
    sku: itemid,
    brand: {
      '@type': 'Brand',
      name: manufacturer,
    },
    category: category || undefined,
    offers: {
      '@type': 'Offer',
      url: `https://cart-commerce.vercel.app/products/${itemid}`,
      priceCurrency: 'USD',
      price: effectivePrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        available > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Cart Commerce',
      },
    },
    ...(rating && rating.average && rating.count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://cart-commerce.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://cart-commerce.vercel.app/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: productName,
        item: `https://cart-commerce.vercel.app/products/${itemid}`,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{`${productName} by ${manufacturer} | Cart Commerce`}</title>
        <meta name="description" content={description} />

        {/* OpenGraph Social Meta Tags */}
        <meta property="og:title" content={`${productName} | Cart Commerce`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={image} />
        <meta
          property="product:price:amount"
          content={String(effectivePrice)}
        />
        <meta property="product:price:currency" content="USD" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productName} | Cart Commerce`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <div className={styles.productsPage}>
        <div className={styles.productPage}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} className={styles.breadcrumbSeparator} />
            <Link href="/products">Products</Link>
            <ChevronRight size={12} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {productName}
            </span>
          </nav>

          <div className={styles.productContainer}>
            {/* Image Gallery with 3D Studio switch */}
            <div className={styles.productImages}>
              <ImageGallery
                images={images}
                productName={`${manufacturer} ${productName}`}
                product={currentProduct}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            </div>

            {/* Product Details Section */}
            <div className={styles.productDetails}>
              {/* Live Social Proof Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#b8860b',
                  background: 'rgba(184, 134, 11, 0.08)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '50px',
                  width: 'fit-content',
                }}
              >
                <SparklesIcon size={14} />
                <span>High demand — 14 shoppers viewing right now</span>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className={styles.productBadges}>
                  {badges.map((badge) => (
                    <Badge key={badge} variant={badge} />
                  ))}
                </div>
              )}

              {/* Brand & Name */}
              <div className={styles.productBrand}>
                <span className={styles.brandName}>{manufacturer}</span>
                <h1 className={styles.productName}>{productName}</h1>
              </div>

              {/* Reviews */}
              <div className={styles.productReviews}>
                <RatingStars rating={rating.average} size="md" showValue />
                <span className={styles.reviewCount}>
                  ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Description */}
              <p className={styles.productDescription}>{description}</p>

              {/* Price Row */}
              <div className={styles.productPricing}>
                <span className={styles.productPrice}>
                  {formatCurrency(effectivePrice)}
                </span>
                {isOnSale && (
                  <>
                    <span className={styles.originalPrice}>
                      {formatCurrency(effectiveOriginalPrice)}
                    </span>
                    <span className={styles.discountBadge}>
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status & Progress Bar */}
              <div className={styles.stockStatus}>
                {currentItem.available > 0 ? (
                  currentItem.available <= 5 ? (
                    <div>
                      <span className={styles.lowStock}>
                        <AlertTriangleIcon size={16} /> Only{' '}
                        {currentItem.available} left in stock — order soon
                      </span>
                      <div
                        style={{
                          marginTop: '0.5rem',
                          height: '6px',
                          background: '#fef3c7',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          maxWidth: '280px',
                        }}
                      >
                        <div
                          style={{
                            width: `${(currentItem.available / 5) * 100}%`,
                            height: '100%',
                            background: '#d97706',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className={styles.inStock}>
                      <CheckCircleIcon size={16} /> In Stock (
                      {currentItem.available} units available)
                    </span>
                  )
                ) : (
                  <span className={styles.outOfStock}>
                    <TimesCircleIcon size={16} /> Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Interactive Variants Selector */}
              {normalizedVariants.length > 0 && (
                <div className={styles.productVariants}>
                  <h3 className={styles.variantsTitle}>Options & Colorways</h3>
                  <div className={styles.variantOptions}>
                    {normalizedVariants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`${styles.variantButton} ${selectedVariant?.id === variant.id ? styles.variantButtonSelected : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.name}
                        {variant.priceModifier > 0 && (
                          <span className={styles.variantPrice}>
                            +{formatCurrency(variant.priceModifier)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <h3 className={styles.quantityTitle}>Quantity</h3>
                <div className={styles.quantityControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={14} />
                  </button>
                  <input
                    className={styles.qtyInput}
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
                            parseInt(e.target.value, 10) || 1
                          )
                        )
                      )
                    }
                    aria-label="Quantity"
                  />
                  <button
                    className={styles.qtyBtn}
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
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: '#16a34a',
                      fontWeight: 600,
                    }}
                  >
                    {cartQuantity} currently in cart
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className={styles.productActions}>
                <button
                  className={`${styles.addToCartBtn} ${isInCart ? styles.inCartBtn : ''}`}
                  onClick={() =>
                    handleAddToCart(itemid, quantity, selectedVariant)
                  }
                  disabled={disabledButton}
                >
                  <CartIcon size={18} />
                  {isInCart ? 'Add More to Cart' : 'Add to Cart'}
                </button>

                <button
                  className={`${styles.secondaryActionBtn} ${isFavorite ? styles.favoriteActiveBtn : ''}`}
                  onClick={() =>
                    isFavorite
                      ? handleRemoveFavorite(itemid)
                      : handleFavorite(itemid)
                  }
                  aria-label={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                  title={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <HeartIcon filled={isFavorite} size={20} />
                </button>

                <button
                  className={styles.secondaryActionBtn}
                  onClick={handleShare}
                  aria-label="Share product"
                  title="Share this product"
                >
                  <ShareIcon size={18} />
                </button>
              </div>

              {isInCart && (
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0.4rem 0',
                    width: 'fit-content',
                  }}
                  onClick={() => handleRemoveFromCart(itemid)}
                >
                  <TrashIcon size={16} /> Remove from Cart
                </button>
              )}

              {/* Value Proposition Trust Badges */}
              <TrustBadges />
            </div>
          </div>

          {/* 5-Panel Product Tabs */}
          <ProductTabs
            product={currentProduct}
            specifications={specifications}
            shipping={shipping}
            reviews={reviews}
            faqs={faqs}
          />

          {/* Related & Recommended Products */}
          <RelatedProducts products={relatedProducts} />

          {/* Recently Viewed Session History */}
          <RecentlyViewed currentProductId={itemid} />

          {/* Floating Sticky Buy Bar */}
          <StickyBuyBar
            product={currentProduct}
            selectedVariant={selectedVariant}
            totalPrice={effectivePrice}
            onAddToCart={() =>
              handleAddToCart(itemid, quantity, selectedVariant)
            }
            disabled={disabledButton}
          />
        </div>
      </div>
    </>
  );
}

ProductID.propTypes = {
  currentProduct: PropTypes.object.isRequired,
  relatedProducts: PropTypes.arrayOf(PropTypes.object),
};
