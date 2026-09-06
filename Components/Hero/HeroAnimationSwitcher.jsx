import PropTypes from 'prop-types';
import styles from './Hero.module.css';
import { CartIcon, VaultIcon, Cube3DIcon, SparklesIcon } from '../Icons';

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
      Icon: CartIcon,
      badge: 'Classic',
    },
    {
      id: 'vault',
      label: 'Luxury Vault',
      Icon: VaultIcon,
      badge: 'Vector',
    },
    {
      id: '3d',
      label: '3D Stage',
      Icon: Cube3DIcon,
      badge: 'Spatial',
    },
    {
      id: 'webgl',
      label: 'WebGL Vortex',
      Icon: SparklesIcon,
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
          const ModeIcon = mode.Icon;
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
              <span className={styles.switcherIcon}>
                <ModeIcon size={16} strokeWidth={2} />
              </span>
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
