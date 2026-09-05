import PropTypes from 'prop-types';
import { useState } from 'react';
import { RatingStars } from '../UI/RatingStars';
import styles from './ReviewCard.module.scss';

export function ReviewCard({ review }) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);

  const handleHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true);
      setHelpfulCount((prev) => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className={styles.reviewCard}>
      <header className={styles.header}>
        <div className={styles.avatar}>
          {review.author?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className={styles.authorInfo}>
          <div className={styles.authorRow}>
            <span className={styles.authorName}>{review.author}</span>
            {review.verified && (
              <span className={styles.verified}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
          <div className={styles.ratingDate}>
            <RatingStars
              rating={review.rating}
              showCount={false}
              size="small"
            />
            <span className={styles.date}>{formatDate(review.date)}</span>
          </div>
        </div>
      </header>

      {review.title && <h4 className={styles.title}>{review.title}</h4>}

      <p className={styles.content}>{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className={styles.images}>
          {review.images.map((image, index) => (
            <button key={index} className={styles.imageThumb}>
              <img src={image} alt={`Review image ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      <footer className={styles.footer}>
        <button
          className={`${styles.helpfulBtn} ${isHelpful ? styles.active : ''}`}
          onClick={handleHelpful}
          disabled={isHelpful}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isHelpful ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Helpful ({helpfulCount})
        </button>
        <button className={styles.reportBtn}>Report</button>
      </footer>
    </article>
  );
}

export function ReviewList({ reviews = [], showCount = 5 }) {
  const [visibleCount, setVisibleCount] = useState(showCount);
  const [sortBy, setSortBy] = useState('helpful');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0);
      case 'recent':
        return new Date(b.date) - new Date(a.date);
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.noReviews}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <h4>No reviews yet</h4>
        <p>Be the first to share your experience with this product.</p>
        <button className={styles.writeReviewBtn}>Write a Review</button>
      </div>
    );
  }

  return (
    <div className={styles.reviewList}>
      <div className={styles.listHeader}>
        <span className={styles.reviewCount}>{reviews.length} Reviews</span>
        <div className={styles.sortContainer}>
          <label htmlFor="sort-reviews">Sort by:</label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rated</option>
            <option value="rating-low">Lowest Rated</option>
          </select>
        </div>
      </div>

      <div className={styles.reviews}>
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <button
          className={styles.loadMore}
          onClick={() => setVisibleCount((prev) => prev + showCount)}
        >
          Load More Reviews
        </button>
      )}
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    verified: PropTypes.bool,
    helpful: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object),
  showCount: PropTypes.number,
};
