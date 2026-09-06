import PropTypes from 'prop-types';

export function DumbbellIcon({ size = 20, strokeWidth = 2, className = '' }) {
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
      <path d="M6.5 6.5l11 11" />
      <path d="M4 10l2-2" />
      <path d="M14 20l2-2" />
      <rect x="2" y="12" width="6" height="4" rx="1" transform="rotate(-45 5 14)" />
      <rect x="16" y="8" width="6" height="4" rx="1" transform="rotate(-45 19 10)" />
      <path d="M1.5 15.5l7-7" />
      <path d="M15.5 21.5l7-7" />
    </svg>
  );
}

DumbbellIcon.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};
