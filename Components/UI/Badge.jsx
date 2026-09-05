import PropTypes from 'prop-types';
import styles from './Badge.module.scss';

const BADGE_CONFIG = {
  new: { label: 'New', icon: '✨' },
  sale: { label: 'Sale', icon: '🏷️' },
  bestseller: { label: 'Bestseller', icon: '⭐' },
  limited: { label: 'Limited', icon: '🔥' },
  lowstock: { label: 'Low Stock', icon: '⚡' },
};

export function Badge({ type, showIcon = true, size = 'default' }) {
  const config = BADGE_CONFIG[type];

  if (!config) return null;

  return (
    <span className={`${styles.badge} ${styles[type]} ${styles[size]}`}>
      {showIcon && <span className={styles.icon}>{config.icon}</span>}
      <span className={styles.label}>{config.label}</span>
    </span>
  );
}

export function BadgeGroup({ badges = [], max = 3 }) {
  if (!badges || badges.length === 0) return null;

  const visibleBadges = badges.slice(0, max);

  return (
    <div className={styles.badgeGroup}>
      {visibleBadges.map((badge) => (
        <Badge key={badge} type={badge} size="small" />
      ))}
    </div>
  );
}

Badge.propTypes = {
  type: PropTypes.oneOf(['new', 'sale', 'bestseller', 'limited', 'lowstock'])
    .isRequired,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

BadgeGroup.propTypes = {
  badges: PropTypes.arrayOf(PropTypes.string),
  max: PropTypes.number,
};
