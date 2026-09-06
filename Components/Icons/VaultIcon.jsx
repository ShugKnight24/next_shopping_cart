import PropTypes from 'prop-types';

export function VaultIcon({ size = 18, strokeWidth = 2, className = '' }) {
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
      <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2l10 6H2l10-6z" />
    </svg>
  );
}

VaultIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
