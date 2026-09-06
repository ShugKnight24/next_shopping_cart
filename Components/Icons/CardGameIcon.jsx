import PropTypes from 'prop-types';

export function CardGameIcon({ size = 20, strokeWidth = 2, className = '' }) {
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
      <rect x="3" y="5" width="13" height="17" rx="2" transform="rotate(-6 3 5)" />
      <rect x="8" y="3" width="13" height="17" rx="2" />
      <path d="M14.5 9l1.5 2.5-1.5 2.5-1.5-2.5 1.5-2.5z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

CardGameIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
