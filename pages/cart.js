import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { Modal } from '../Components/Modal';
import { ClearCart } from '../Components/Modals/ClearCart';
import { DeleteItem } from '../Components/Modals/DeleteItem';
import { useToast } from '../Components/UI/Toast';
import { CartContext } from '../context/CartProvider';
import { ModalContext } from '../context/ModalProvider';
import {
  calculateDiscount,
  formatCurrency,
  totalPrice,
  totalQuantity,
} from '../utils/cartUtils';
import { TrashIcon } from '../Components/Icons';

// Trust badge icons
const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const TruckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export default function Cart() {
  const router = useRouter();
  const { showToast } = useToast();
  const { showModal, setShowModal, modalType, setModalType } =
    useContext(ModalContext);
  const { state, dispatch } = useContext(CartContext);
  const { cart = [], promo = null } = state || {};
  const itemsInCart = cart.length > 0;
  const [tempDelItem, setTempDelItem] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  const rawSubtotal = totalPrice(cart);
  const discountAmount = calculateDiscount(rawSubtotal, promo);
  const total = Math.max(0, rawSubtotal - discountAmount);

  function handleClearCart() {
    setShowModal(true);
    setModalType('Clear');
  }

  function handleDeleteItem(itemid) {
    setShowModal(true);
    setModalType('Delete');
    setTempDelItem(itemid);
  }

  function handleApplyPromo(e) {
    e.preventDefault();
    const clean = promoCodeInput.trim().toUpperCase();
    if (clean === 'WELCOME10') {
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: clean, discountPercent: 10 },
      });
      setPromoCodeInput('');
      showToast('10% discount applied!', 'success');
    } else if (clean === 'SAVE20') {
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: clean, discountPercent: 20 },
      });
      setPromoCodeInput('');
      showToast('20% discount applied!', 'success');
    } else {
      showToast('Invalid code. Try WELCOME10 or SAVE20', 'error');
    }
  }

  function handleRemovePromo() {
    dispatch({ type: 'REMOVE_PROMO' });
    showToast('Promo code removed', 'info');
  }

  return (
    <>
      <Head>
        <title>Shopping Cart | Cart</title>
      </Head>
      <div className="cart-container">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <h2>Review your items before checkout</h2>
        </div>
        {itemsInCart ? (
          <>
            <div className="cart-and-info">
              <div className="cart">
                <div className="cart-header">
                  <span className="product-header">Product</span>
                  <span className="quantity">Qty</span>
                  <span className="remove">Remove</span>
                  <span className="price">Price</span>
                  <span className="subtotal">Subtotal</span>
                </div>
                {cart &&
                  cart.map((cartItem) => {
                    return (
                      <div className="cart-item" key={cartItem.itemid}>
                        <div className="cart-product-info">
                          <img
                            src={cartItem.image}
                            alt={`${cartItem.productName} made by ${cartItem.manufacturer}`}
                          />
                          <h2>{cartItem.productName}</h2>
                        </div>
                        <div className="product-quantity">
                          <input
                            id="cart-quantity"
                            className="quantity-input"
                            type="number"
                            name="quantity"
                            value={cartItem.quantity}
                            min="1"
                            max={cartItem.available}
                            onChange={(event) =>
                              dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: {
                                  productId: cartItem.itemid,
                                  quantity: event.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <button
                          className="delete-item"
                          onClick={() => handleDeleteItem(cartItem.itemid)}
                          aria-label={`Remove ${cartItem.productName} from cart`}
                        >
                          <TrashIcon size={18} />
                        </button>
                        <p className="product-price">
                          {formatCurrency(cartItem.price)}
                        </p>
                        <p className="product-subtotal">
                          {formatCurrency(cartItem.price * cartItem.quantity)}
                        </p>
                      </div>
                    );
                  })}
              </div>
              <div className="cart-info">
                <div className="cart-header">
                  <span>Order Summary</span>
                </div>
                <div className="total-quantity">
                  <p>
                    <span className="bold-text">Total Items</span>
                  </p>
                  <p>{totalQuantity(cart)}</p>
                </div>
                <div className="subtotal-price">
                  <p>
                    <span className="bold-text">Subtotal</span>
                  </p>
                  <p>{formatCurrency(rawSubtotal)}</p>
                </div>
                {promo && discountAmount > 0 && (
                  <div className="subtotal-price discount-applied-row">
                    <p>
                      <span className="bold-text">Promo ({promo.code})</span>
                    </p>
                    <p style={{ color: '#2e7d32', fontWeight: 600 }}>
                      -{formatCurrency(discountAmount)}
                    </p>
                  </div>
                )}
                <div className="promo-input-cart" style={{ margin: '0.75rem 0' }}>
                  {promo ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600 }}>
                        {promo.code} (-{promo.discountPercent}%)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        style={{ background: 'none', border: 'none', color: '#c62828', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        style={{ flex: 1, padding: '0.45rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.85rem' }}
                      />
                      <button
                        type="submit"
                        style={{ padding: '0.45rem 0.8rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
                <div className="tax">
                  <p>
                    <span className="bold-text">Estimated Tax</span>
                  </p>
                  <p>Calculated at checkout</p>
                </div>
                <div className="total-price">
                  <p>
                    <span className="bold-text">Total</span>
                  </p>
                  <p>{formatCurrency(total)}</p>
                </div>
                <div className="cart-actions">
                  <button className="checkout" onClick={() => router.push('/checkout')}>
                    Proceed to Checkout
                  </button>
                  <button
                    className="clear-cart"
                    onClick={() => handleClearCart()}
                  >
                    Empty Cart
                  </button>
                </div>
                <div className="trust-badges">
                  <div className="trust-badge">
                    <ShieldIcon />
                    <span>Secure</span>
                  </div>
                  <div className="trust-badge">
                    <TruckIcon />
                    <span>Free Ship</span>
                  </div>
                  <div className="trust-badge">
                    <RefreshIcon />
                    <span>Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>
              Your cart is looking a little empty. <br />
              Let&apos;s find something amazing for you!
            </p>
            <Link href="/">Browse Home</Link>
            <Link href="/favorites">View Favorites</Link>
            <Link href="/products">Shop Products</Link>
          </div>
        )}
        {showModal ? (
          <Modal>
            {modalType === 'Clear' && <ClearCart />}
            {modalType === 'Delete' && <DeleteItem itemid={tempDelItem} />}
          </Modal>
        ) : null}
      </div>
    </>
  );
}
