import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useToast } from '../UI/Toast';
import {
  calculateDiscount,
  formatCurrency,
  totalPrice,
  totalQuantity,
} from '../../utils/cartUtils';
import {
  trackApplyPromotion,
  trackBeginCheckout,
  trackRemoveFromCart,
  trackViewCart,
} from '../../analytics/google';
import { CloseIcon, CartIcon, TrashIcon, CheckCircleIcon } from '../Icons';
import styles from './CartDrawer.module.css';

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const router = useRouter();
  const { state, dispatch, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { cart = [], promo = null } = state || {};
  const { showToast } = useToast();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const rawSubtotal = totalPrice(cart);
  const discountAmount = calculateDiscount(rawSubtotal, promo);
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const itemsCount = totalQuantity(cart);
  const freeShippingProgress = Math.min(
    100,
    (rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100
  );
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - rawSubtotal;

  useEffect(() => {
    if (isCartOpen && cart.length > 0) {
      trackViewCart(cart, subtotal);
    }
    // Track view_cart event only when drawer opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen]);

  const handleQuantityChange = (productId, newQty) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        productId,
        quantity: newQty,
      },
    });
  };

  const handleRemoveItem = (productId, productName) => {
    const itemToRemove = cart.find((i) => i.itemid === productId);
    if (itemToRemove) {
      trackRemoveFromCart(itemToRemove, itemToRemove.quantity);
    }
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId },
    });
    showToast(`Removed ${productName} from bag`, 'info');
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'WELCOME10') {
      trackApplyPromotion(cleanCode, 10);
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: cleanCode, discountPercent: 10 },
      });
      setPromoInput('');
      setPromoError('');
      showToast('10% discount applied!', 'success');
    } else if (cleanCode === 'SAVE20') {
      trackApplyPromotion(cleanCode, 20);
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: cleanCode, discountPercent: 20 },
      });
      setPromoInput('');
      setPromoError('');
      showToast('20% discount applied!', 'success');
    } else {
      setPromoError('Invalid promo code. Try WELCOME10 or SAVE20');
    }
  };

  const handleRemovePromo = () => {
    dispatch({ type: 'REMOVE_PROMO' });
    showToast('Promo code removed', 'info');
  };

  const handleCheckoutClick = () => {
    trackBeginCheckout(cart, subtotal, promo?.code);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleViewCartClick = () => {
    setIsCartOpen(false);
    router.push('/cart');
  };

  if (!isCartOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h2>Shopping Bag</h2>
            <span className={styles.countBadge}>
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className={styles.shippingMeter}>
          <div className={styles.shippingMessage}>
            {amountToFreeShipping <= 0 ? (
              <span className={styles.freeSuccess}>
                <CheckCircleIcon size={16} />
                <span>You unlocked <strong>Free Express Shipping!</strong></span>
              </span>
            ) : (
              <span>
                Add <strong>{formatCurrency(amountToFreeShipping)}</strong> more
                for Free Shipping
              </span>
            )}
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List or Empty State */}
        <div className={styles.body}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <CartIcon size={48} strokeWidth={1.5} />
              </div>
              <h3>Your bag is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button
                className={styles.shopNowBtn}
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/products');
                }}
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {cart.map((item) => (
                <li key={item.itemid} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <img
                      src={item.image}
                      alt={`${item.manufacturer} ${item.productName}`}
                    />
                  </div>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeaderRow}>
                      <span className={styles.itemBrand}>
                        {item.manufacturer}
                      </span>
                      <button
                        className={styles.removeBtn}
                        onClick={() =>
                          handleRemoveItem(item.itemid, item.productName)
                        }
                        aria-label={`Remove ${item.productName} from bag`}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>

                    <Link
                      href={`/products/${item.itemid}`}
                      className={styles.itemName}
                      onClick={() => setIsCartOpen(false)}
                    >
                      {item.productName}
                    </Link>

                    <div className={styles.itemPriceRow}>
                      <div className={styles.qtyControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            handleQuantityChange(
                              item.itemid,
                              Math.max(0, item.quantity - 1)
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            handleQuantityChange(
                              item.itemid,
                              item.quantity + 1
                            )
                          }
                          disabled={item.available <= 0}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className={styles.itemTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with Summary & Actions */}
        {cart.length > 0 && (
          <div className={styles.footer}>
            {/* Promo Code Input */}
            <div className={styles.promoSection}>
              {promo ? (
                <div className={styles.appliedPromo}>
                  <div className={styles.promoBadge}>
                    <span>
                      PROMO: <strong>{promo.code}</strong> (-
                      {promo.discountPercent}%)
                    </span>
                  </div>
                  <button
                    className={styles.removePromoBtn}
                    onClick={handleRemovePromo}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleApplyPromo}
                  className={styles.promoForm}
                >
                  <input
                    type="text"
                    placeholder="Discount code (e.g. WELCOME10)"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      if (promoError) setPromoError('');
                    }}
                    className={styles.promoInput}
                  />
                  <button type="submit" className={styles.promoSubmit}>
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <span className={styles.promoErrorText}>{promoError}</span>
              )}
            </div>

            {/* Subtotal & Breakdown */}
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(rawSubtotal)}</span>
              </div>
              {promo && discountAmount > 0 && (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Discount ({promo.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>
                  {amountToFreeShipping <= 0 ? 'Free' : 'Calculated at checkout'}
                </span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Estimated Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.checkoutBtn}
                onClick={handleCheckoutClick}
              >
                Proceed to Checkout
              </button>
              <button
                className={styles.viewCartBtn}
                onClick={handleViewCartClick}
              >
                View Full Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
