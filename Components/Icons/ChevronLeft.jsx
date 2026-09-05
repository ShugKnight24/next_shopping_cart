import PropTypes from 'prop-types';

export function ChevronLeft({ size = 24, strokeWidth = 2, className = '' }) {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

ChevronLeft.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
