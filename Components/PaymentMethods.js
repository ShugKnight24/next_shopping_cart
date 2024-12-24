import paymentMethods from '../data/paymentMethods';

export function PaymentMethods() {
  return (
    <div className="payment-methods">
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
