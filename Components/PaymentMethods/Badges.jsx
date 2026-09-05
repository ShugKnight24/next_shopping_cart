import PropTypes from 'prop-types';

// Standard dimensions: 50x32, rx: 4
const badgePropTypes = {
  className: PropTypes.string,
};

// 1. VISA
export function VisaBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Visa"
    >
      <rect width="50" height="32" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <path
        d="M20.2 21.2L22 9.5H24.8L23 21.2H20.2ZM32.7 9.8C32.1 9.6 31.2 9.4 30 9.4C26.9 9.4 24.8 11 24.8 13.3C24.8 15 26.3 16 27.5 16.6C28.7 17.2 29.1 17.6 29.1 18.1C29.1 18.9 28.1 19.3 27.2 19.3C26 19.3 25.3 19.1 24.3 18.7L23.9 18.5L23.4 21.1C24.1 21.4 25.4 21.7 26.8 21.7C30.1 21.7 32.2 20.1 32.2 17.6C32.2 16.2 31.4 15.2 29.6 14.3C28.5 13.8 27.8 13.4 27.8 12.8C27.8 12.3 28.4 11.8 29.6 11.8C30.6 11.8 31.3 12 31.9 12.3L32.2 12.4L32.7 9.8ZM40.1 9.5H37.8C37.1 9.5 36.5 9.7 36.2 10.5L31.8 21.2H34.9L35.5 19.5H39.2L39.5 21.2H42.3L40.1 9.5ZM36.3 17.2C36.6 16.5 37.5 13.9 37.5 13.9C37.5 13.9 37.7 13.3 37.9 12.7L38.1 13.8C38.1 13.8 38.6 16.4 38.8 17.2H36.3ZM17.7 9.5L14.7 17.5L14.4 15.9C13.8 14 12.1 12 10.2 10.9L12.9 21.2H16.1L20.8 9.5H17.7Z"
        fill="#1434CB"
      />
      <path
        d="M12.1 10.9C10.2 11.9 8.5 12.9 7 13.4L9.6 21.2H12.9L17.7 9.5H14.7L12.1 10.9Z"
        fill="#F7B600"
      />
    </svg>
  );
}
VisaBadge.propTypes = badgePropTypes;

// 2. MASTERCARD
export function MastercardBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mastercard"
    >
      <rect width="50" height="32" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="30" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M25 9.77C26.85 11.38 28 13.56 28 16C28 18.44 26.85 20.62 25 22.23C23.15 20.62 22 18.44 22 16C22 13.56 23.15 11.38 25 9.77Z"
        fill="#FF5F00"
      />
    </svg>
  );
}
MastercardBadge.propTypes = badgePropTypes;

// 3. AMERICAN EXPRESS
export function AmexBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="American Express"
    >
      <rect width="50" height="32" rx="4" fill="#006FCF" stroke="#0058A3" strokeWidth="1" />
      {/* Box border outline */}
      <rect x="5" y="5" width="40" height="22" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
      <text
        x="25"
        y="15"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="5.5"
        fontWeight="800"
        letterSpacing="0.8"
        textAnchor="middle"
      >
        AMERICAN
      </text>
      <text
        x="25"
        y="22"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="5.5"
        fontWeight="800"
        letterSpacing="0.8"
        textAnchor="middle"
      >
        EXPRESS
      </text>
    </svg>
  );
}
AmexBadge.propTypes = badgePropTypes;

// 4. DISCOVER
export function DiscoverBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Discover"
    >
      <rect width="50" height="32" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="28" cy="16" r="5" fill="#FF6000" />
      <text
        x="7"
        y="19"
        fill="#231F20"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        letterSpacing="-0.2"
      >
        DISC
      </text>
      <text
        x="33.5"
        y="19"
        fill="#231F20"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        letterSpacing="-0.2"
      >
        VER
      </text>
    </svg>
  );
}
DiscoverBadge.propTypes = badgePropTypes;

// 5. APPLE PAY
export function ApplePayBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Apple Pay"
    >
      <rect width="50" height="32" rx="4" fill="#000000" stroke="#333333" strokeWidth="1" />
      <g fill="#FFFFFF">
        {/* Apple Logo */}
        <path d="M16.8 14.8C16.8 13.1 17.8 12.3 17.8 12.3C17.3 11.5 16.4 11.4 16.1 11.4C15 11.3 13.9 12 13.4 12C12.8 12 11.9 11.4 11 11.4C9.8 11.4 8.7 12.1 8.1 13.2C6.8 15.3 7.8 18.5 9 20.3C9.6 21.2 10.3 22.1 11.3 22.1C12.2 22.1 12.6 21.5 13.7 21.5C14.7 21.5 15.1 22.1 16.1 22.1C17.1 22.1 17.7 21.2 18.3 20.4C19 19.4 19.3 18.4 19.3 18.4C19.2 18.3 16.8 17.4 16.8 14.8Z" />
        <path d="M15.2 10.4C15.7 9.8 16 9 15.9 8.2C15.2 8.2 14.3 8.7 13.8 9.3C13.4 9.8 13 10.6 13.1 11.4C13.9 11.5 14.7 11 15.2 10.4Z" />
        {/* "Pay" Text */}
        <text
          x="21"
          y="18.5"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="-0.2"
        >
          Pay
        </text>
      </g>
    </svg>
  );
}
ApplePayBadge.propTypes = badgePropTypes;

// 6. GOOGLE PAY
export function GooglePayBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Google Pay"
    >
      <rect width="50" height="32" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* 4-color G */}
      <path
        d="M17.4 16.2C17.4 15.7 17.35 15.2 17.27 14.8H12V16.9H15.03C14.9 17.6 14.5 18.2 13.9 18.6V20H15.7C16.75 19.05 17.4 17.6 17.4 16.2Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.7C13.54 21.7 14.83 21.2 15.7 20.4L13.9 19C13.4 19.34 12.76 19.55 12 19.55C10.51 19.55 9.25 18.55 8.8 17.2H6.94V18.64C7.87 20.48 9.78 21.7 12 21.7Z"
        fill="#34A853"
      />
      <path
        d="M8.8 17.2C8.68 16.8 8.62 16.4 8.62 16C8.62 15.6 8.68 15.2 8.8 14.8V13.36H6.94C6.55 14.15 6.33 15.05 6.33 16C6.33 16.95 6.55 17.85 6.94 18.64L8.8 17.2Z"
        fill="#FBBC04"
      />
      <path
        d="M12 12.45C12.84 12.45 13.59 12.74 14.18 13.3L15.82 11.66C14.82 10.73 13.53 10.3 12 10.3C9.78 10.3 7.87 11.52 6.94 13.36L8.8 14.8C9.25 13.45 10.51 12.45 12 12.45Z"
        fill="#EA4335"
      />
      {/* "Pay" in Grey */}
      <text
        x="20.5"
        y="18.5"
        fill="#5F6368"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Product Sans', 'Segoe UI', Roboto, sans-serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="-0.2"
      >
        Pay
      </text>
    </svg>
  );
}
GooglePayBadge.propTypes = badgePropTypes;

// 7. PAYPAL
export function PayPalBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="PayPal"
    >
      <rect width="50" height="32" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* PayPal double-P */}
      <path
        d="M16 23.5L18.2 9H23C25.5 9 27.2 10.1 26.8 12.6C26.4 14.8 24.8 16.1 22.6 16.1H20.4L19.2 23.5H16Z"
        fill="#003087"
      />
      <path
        d="M19 23.5L20.8 12H25.3C27.5 12 29 13 28.6 15.2C28.2 17.2 26.8 18.3 24.8 18.3H23L22.2 23.5H19Z"
        fill="#0079C1"
      />
      <path
        d="M23 18.3L22.6 20.8L22.2 23.5H24.8L25.3 20.5C25.3 20.5 25.4 20.3 25.6 20.1C26.3 19.3 27.5 18.3 27.5 18.3H23Z"
        fill="#00457C"
        opacity="0.35"
      />
      <text
        x="30"
        y="18.5"
        fill="#003087"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="8"
        fontWeight="800"
        fontStyle="italic"
      >
        Pal
      </text>
    </svg>
  );
}
PayPalBadge.propTypes = badgePropTypes;

// 8. SHOP PAY
export function ShopPayBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Shop Pay"
    >
      <rect width="50" height="32" rx="4" fill="#5A31F4" stroke="#4924D6" strokeWidth="1" />
      <text
        x="13"
        y="19"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="-0.3"
      >
        shop
      </text>
      <rect x="30.5" y="9.5" width="13" height="13" rx="2.5" fill="#FFFFFF" />
      <text
        x="37"
        y="19"
        fill="#5A31F4"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        textAnchor="middle"
      >
        Pay
      </text>
    </svg>
  );
}
ShopPayBadge.propTypes = badgePropTypes;

// 9. KLARNA
export function KlarnaBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Klarna"
    >
      <rect width="50" height="32" rx="4" fill="#FFB3C7" stroke="#FFA3BB" strokeWidth="1" />
      <text
        x="25"
        y="19"
        fill="#0A0A0A"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="9.5"
        fontWeight="800"
        letterSpacing="-0.3"
        textAnchor="middle"
      >
        Klarna.
      </text>
    </svg>
  );
}
KlarnaBadge.propTypes = badgePropTypes;

// 10. AFTERPAY
export function AfterpayBadge({ className = '' }) {
  return (
    <svg
      width="50"
      height="32"
      viewBox="0 0 50 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Afterpay"
    >
      <rect width="50" height="32" rx="4" fill="#B2FCE4" stroke="#9EF0D4" strokeWidth="1" />
      {/* Afterpay Continuous Loop Icon */}
      <path
        d="M20.2 13.2L17.5 10.5C15.8 8.8 13.2 8.8 11.5 10.5C9.8 12.2 9.8 14.8 11.5 16.5L14.2 19.2C15.4 20.4 17.2 20.6 18.5 19.8L18.1 19.4L15.4 16.7C14.7 16 14.7 15 15.4 14.3C16.1 13.6 17.1 13.6 17.8 14.3L19.7 16.2L20.2 13.2Z"
        fill="#000000"
      />
      <path
        d="M21.8 18.8L24.5 21.5C26.2 23.2 28.8 23.2 30.5 21.5C32.2 19.8 32.2 17.2 30.5 15.5L27.8 12.8C26.6 11.6 24.8 11.4 23.5 12.2L23.9 12.6L26.6 15.3C27.3 16 27.3 17 26.6 17.7C25.9 18.4 24.9 18.4 24.2 17.7L22.3 15.8L21.8 18.8Z"
        fill="#000000"
      />
      <text
        x="33"
        y="18.5"
        fill="#000000"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        letterSpacing="-0.3"
      >
        pay
      </text>
    </svg>
  );
}
AfterpayBadge.propTypes = badgePropTypes;

// Export map
export const PAYMENT_BADGES = [
  { id: 'visa', name: 'Visa', Component: VisaBadge },
  { id: 'mastercard', name: 'Mastercard', Component: MastercardBadge },
  { id: 'amex', name: 'American Express', Component: AmexBadge },
  { id: 'discover', name: 'Discover', Component: DiscoverBadge },
  { id: 'applepay', name: 'Apple Pay', Component: ApplePayBadge },
  { id: 'googlepay', name: 'Google Pay', Component: GooglePayBadge },
  { id: 'paypal', name: 'PayPal', Component: PayPalBadge },
  { id: 'shoppay', name: 'Shop Pay', Component: ShopPayBadge },
  { id: 'klarna', name: 'Klarna', Component: KlarnaBadge },
  { id: 'afterpay', name: 'Afterpay', Component: AfterpayBadge },
];
