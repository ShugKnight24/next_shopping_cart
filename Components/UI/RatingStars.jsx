import PropTypes from 'prop-types';
import styles from './RatingStars.module.scss';

export function RatingStars({
  rating = 0,
  count = 0,
  size = 'default',
  showCount = true,
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`${styles.ratingContainer} ${styles[size]}`}>
      <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={`full-${i}`} className={styles.star}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <span className={`${styles.star} ${styles.half}`}>
            <svg viewBox="0 0 24 24">
              <defs>
                <linearGradient id="halfGradient">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#e0e0e0" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="url(#halfGradient)"
              />
            </svg>
          </span>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={`empty-${i}`} className={`${styles.star} ${styles.empty}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        ))}
      </div>

      {showCount && count > 0 && (
        <span className={styles.count}>
          {rating.toFixed(1)} ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

RatingStars.propTypes = {
  rating: PropTypes.number,
  count: PropTypes.number,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  showCount: PropTypes.bool,
};
