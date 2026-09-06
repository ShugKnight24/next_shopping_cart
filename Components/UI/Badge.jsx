import PropTypes from 'prop-types';
import styles from './Badge.module.css';
import {
  SparklesIcon,
  TagIcon,
  StarFilled,
  FlameIcon,
  BoltIcon,
} from '../Icons';

const BADGE_CONFIG = {
  new: { label: 'New', Icon: SparklesIcon },
  sale: { label: 'Sale', Icon: TagIcon },
  bestseller: { label: 'Bestseller', Icon: StarFilled },
  limited: { label: 'Limited', Icon: FlameIcon },
  lowstock: { label: 'Low Stock', Icon: BoltIcon },
};

export function Badge({ type, showIcon = true, size = 'default' }) {
  const config = BADGE_CONFIG[type];

  if (!config) return null;
  const IconComponent = config.Icon;
  const iconSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <span className={`${styles.badge} ${styles[type]} ${styles[size]}`}>
      {showIcon && (
        <span className={styles.icon}>
          <IconComponent size={iconSize} />
        </span>
      )}
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
