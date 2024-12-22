import PropTypes from 'prop-types';

export function Slide({
  productName,
  slideCTA,
  slideImage,
  slideMemeText,
  slideSubHeading,
  slideText,
}) {
  return (
    <div className="slide fade">
      <h2>{productName}</h2>
      <h3>{slideText}</h3>
      <h3>{slideMemeText}</h3>
      {slideSubHeading && <h4>{slideSubHeading}</h4>}
      {/* TODO: Link to a contact form or info page */}
      {slideCTA && <button>{slideCTA}</button>}
      <img src={slideImage} alt={productName} />
    </div>
  );
}

Slide.propTypes = {
  productName: PropTypes.string.isRequired,
  slideCTA: PropTypes.string,
  slideImage: PropTypes.string.isRequired,
  slideMemeText: PropTypes.string.isRequired,
  slideSubHeading: PropTypes.string,
  slideText: PropTypes.string.isRequired,
};
