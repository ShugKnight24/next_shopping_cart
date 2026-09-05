import PropTypes from 'prop-types';
import styles from './Skeleton.module.css';

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  animation = 'shimmer',
}) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCardSkeleton}>
      <Skeleton variant="rectangular" height={200} className={styles.image} />
      <div className={styles.content}>
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="90%" height={14} />
        <div className={styles.footer}>
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className={styles.productGridSkeleton}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  animation: PropTypes.oneOf(['shimmer', 'pulse', 'none']),
};

ProductGridSkeleton.propTypes = {
  count: PropTypes.number,
};
