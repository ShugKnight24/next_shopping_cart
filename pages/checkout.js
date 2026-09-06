import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartProvider';
import { useToast } from '../Components/UI/Toast';
import {
  calculateDiscount,
  formatCurrency,
  totalPrice,
  totalQuantity,
} from '../utils/cartUtils';
import { CreditCardIcon, AppleIcon, GoogleIcon } from '../Components/Icons';
import styles from '../styles/pages/Checkout.module.css';

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    title: 'Standard Ground Delivery',
    time: '3-5 business days',
    price: 0,
    minForFree: 150,
    baseCost: 10,
  },
  {
    id: 'express',
    title: 'Express Priority Courier',
    time: '2 business days',
    price: 18,
  },
  {
    id: 'overnight',
    title: 'Overnight Air Delivery',
    time: 'Next business day by 12 PM',
    price: 35,
  },
];

export default function Checkout() {
  const router = useRouter();
  const { state, dispatch } = useContext(CartContext);
  const { cart = [], promo = null } = state || {};
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Delivery, 3: Payment, 4: Review, 5: Confirmation
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
  });

  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');

  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentType: 'card', // 'card' | 'apple' | 'google'
  });

  const [promoInput, setPromoInput] = useState('');

  // Calculations
  const rawSubtotal = totalPrice(cart);
  const discountAmount = calculateDiscount(rawSubtotal, promo);
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const totalItems = totalQuantity(cart);

  const activeShippingObj = SHIPPING_OPTIONS.find(
    (opt) => opt.id === selectedShippingMethod
  );
  let shippingCost = activeShippingObj?.price || 0;
  if (selectedShippingMethod === 'standard') {
    shippingCost = rawSubtotal >= 150 ? 0 : 10;
  }

  const taxRate = 0.0825; // 8.25% estimated tax
  const estimatedTax = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + estimatedTax;

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setPaymentInfo((prev) => ({ ...prev, cardNumber: val }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setPaymentInfo((prev) => ({ ...prev, expiry: val }));
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'WELCOME10') {
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: clean, discountPercent: 10 },
      });
      showToast('10% discount applied!', 'success');
      setPromoInput('');
    } else if (clean === 'SAVE20') {
      dispatch({
        type: 'APPLY_PROMO',
        payload: { code: clean, discountPercent: 20 },
      });
      showToast('20% discount applied!', 'success');
      setPromoInput('');
    } else {
      showToast('Invalid code. Try WELCOME10 or SAVE20', 'error');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (
        !shippingInfo.firstName ||
        !shippingInfo.lastName ||
        !shippingInfo.email ||
        !shippingInfo.address ||
        !shippingInfo.city ||
        !shippingInfo.zip
      ) {
        showToast('Please fill in all required shipping fields', 'warning');
        return;
      }
    }
    if (step === 3) {
      if (
        paymentInfo.paymentType === 'card' &&
        (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv)
      ) {
        showToast('Please complete payment details', 'warning');
        return;
      }
    }
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setStep(5);
      showToast('Order confirmed successfully!', 'success');
    }, 1200);
  };

  const handleOrderDone = () => {
    dispatch({ type: 'EMPTY_CART' });
    router.push('/');
  };

  if (cart.length === 0 && step !== 5) {
    return (
      <div className={`${styles.checkoutPage} checkout-page empty-checkout`}>
        <Head>
          <title>Checkout | Cart Commerce</title>
        </Head>
        <div className="empty-card">
          <h2>Your Cart is Empty</h2>
          <p>You cannot proceed to checkout with an empty bag.</p>
          <Link href="/products" className="button primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout | Cart Commerce</title>
      </Head>

      <div className={`${styles.checkoutPage} checkout-container`}>
        {step < 5 && (
          <div className="checkout-stepper">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Delivery</span>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Payment</span>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
              <span className="step-num">4</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        )}

        {step === 5 ? (
          /* Order Confirmation View */
          <div className="order-confirmation-card">
            <div className="confirmation-check-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1>Thank you for your order!</h1>
            <p className="order-number-text">
              Order confirmation number: <strong>{orderId}</strong>
            </p>
            <p className="confirmation-email-note">
              We have sent an order confirmation with tracking details to{' '}
              <strong>{shippingInfo.email || 'your email'}</strong>.
            </p>

            <div className="confirmation-summary-box">
              <h3>Delivery Details</h3>
              <p>
                <strong>Recipient:</strong> {shippingInfo.firstName} {shippingInfo.lastName}
              </p>
              <p>
                <strong>Shipping Address:</strong> {shippingInfo.address},{' '}
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
              </p>
              <p>
                <strong>Method:</strong> {activeShippingObj?.title} ({activeShippingObj?.time})
              </p>
              <p>
                <strong>Total Charged:</strong> {formatCurrency(finalTotal)}
              </p>
            </div>

            <button className="button primary return-store-btn" onClick={handleOrderDone}>
              Back to Home Store
            </button>
          </div>
        ) : (
          /* Checkout Two-Column Layout */
          <div className="checkout-main-grid">
            <div className="checkout-form-column">
              {/* Step 1: Shipping Info */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="step-form">
                  <div className="form-section-header">
                    <h2>Shipping Address</h2>
                    <p>Where should we deliver your premium selection?</p>
                  </div>

                  <div className="form-row two-col">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                  </div>

                  <div className="form-row two-col">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone (Optional)</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Street Address *</label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      required
                      placeholder="123 Luxury Ave"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apartment">Apartment, Suite, Unit (Optional)</label>
                    <input
                      id="apartment"
                      type="text"
                      name="apartment"
                      placeholder="Apt 4B"
                      value={shippingInfo.apartment}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                    />
                  </div>

                  <div className="form-row three-col">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State / Province *</label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        required
                        placeholder="NY"
                        value={shippingInfo.state}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zip">ZIP / Postal Code *</label>
                      <input
                        id="zip"
                        type="text"
                        name="zip"
                        required
                        value={shippingInfo.zip}
                        onChange={(e) => handleInputChange(e, setShippingInfo)}
                      />
                    </div>
                  </div>

                  <div className="step-actions">
                    <Link href="/cart" className="back-link">
                      ← Back to Bag
                    </Link>
                    <button type="submit" className="button primary">
                      Continue to Delivery
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Delivery Method */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="step-form">
                  <div className="form-section-header">
                    <h2>Select Delivery Method</h2>
                    <p>Choose your preferred shipping speed</p>
                  </div>

                  <div className="shipping-options-list">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const isFree = opt.id === 'standard' && rawSubtotal >= 150;
                      const cost = isFree ? 0 : opt.id === 'standard' ? 10 : opt.price;
                      return (
                        <label
                          key={opt.id}
                          className={`shipping-option-card ${
                            selectedShippingMethod === opt.id ? 'selected' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={opt.id}
                            checked={selectedShippingMethod === opt.id}
                            onChange={() => setSelectedShippingMethod(opt.id)}
                          />
                          <div className="shipping-option-info">
                            <span className="shipping-title">{opt.title}</span>
                            <span className="shipping-time">{opt.time}</span>
                          </div>
                          <span className="shipping-price">
                            {cost === 0 ? 'FREE' : formatCurrency(cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setStep(1)}
                    >
                      ← Back to Address
                    </button>
                    <button type="submit" className="button primary">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <form onSubmit={handleNextStep} className="step-form">
                  <div className="form-section-header">
                    <h2>Payment Details</h2>
                    <p>All transactions are secure and encrypted</p>
                  </div>

                  {/* Payment Type Switcher */}
                  <div className="payment-type-selector">
                    <button
                      type="button"
                      className={`payment-tab ${paymentInfo.paymentType === 'card' ? 'active' : ''}`}
                      onClick={() =>
                        setPaymentInfo((prev) => ({ ...prev, paymentType: 'card' }))
                      }
                    >
                      <CreditCardIcon size={18} /> Credit Card
                    </button>
                    <button
                      type="button"
                      className={`payment-tab ${paymentInfo.paymentType === 'apple' ? 'active' : ''}`}
                      onClick={() =>
                        setPaymentInfo((prev) => ({ ...prev, paymentType: 'apple' }))
                      }
                    >
                      <AppleIcon size={18} /> Apple Pay
                    </button>
                    <button
                      type="button"
                      className={`payment-tab ${paymentInfo.paymentType === 'google' ? 'active' : ''}`}
                      onClick={() =>
                        setPaymentInfo((prev) => ({ ...prev, paymentType: 'google' }))
                      }
                    >
                      <GoogleIcon size={18} /> Google Pay
                    </button>
                  </div>

                  {paymentInfo.paymentType === 'card' ? (
                    <div className="card-fields">
                      <div className="form-group">
                        <label htmlFor="cardName">Cardholder Name *</label>
                        <input
                          id="cardName"
                          type="text"
                          name="cardName"
                          placeholder="John Doe"
                          value={paymentInfo.cardName}
                          onChange={(e) => handleInputChange(e, setPaymentInfo)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number *</label>
                        <input
                          id="cardNumber"
                          type="text"
                          placeholder="4532 •••• •••• ••••"
                          value={paymentInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          required
                        />
                      </div>

                      <div className="form-row two-col">
                        <div className="form-group">
                          <label htmlFor="expiry">Expiration Date (MM/YY) *</label>
                          <input
                            id="expiry"
                            type="text"
                            placeholder="MM/YY"
                            value={paymentInfo.expiry}
                            onChange={handleExpiryChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">Security Code (CVV) *</label>
                          <input
                            id="cvv"
                            type="password"
                            maxLength="4"
                            placeholder="CVC"
                            value={paymentInfo.cvv}
                            onChange={(e) =>
                              setPaymentInfo((prev) => ({
                                ...prev,
                                cvv: e.target.value.replace(/\D/g, ''),
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="express-checkout-notice">
                      <p>
                        You selected{' '}
                        <strong>
                          {paymentInfo.paymentType === 'apple'
                            ? 'Apple Pay'
                            : 'Google Pay'}
                        </strong>
                        . Click continue to authenticate with your biometric device token.
                      </p>
                    </div>
                  )}

                  <div className="step-actions">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setStep(2)}
                    >
                      ← Back to Delivery
                    </button>
                    <button type="submit" className="button primary">
                      Review Order
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Final Review */}
              {step === 4 && (
                <div className="step-form review-step">
                  <div className="form-section-header">
                    <h2>Review & Place Order</h2>
                    <p>Verify your details before completing purchase</p>
                  </div>

                  <div className="review-cards">
                    <div className="review-card">
                      <div className="review-card-header">
                        <h3>Shipping To</h3>
                        <button onClick={() => setStep(1)}>Edit</button>
                      </div>
                      <p>
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </p>
                      <p>
                        {shippingInfo.address}{' '}
                        {shippingInfo.apartment && `, ${shippingInfo.apartment}`}
                      </p>
                      <p>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                      </p>
                      <p>{shippingInfo.email}</p>
                    </div>

                    <div className="review-card">
                      <div className="review-card-header">
                        <h3>Delivery Option</h3>
                        <button onClick={() => setStep(2)}>Edit</button>
                      </div>
                      <p>
                        <strong>{activeShippingObj?.title}</strong>
                      </p>
                      <p>{activeShippingObj?.time}</p>
                      <p>Cost: {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</p>
                    </div>

                    <div className="review-card">
                      <div className="review-card-header">
                        <h3>Payment Method</h3>
                        <button onClick={() => setStep(3)}>Edit</button>
                      </div>
                      {paymentInfo.paymentType === 'card' ? (
                        <p>Card ending in {paymentInfo.cardNumber.slice(-4) || '••••'}</p>
                      ) : (
                        <p>
                          {paymentInfo.paymentType === 'apple'
                            ? 'Apple Pay'
                            : 'Google Pay'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setStep(3)}
                    >
                      ← Back to Payment
                    </button>
                    <button
                      type="button"
                      className="button primary place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Authorizing Payment...' : `Pay ${formatCurrency(finalTotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <aside className="checkout-summary-column">
              <div className="order-summary-box">
                <div className="summary-header">
                  <h3>Order Summary</h3>
                  <span>{totalItems} items</span>
                </div>

                <ul className="summary-item-list">
                  {cart.map((item) => (
                    <li key={item.itemid} className="summary-item">
                      <div className="summary-item-thumb">
                        <img src={item.image} alt={item.productName} />
                        <span className="summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="summary-item-desc">
                        <h4>{item.productName}</h4>
                        <span className="summary-item-brand">{item.manufacturer}</span>
                      </div>
                      <span className="summary-item-price">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Promo code */}
                <form onSubmit={handleApplyPromo} className="summary-promo-form">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </form>

                {/* Price breakdown */}
                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(rawSubtotal)}</span>
                  </div>
                  {promo && (
                    <div className="summary-row discount-row">
                      <span>Promo ({promo.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Tax (8.25%)</span>
                    <span>{formatCurrency(estimatedTax)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="summary-security-badges">
                  <div className="badge-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>256-Bit SSL Encryption</span>
                  </div>
                  <div className="badge-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>30-Day Money Back Guarantee</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
