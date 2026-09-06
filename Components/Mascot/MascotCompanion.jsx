import { useState } from 'react';
import { useMascot } from '../../context/MascotProvider';
import { MASCOTS } from '../../config/mascots';
import { CartySvg, LeoSvg } from './MascotArtwork';
import { SparklesIcon, CloseIcon, RotateCcwIcon } from '../Icons';
import styles from './MascotCompanion.module.css';

export function MascotCompanion() {
  const {
    isMascotEnabled,
    toggleMascot,
    activeMascotId,
    setMascot,
    activeMascot,
    speech,
    dismissSpeech,
    speak,
  } = useMascot();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // If disabled, render subtle re-enable pill
  if (!isMascotEnabled) {
    return (
      <aside className={styles.disabledContainer} aria-label="Brand Companion Controls">
        <button
          type="button"
          className={styles.enableButton}
          onClick={toggleMascot}
          aria-label="Turn on Brand Companion"
        >
          <SparklesIcon size={14} className={styles.sparkleIcon} />
          <span>Companion: <strong>Off</strong> (Enable)</span>
        </button>
      </aside>
    );
  }

  const handleMascotClick = () => {
    if (!speech.isVisible) {
      speak(activeMascot.defaultMessage, 'happy');
    }
  };

  const handleSelectMascot = (id) => {
    setMascot(id);
    setIsSwitcherOpen(false);
  };

  return (
    <aside className={styles.companionRoot} aria-label="Interactive Brand Companion">
      {/* Interactive Speech Bubble */}
      {speech.isVisible && speech.message && (
        <div className={styles.speechBubble} role="status" aria-live="polite">
          <div className={styles.speechHeader}>
            <div className={styles.mascotInfo}>
              <span className={styles.mascotName}>{activeMascot.name}</span>
              <span className={styles.mascotTitle}>{activeMascot.title}</span>
            </div>
            <div className={styles.speechControls}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsSwitcherOpen((prev) => !prev)}
                title="Swap Companion Character"
                aria-label="Swap Companion Character"
              >
                <RotateCcwIcon size={13} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={dismissSpeech}
                title="Dismiss message"
                aria-label="Dismiss message"
              >
                <CloseIcon size={13} />
              </button>
            </div>
          </div>

          <p className={styles.speechText}>{speech.message}</p>

          {/* Character Switcher Popover */}
          {isSwitcherOpen && (
            <div className={styles.switcherDrawer}>
              <div className={styles.switcherTitle}>Choose Your Companion:</div>
              <div className={styles.switcherOptions}>
                {Object.values(MASCOTS).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.switcherOption} ${
                      m.id === activeMascotId ? styles.switcherActive : ''
                    }`}
                    onClick={() => handleSelectMascot(m.id)}
                  >
                    <span className={styles.optionDot} style={{ background: m.theme.primary }} />
                    <span className={styles.optionName}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.bubbleTail} />
        </div>
      )}

      {/* Mascot Artwork Stage */}
      <div className={styles.characterContainer}>
        <button
          type="button"
          className={styles.characterButton}
          onClick={handleMascotClick}
          aria-label={`Interact with ${activeMascot.name}`}
        >
          {activeMascotId === 'leo' ? (
            <LeoSvg size={96} />
          ) : (
            <CartySvg size={96} />
          )}
        </button>
      </div>

      {/* Companion Quick Settings Bar */}
      <div className={styles.settingsBar}>
        <button
          type="button"
          className={styles.togglePill}
          onClick={toggleMascot}
          title="Turn off companion"
          aria-label="Turn off companion"
        >
          <span className={styles.statusDot} />
          <span>Turn Off</span>
        </button>

        <button
          type="button"
          className={styles.swapPill}
          onClick={() => {
            const nextId = activeMascotId === 'carty' ? 'leo' : 'carty';
            handleSelectMascot(nextId);
          }}
          title="Switch between Carty and Leo"
          aria-label="Switch between Carty and Leo"
        >
          <span>{activeMascotId === 'carty' ? 'Switch to Leo' : 'Switch to Carty'}</span>
        </button>
      </div>
    </aside>
  );
}
