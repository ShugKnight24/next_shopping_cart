import PropTypes from 'prop-types';
import styles from './Hero.module.css';

/**
 * HeroAnimationSwitcher
 *
 * Interactive segmented controller allowing users to toggle between
 * the 4 distinct Hero showcase animations.
 */
export function HeroAnimationSwitcher({ activeMode, onSelectMode }) {
  const modes = [
    {
      id: 'track',
      label: 'Cart Track',
      icon: '🛒',
      badge: 'Classic',
    },
    {
      id: 'vault',
      label: 'Luxury Vault',
      icon: '🏛️',
      badge: 'Vector',
    },
    {
      id: '3d',
      label: '3D Stage',
      icon: '🧊',
      badge: 'Spatial',
    },
    {
      id: 'webgl',
      label: 'WebGL Vortex',
      icon: '✨',
      badge: 'GPU',
    },
  ];

  return (
    <div
      className={styles.switcherContainer}
      role="tablist"
      aria-label="Hero Animation Mode Switcher"
    >
      <div className={styles.switcherTrack}>
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`hero-animation-${mode.id}`}
              className={`${styles.switcherButton} ${isActive ? styles.switcherActive : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <span className={styles.switcherIcon}>{mode.icon}</span>
              <span className={styles.switcherLabel}>{mode.label}</span>
              <span className={styles.switcherBadge}>{mode.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

HeroAnimationSwitcher.propTypes = {
  activeMode: PropTypes.oneOf(['track', 'vault', '3d', 'webgl']).isRequired,
  onSelectMode: PropTypes.func.isRequired,
};
