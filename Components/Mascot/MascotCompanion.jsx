import { useState } from 'react';
import { useMascot } from '../../context/MascotProvider';
import { CloseIcon, RotateCcwIcon, SparklesIcon } from '../Icons';
import {
  CartySvg,
  DexterSvg,
  FoxSvg,
  LeoSvg,
  LunaSvg,
  MascotThumbnail,
  PennySvg,
  SparkySvg,
} from './MascotArtwork';
import styles from './MascotCompanion.module.css';

export function MascotCompanion() {
  const {
    isMascotEnabled,
    toggleMascot,
    activeMascotId,
    setMascot,
    activeMascot,
    availableMascots,
    currentRealm,
    speech,
    dismissSpeech,
    speak,
  } = useMascot();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const triggerCelebration = () => {
    setIsCelebrating(true);
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      tx: (Math.random() - 0.5) * 80,
      ty: -25 - Math.random() * 50,
      icon:
        activeMascotId === 'finley'
          ? i % 2 === 0
            ? '✦'
            : '★'
          : activeMascotId === 'luna'
            ? i % 2 === 0
              ? '★'
              : '🐾'
            : i % 2 === 0
              ? '★'
              : '✨',
      color: activeMascot.theme.accent || '#fbbf24',
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
    setTimeout(() => setIsCelebrating(false), 700);
  };

  // If disabled, render subtle re-enable pill
  if (!isMascotEnabled) {
    return (
      <aside
        className={styles.disabledContainer}
        aria-label="Brand Companion Controls"
      >
        <button
          type="button"
          className={styles.enableButton}
          onClick={toggleMascot}
          aria-label="Turn on Brand Companion"
        >
          <SparklesIcon size={14} className={styles.sparkleIcon} />
          <span>
            Companion: <strong>Off</strong> (Enable)
          </span>
        </button>
      </aside>
    );
  }

  const handleMascotClick = () => {
    triggerCelebration();
    const actionReplies = activeMascot.interactiveActions || [];
    if (actionReplies.length > 0 && Math.random() > 0.3) {
      const randomAction =
        actionReplies[Math.floor(Math.random() * actionReplies.length)];
      speak(randomAction.reply, 'happy');
    } else {
      speak(activeMascot.defaultMessage, 'happy');
    }
  };

  const handleActionClick = (action) => {
    triggerCelebration();
    speak(action.reply, 'celebrating');
  };

  const handleSelectMascot = (id) => {
    setMascot(id);
    setIsSwitcherOpen(false);
    triggerCelebration();
  };

  const renderMascotArtwork = () => {
    switch (activeMascotId) {
      case 'finley':
        return <FoxSvg size={124} />;
      case 'luna':
        return <LunaSvg size={124} />;
      case 'sparky':
        return <SparkySvg size={124} />;
      case 'leo':
        return <LeoSvg size={124} />;
      case 'penny':
        return <PennySvg size={124} />;
      case 'dexter':
        return <DexterSvg size={124} />;
      case 'carty':
      default:
        return <CartySvg size={124} />;
    }
  };

  const mascotList =
    availableMascots && availableMascots.length > 0
      ? availableMascots
      : [activeMascot];
  const curIndex = mascotList.findIndex((m) => m.id === activeMascotId);
  const nextIndex = curIndex >= 0 ? (curIndex + 1) % mascotList.length : 0;
  const nextMascot = mascotList[nextIndex] || mascotList[0];
  const nextMascotName = nextMascot ? nextMascot.name.split(' ')[0] : 'Next';

  return (
    <aside
      className={styles.companionRoot}
      aria-label="Interactive Brand Companion"
    >
      {/* Floating Interactive Particles */}
      {particles.length > 0 && (
        <div className={styles.particlesContainer} aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className={styles.particle}
              style={{
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                color: p.color,
              }}
            >
              {p.icon}
            </span>
          ))}
        </div>
      )}

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

          {/* Interactive Action Chips */}
          {activeMascot.interactiveActions &&
            activeMascot.interactiveActions.length > 0 && (
              <div className={styles.actionChips}>
                {activeMascot.interactiveActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={styles.actionChip}
                    onClick={() => handleActionClick(action)}
                    aria-label={action.label}
                  >
                    <SparklesIcon size={11} className={styles.chipIcon} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}

          {/* Character Switcher Popover with Illustrated Avatars */}
          {isSwitcherOpen && (
            <div className={styles.switcherDrawer}>
              <div className={styles.switcherTitle}>
                {currentRealm === 'kids'
                  ? 'Kids Companions:'
                  : 'Store Companions:'}
              </div>
              <div className={styles.switcherOptions}>
                {mascotList.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.switcherOption} ${
                      m.id === activeMascotId ? styles.switcherActive : ''
                    }`}
                    onClick={() => handleSelectMascot(m.id)}
                  >
                    <div className={styles.optionAvatar}>
                      <MascotThumbnail mascotId={m.id} size={30} />
                    </div>
                    <div className={styles.optionMeta}>
                      <span className={styles.optionName}>{m.name}</span>
                      <span className={styles.optionRole}>{m.title}</span>
                    </div>
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
          className={`${styles.characterButton} ${isCelebrating ? styles.interactiveReaction : ''}`}
          onClick={handleMascotClick}
          aria-label={`Interact with ${activeMascot.name}`}
        >
          {renderMascotArtwork()}
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

        {mascotList.length > 1 && (
          <button
            type="button"
            className={styles.swapPill}
            onClick={() => handleSelectMascot(nextMascot.id)}
            title={`Switch to next companion (${nextMascotName})`}
            aria-label={`Switch between companions`}
          >
            <span>Switch to {nextMascotName}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
