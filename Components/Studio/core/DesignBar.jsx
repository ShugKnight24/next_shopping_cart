import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import styles from './DesignBar.module.css';

/**
 * Save / share / reopen strip mounted above every studio canvas.
 *
 * The three things a shopper most wants from a configurator and previously
 * could not do: keep a design, send it to someone, and come back to it.
 */
export const DesignBar = ({
  persistence,
  onRestore,
  onLoad,
  onReset,
  canReset = true,
  thumbnailFor,
  summaryFor,
  modeLabel = 'design',
}) => {
  const {
    saved,
    save,
    remove,
    restorable,
    dismissRestore,
    share,
    shareState,
    resetShareState,
  } = persistence;

  const [isShelfOpen, setIsShelfOpen] = useState(false);
  const [isNaming, setIsNaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [status, setStatus] = useState('');

  const nameInputRef = useRef(null);
  const statusTimer = useRef(null);

  useEffect(() => {
    if (isNaming) nameInputRef.current?.focus();
  }, [isNaming]);

  // One timer, cleared on each announce and on unmount, so a second save
  // inside the window cannot wipe the newer message early.
  const announce = (message) => {
    setStatus(message);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(''), 4000);
  };

  useEffect(() => () => clearTimeout(statusTimer.current), []);

  const handleSave = (event) => {
    event.preventDefault();
    const entry = save({
      name: draftName,
      thumbnail: thumbnailFor?.(),
      summary: summaryFor?.(),
    });
    setIsNaming(false);
    setDraftName('');
    announce(`Saved “${entry.name}” to My Designs.`);
  };

  const handleShare = async () => {
    resetShareState();
    const url = await share();
    if (url) announce('Share link copied to your clipboard.');
  };

  return (
    <div className={styles.bar}>
      {restorable && (
        <div className={styles.restoreRow} role="status">
          <span className={styles.restoreText}>
            You have an unfinished {modeLabel} from{' '}
            <strong>{formatWhen(restorable.at)}</strong>.
          </span>
          <div className={styles.restoreActions}>
            <button
              type="button"
              className={styles.restorePrimary}
              onClick={() => {
                onRestore(restorable.doc);
                dismissRestore();
                announce('Picked up where you left off.');
              }}
            >
              Pick up where I left off
            </button>
            <button
              type="button"
              className={styles.restoreGhost}
              onClick={dismissRestore}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      <div className={styles.actionRow}>
        <div className={styles.actionGroup}>
          {isNaming ? (
            <form className={styles.nameForm} onSubmit={handleSave}>
              <label className={styles.nameLabel} htmlFor="studio-design-name">
                Name this design
              </label>
              <input
                id="studio-design-name"
                ref={nameInputRef}
                className={styles.nameInput}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={`My ${modeLabel}`}
                maxLength={40}
                onKeyDown={(e) => e.key === 'Escape' && setIsNaming(false)}
              />
              <button type="submit" className={styles.nameSubmit}>
                Save
              </button>
              <button
                type="button"
                className={styles.nameCancel}
                onClick={() => setIsNaming(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className={styles.action}
                onClick={() => setIsNaming(true)}
              >
                Save design
              </button>

              <button
                type="button"
                className={styles.action}
                onClick={handleShare}
              >
                Copy share link
              </button>

              <button
                type="button"
                className={styles.action}
                onClick={() => setIsShelfOpen((open) => !open)}
                aria-expanded={isShelfOpen}
                aria-controls="studio-design-shelf"
              >
                My Designs
                <span className={styles.count}>{saved.length}</span>
              </button>

              {canReset && (
                <button
                  type="button"
                  className={styles.actionGhost}
                  onClick={() => {
                    onReset();
                    announce('Canvas reset.');
                  }}
                >
                  Start over
                </button>
              )}
            </>
          )}
        </div>

        {/* Assertive so a save/copy confirmation is not silently missed by
            someone who cannot see the strip. */}
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      </div>

      {shareState.status === 'manual' && (
        <div className={styles.shareFallback}>
          <label htmlFor="studio-share-url">
            Clipboard is blocked — copy this link:
          </label>
          <input
            id="studio-share-url"
            readOnly
            value={shareState.url}
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}

      {shareState.status === 'error' && (
        <p className={styles.shareError} role="alert">
          {shareState.message}
        </p>
      )}

      {isShelfOpen && (
        <div className={styles.shelf} id="studio-design-shelf">
          {saved.length === 0 ? (
            <p className={styles.shelfEmpty}>
              Nothing saved yet. Build something you like, then hit{' '}
              <strong>Save design</strong> — it stays in this browser.
            </p>
          ) : (
            <ul className={styles.shelfList}>
              {saved.map((entry) => (
                <li key={entry.id} className={styles.shelfItem}>
                  <button
                    type="button"
                    className={styles.shelfOpen}
                    onClick={() => {
                      onLoad(entry.doc);
                      setIsShelfOpen(false);
                      announce(`Opened “${entry.name}”.`);
                    }}
                  >
                    {entry.thumbnail ? (
                      <img
                        src={entry.thumbnail}
                        alt=""
                        className={styles.shelfThumb}
                      />
                    ) : (
                      <span
                        className={styles.shelfThumbFallback}
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.shelfMeta}>
                      <span className={styles.shelfName}>{entry.name}</span>
                      <span className={styles.shelfWhen}>
                        {formatWhen(entry.savedAt)}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.shelfDelete}
                    onClick={() => {
                      remove(entry.id);
                      announce(`Deleted “${entry.name}”.`);
                    }}
                    aria-label={`Delete saved design ${entry.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

DesignBar.propTypes = {
  persistence: PropTypes.object.isRequired,
  onRestore: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  canReset: PropTypes.bool,
  thumbnailFor: PropTypes.func,
  summaryFor: PropTypes.func,
  modeLabel: PropTypes.string,
};

function formatWhen(timestamp) {
  if (!timestamp) return 'earlier';

  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
