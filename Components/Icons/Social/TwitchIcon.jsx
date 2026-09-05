import PropTypes from 'prop-types';

export function TwitchIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.149 0l-1.612 4.119v16.8h5.908v3.081h3.224l3.224-3.081h4.836l6.272-6.172v-14.747h-21.852zm19.346 13.714l-3.76 3.6h-5.373l-3.224 3.086v-3.086h-4.836v-14.743h17.193v11.143zm-9.136-6.857h2.686v5.486h-2.686v-5.486zm5.372 0h2.686v5.486h-2.686v-5.486z" />
    </svg>
  );
}

TwitchIcon.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};
