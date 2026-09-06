import PropTypes from 'prop-types';

export function SparklesIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" />
    </svg>
  );
}

SparklesIcon.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};
