import PropTypes from 'prop-types';

export function CreditCardIcon({ size = 18, strokeWidth = 2, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

CreditCardIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
