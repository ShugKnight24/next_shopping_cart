import PropTypes from 'prop-types';

export const Star = ({ averageRating, index }) => {
  const isFilled = index < averageRating;

  return (
    <svg
      className={isFilled ? 'filled-star' : 'empty-star'}
      viewBox="0 0 24 24"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.897l-7.334 3.868 1.4-8.168L.132 9.21l8.2-1.192z" />
    </svg>
  );
};

Star.propTypes = {
  averageRating: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};
