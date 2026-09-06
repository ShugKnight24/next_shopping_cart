import Link from 'next/link';
import PropTypes from 'prop-types';

export function Slide({
  productName,
  slideCTA,
  slideCTALink,
  slideImage,
  slideMemeText,
  slideSubHeading,
  slideText,
  isActive,
  index,
  total,
}) {
  return (
    <div
      className={`slide fade ${isActive ? 'active' : ''}`}
      role="tabpanel"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${productName}`}
      aria-hidden={!isActive}
    >
      <div className="slide-content">
        <h2>{productName}</h2>
        <h3>{slideText}</h3>
        <h3 className="slide-meme">{slideMemeText}</h3>
        {slideSubHeading && <h4>{slideSubHeading}</h4>}
        {slideCTA &&
          (slideCTALink ? (
            <Link href={slideCTALink} className="slide-cta">
              {slideCTA}
            </Link>
          ) : (
            <button className="slide-cta">{slideCTA}</button>
          ))}
      </div>
      <div className="slide-image-container">
        <img
          src={slideImage}
          alt={productName}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </div>
    </div>
  );
}

Slide.propTypes = {
  productName: PropTypes.string.isRequired,
  slideCTA: PropTypes.string,
  slideCTALink: PropTypes.string,
  slideImage: PropTypes.string.isRequired,
  slideMemeText: PropTypes.string.isRequired,
  slideSubHeading: PropTypes.string,
  slideText: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  total: PropTypes.number,
};
