import PropTypes from 'prop-types';
import { TrashIcon } from '../Icons';
import styles from './StickerBar.module.css';

export const STICKER_TYPES = [
  { id: 'star', name: 'Golden Star' },
  { id: 'rocket', name: 'Cosmic Rocket' },
  { id: 'crown', name: 'Royal Crown' },
  { id: 'sneaker', name: 'Sneaker Crest' },
  { id: 'sparkle', name: 'Magic Twinkle' },
  { id: 'heart', name: 'Kindness Heart' },
];

export function StickerBar({
  selectedSticker,
  onSelectSticker,
  onClearStickers,
  stickersCount = 0,
}) {
  return (
    <div className={styles.barContainer}>
      <div className={styles.barHeader}>
        <span className={styles.barTitle}>Decorative Stamp Stickers:</span>
        {stickersCount > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClearStickers}
            title="Remove all stamps"
            aria-label="Remove all placed stamps"
          >
            <TrashIcon size={12} />
            <span>Clear ({stickersCount})</span>
          </button>
        )}
      </div>

      <div className={styles.stickerRow}>
        {STICKER_TYPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.stickerBtn} ${
              selectedSticker === s.id ? styles.stickerSelected : ''
            }`}
            onClick={() =>
              onSelectSticker(selectedSticker === s.id ? null : s.id)
            }
            aria-label={`Select ${s.name} sticker to stamp`}
          >
            <span className={styles.stickerBadge}>{s.name.split(' ')[0]}</span>
            <span className={styles.stickerLabel}>{s.name}</span>
          </button>
        ))}
      </div>
      <p className={styles.hintText}>
        {selectedSticker
          ? 'Tap anywhere on the illustration stage to stamp!'
          : 'Select a stamp above, or drag placed stamps to reposition.'}
      </p>
    </div>
  );
}

StickerBar.propTypes = {
  selectedSticker: PropTypes.string,
  onSelectSticker: PropTypes.func.isRequired,
  onClearStickers: PropTypes.func.isRequired,
  stickersCount: PropTypes.number,
};
