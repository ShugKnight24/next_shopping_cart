import PropTypes from 'prop-types';

export function GuitarIcon({ size = 20, strokeWidth = 2, className = '' }) {
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
      <path d="M19 3l2 2-7.5 7.5a4.5 4.5 0 0 0-4-1 4.5 4.5 0 0 0-5.5 5.5 4.5 4.5 0 0 0 5.5 5.5 4.5 4.5 0 0 0 4-1L21 8" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
      <line x1="16" y1="6" x2="18" y2="8" />
      <line x1="18.5" y1="3.5" x2="20.5" y2="5.5" />
    </svg>
  );
}

GuitarIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
