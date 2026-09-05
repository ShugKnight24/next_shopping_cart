import { PAYMENT_BADGES } from './PaymentMethods/Badges';

// Shield/Lock icon for secure payments
function SecureIcon() {
  return (
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
}

export function PaymentMethods() {
  return (
    <div className="payment-methods">
      <div className="payment-heading">
        <span className="heading-icon">
          <SecureIcon />
        </span>
        <div className="heading-text">
          <h4>Secure Checkout</h4>
          <span>100% encrypted & protected</span>
        </div>
      </div>
      <ul aria-label="Accepted payment methods">
        {PAYMENT_BADGES.map((method) => {
          const BadgeComponent = method.Component;
          return (
            <li key={method.id} title={method.name}>
              <BadgeComponent className="payment-badge-svg" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

