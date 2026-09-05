import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import styles from './ImageGallery.module.css';

export function ImageGallery({ images = [], productName = '' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          setIsLightboxOpen(false);
          break;
      }
    },
    [isLightboxOpen, handlePrevious, handleNext]
  );

  // Add keyboard listener when lightbox is open
  useState(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, handleKeyDown]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.placeholder}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === selectedIndex ? styles.active : ''}`}
                onClick={() => setSelectedIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
          onClick={() => setIsLightboxOpen(true)}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)',
                  }
                : undefined
            }
          />

          {/* Zoom hint */}
          <div className={styles.zoomHint}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Click to expand
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.prev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous image"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${styles.navBtn} ${styles.next}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className={styles.counter}>
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className={styles.closeBtn}
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.prev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous image"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${styles.lightboxNav} ${styles.next}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className={styles.lightboxThumbnails}>
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.lightboxThumb} ${index === selectedIndex ? styles.active : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  productName: PropTypes.string,
};
