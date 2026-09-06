import PropTypes from 'prop-types';

export function SneakerIcon({ size = 20, strokeWidth = 2, className = '' }) {
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
      <path d="M2 17c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3v-2H2v2z" />
      <path d="M2 15l2-6c.5-1.5 2-2.5 3.5-2.5h2.5l2 3.5h4l4 5" />
      <path d="M9 6.5l2.5 4" />
      <path d="M12.5 7.5l2 3" />
      <path d="M5 20v1" />
      <path d="M19 20v1" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

SneakerIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
