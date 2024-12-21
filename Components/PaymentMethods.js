const paymentMethods = [
  { src: '../static/img/payment_methods/afterpay.png', alt: 'Afterpay' },
  { src: '../static/img/payment_methods/amex.svg', alt: 'American Express' },
  { src: '../static/img/payment_methods/apple_pay.svg', alt: 'Apple Pay' },
  { src: '../static/img/payment_methods/discover.svg', alt: 'Discover' },
  { src: '../static/img/payment_methods/google_pay.svg', alt: 'Google Pay' },
  { src: '../static/img/payment_methods/klarna.png', alt: 'Klarna' },
  { src: '../static/img/payment_methods/mastercard.svg', alt: 'Mastercard' },
  { src: '../static/img/payment_methods/paypal.svg', alt: 'Paypal' },
  { src: '../static/img/payment_methods/shopify_pay.svg', alt: 'Shopify Pay' },
  { src: '../static/img/payment_methods/visa.svg', alt: 'Visa' },
];

export function PaymentMethods() {
  return (
    <div className="payment-methods">
      <h3>Accepted Payment Methods</h3>
      <ul>
        {paymentMethods.map((method, index) => (
          <li key={index}>
            <img src={method.src} alt={method.alt} />
          </li>
        ))}
      </ul>
    </div>
  );
}
