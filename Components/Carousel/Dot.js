import PropTypes from 'prop-types';

export function Dot({ onClick, isActive, index, label }) {
  return (
    <button
      className={`dot ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Go to slide ${index + 1}: ${label}`}
      tabIndex={isActive ? 0 : -1}
    />
  );
}

Dot.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  label: PropTypes.string,
};
