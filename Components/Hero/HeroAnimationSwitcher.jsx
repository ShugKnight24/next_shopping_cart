import PropTypes from 'prop-types';
import { CartIcon, Cube3DIcon, SparklesIcon, VaultIcon } from '../Icons';
import styles from './Hero.module.css';

/**
 * HeroAnimationSwitcher
 *
 * Segmented control for the four hero showcases: the checkout cart track,
 * the private vault, the 3D Studio gallery and the WebGL gold dust.
 */
export function HeroAnimationSwitcher({ activeMode, onSelectMode }) {
  const modes = [
    {
      id: 'track',
      label: 'Cart Track',
      Icon: CartIcon,
      badge: 'Checkout',
    },
    {
      id: 'vault',
      label: 'Private Vault',
      Icon: VaultIcon,
      badge: 'Certified',
    },
    {
      id: '3d',
      label: 'Studio Gallery',
      Icon: Cube3DIcon,
      badge: '3D',
    },
    {
      id: 'webgl',
      label: 'Gold Dust',
      Icon: SparklesIcon,
      badge: 'WebGL',
    },
  ];

  return (
    <div
      className={styles.switcherContainer}
      role="tablist"
      aria-label="Hero showcase"
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
