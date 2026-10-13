import PropTypes from 'prop-types';
import { useRef } from 'react';
import { CartIcon, Cube3DIcon, SparklesIcon, VaultIcon } from '../Icons';
import styles from './Hero.module.css';

/** The one stage every tab controls (see Hero.jsx). */
export const HERO_PANEL_ID = 'hero-showcase-panel';
export const heroTabId = (mode) => `hero-tab-${mode}`;

/**
 * HeroAnimationSwitcher
 *
 * Tabs for the four hero showcases: the checkout cart track, the private
 * vault, the 3D Studio gallery and the WebGL gold dust. One tab stop; the
 * arrow keys, Home and End move between them.
 */
export function HeroAnimationSwitcher({ activeMode, onSelectMode }) {
  const tabRefs = useRef({});
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

  const onKeyDown = (event) => {
    const index = modes.findIndex((m) => m.id === activeMode);
    const next = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: modes.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const mode = modes[(next + modes.length) % modes.length];
    onSelectMode(mode.id);
    tabRefs.current[mode.id]?.focus();
  };

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
              ref={(el) => {
                tabRefs.current[mode.id] = el;
              }}
              type="button"
              role="tab"
              id={heroTabId(mode.id)}
              aria-selected={isActive}
              aria-controls={HERO_PANEL_ID}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={onKeyDown}
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
