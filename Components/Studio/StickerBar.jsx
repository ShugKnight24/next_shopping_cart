import PropTypes from 'prop-types';
import { useState } from 'react';
import { TrashIcon } from '../Icons';
import {
  MascotLunaSvg,
  MascotFinleySvg,
  MascotLeoSvg,
  MascotPennySvg,
  MascotDexterSvg,
  MascotCartySvg,
  MascotSparkySvg,
  BadgeHeroSvg,
  BadgeBraveSvg,
  BadgeStarlightSvg,
  BadgeCertifiedSvg,
  BadgeDinoScoutSvg,
  BubblePropSvg,
  RosePropSvg,
  CompassPropSvg,
  WandPropSvg,
  ChestPropSvg,
  PlanetPropSvg,
  StarStampSvg,
  RocketStampSvg,
  CrownStampSvg,
  SneakerStampSvg,
  SparkleStampSvg,
  HeartStampSvg,
  UndoIcon,
  RedoIcon,
  TemplateToolIcon,
} from './StudioSVGs';
import styles from './StickerBar.module.css';

export const STICKER_CATEGORIES = [
  { id: 'all', label: 'All Assets', Icon: TemplateToolIcon },
  { id: 'companions', label: 'Cute Companions', Icon: MascotFinleySvg },
  { id: 'badges', label: 'Story Badges', Icon: BadgeHeroSvg },
  { id: 'props', label: 'Props & Wonders', Icon: WandPropSvg },
  { id: 'classic', label: 'Classic Stamps', Icon: StarStampSvg },
];

export const STICKER_CATALOG = [
  // Cute Companions (Mascots)
  {
    id: 'mascot_luna',
    name: 'Luna Cosmic Companion',
    category: 'companions',
    Svg: MascotLunaSvg,
    tag: 'Cosmic & Loyal',
  },
  {
    id: 'mascot_finley',
    name: 'Finley Starlight Companion',
    category: 'companions',
    Svg: MascotFinleySvg,
    tag: 'Celestial & Wise',
  },
  {
    id: 'mascot_leo',
    name: 'Leo Lion Companion',
    category: 'companions',
    Svg: MascotLeoSvg,
    tag: 'Artist & Brave',
  },
  {
    id: 'mascot_penny',
    name: 'Penny Princess Companion',
    category: 'companions',
    Svg: MascotPennySvg,
    tag: 'Royal & Magic',
  },
  {
    id: 'mascot_dexter',
    name: 'Dexter Dino Companion',
    category: 'companions',
    Svg: MascotDexterSvg,
    tag: 'Safari & Fossil',
  },
  {
    id: 'mascot_carty',
    name: 'Carty Courier Companion',
    category: 'companions',
    Svg: MascotCartySvg,
    tag: 'Speed & Tech',
  },
  {
    id: 'mascot_sparky',
    name: 'Sparky Hound Companion',
    category: 'companions',
    Svg: MascotSparkySvg,
    tag: 'Hype & Style',
  },

  // Story Badges & Crests
  {
    id: 'badge_hero',
    name: 'Story Hero Star Shield',
    category: 'badges',
    Svg: BadgeHeroSvg,
    tag: 'Hero Medal',
  },
  {
    id: 'badge_brave',
    name: 'Brave Heart Crest',
    category: 'badges',
    Svg: BadgeBraveSvg,
    tag: 'Courage',
  },
  {
    id: 'badge_starlight',
    name: 'Starlight Medallion',
    category: 'badges',
    Svg: BadgeStarlightSvg,
    tag: 'Constellation',
  },
  {
    id: 'badge_certified',
    name: 'Proof Certified Seal',
    category: 'badges',
    Svg: BadgeCertifiedSvg,
    tag: 'Archival Seal',
  },
  {
    id: 'badge_dino_scout',
    name: 'Dino Scout Patch',
    category: 'badges',
    Svg: BadgeDinoScoutSvg,
    tag: 'Expedition',
  },

  // Props & Nature
  {
    id: 'bubble',
    name: 'Story Speech Bubble',
    category: 'props',
    Svg: BubblePropSvg,
    tag: 'Dialogue Text',
  },
  {
    id: 'rose',
    name: 'Celestial Prince Rose',
    category: 'props',
    Svg: RosePropSvg,
    tag: 'Glass Dome',
  },
  {
    id: 'compass',
    name: 'Explorer Brass Compass',
    category: 'props',
    Svg: CompassPropSvg,
    tag: 'True North',
  },
  {
    id: 'magic_wand',
    name: 'Starlight Wand',
    category: 'props',
    Svg: WandPropSvg,
    tag: 'Enchanted',
  },
  {
    id: 'treasure_chest',
    name: 'Heirloom Treasure Chest',
    category: 'props',
    Svg: ChestPropSvg,
    tag: 'Hidden Gold',
  },
  {
    id: 'planet',
    name: 'Cosmic Ringed Planet',
    category: 'props',
    Svg: PlanetPropSvg,
    tag: 'Saturn Wonder',
  },

  // Classic Stamps (kept exact for 100% test compatibility)
  {
    id: 'star',
    name: 'Golden Star',
    category: 'classic',
    Svg: StarStampSvg,
    tag: 'Foil Gold',
  },
  {
    id: 'rocket',
    name: 'Cosmic Rocket',
    category: 'classic',
    Svg: RocketStampSvg,
    tag: 'Deep Space',
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    category: 'classic',
    Svg: CrownStampSvg,
    tag: 'Imperial',
  },
  {
    id: 'sneaker',
    name: 'Sneaker Crest',
    category: 'classic',
    Svg: SneakerStampSvg,
    tag: 'Streetwear',
  },
  {
    id: 'sparkle',
    name: 'Magic Twinkle',
    category: 'classic',
    Svg: SparkleStampSvg,
    tag: 'Stardust',
  },
  {
    id: 'heart',
    name: 'Kindness Heart',
    category: 'classic',
    Svg: HeartStampSvg,
    tag: 'Pure Love',
  },
];

// Backwards-compatible export of STICKER_TYPES
export const STICKER_TYPES = STICKER_CATALOG.map(({ id, name }) => ({ id, name }));

export function StickerBar({
  selectedSticker,
  onSelectSticker,
  onClearStickers,
  stickersCount = 0,
  onAddStickerToCenter = null,
  bubbleText = 'Adventure time!',
  onChangeBubbleText = null,
  onUndo = null,
  onRedo = null,
  canUndo = false,
  canRedo = false,
}) {
  const [activeCategory, setActiveCategory] = useState('classic');

  const filteredCatalog =
    activeCategory === 'all'
      ? STICKER_CATALOG
      : STICKER_CATALOG.filter((s) => s.category === activeCategory);

  const activeStickerObj = STICKER_CATALOG.find((s) => s.id === selectedSticker);

  return (
    <div className={styles.barContainer}>
      <div className={styles.barHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.barTitle}>Story Assets & Stamps</span>
          <span className={styles.assetCountBadge}>{filteredCatalog.length} available</span>
        </div>

        <div className={styles.headerActions}>
          {onUndo && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo last stamp action (Cmd+Z)"
              aria-label="Undo stamp action"
            >
              <UndoIcon size={12} />
              <span>Undo</span>
            </button>
          )}
          {onRedo && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo stamp action"
              aria-label="Redo stamp action"
            >
              <RedoIcon size={12} />
              <span>Redo</span>
            </button>
          )}
          {stickersCount > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClearStickers}
              title="Remove all stamps"
              aria-label={`Clear (${stickersCount}) stamps`}
            >
              <TrashIcon size={12} />
              <span>Clear ({stickersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className={styles.categoryTabs} role="tablist" aria-label="Asset Categories">
        {STICKER_CATEGORIES.map((cat) => {
          const IconComponent = cat.Icon;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`${styles.categoryTab} ${
                activeCategory === cat.id ? styles.categoryTabActive : ''
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className={styles.catIcon}>
                <IconComponent size={14} />
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Speech Bubble text configurator if bubble is active */}
      {(selectedSticker === 'bubble' || activeCategory === 'props') && onChangeBubbleText && (
        <div className={styles.bubbleConfigRow}>
          <span className={styles.bubbleIconWrap}>
            <BubblePropSvg size={18} />
          </span>
          <label htmlFor="bubbleTextInput" className={styles.bubbleLabel}>
            Speech Bubble Text:
          </label>
          <input
            id="bubbleTextInput"
            type="text"
            className={styles.bubbleInput}
            value={bubbleText}
            maxLength={32}
            onChange={(e) => onChangeBubbleText(e.target.value)}
            placeholder="e.g. Look at that star!"
          />
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className={styles.stickerRow}>
        {filteredCatalog.map((s) => {
          const isSelected = selectedSticker === s.id;
          const StickerSvg = s.Svg;
          return (
            <div key={s.id} className={styles.stickerCardWrap}>
              <button
                type="button"
                className={`${styles.stickerBtn} ${
                  isSelected ? styles.stickerSelected : ''
                }`}
                onClick={() => onSelectSticker(isSelected ? null : s.id)}
                aria-label={`Select ${s.name} sticker to stamp`}
              >
                <span className={styles.stickerBadge}>
                  <StickerSvg size={26} />
                </span>
                <div className={styles.stickerTextMeta}>
                  <span className={styles.stickerLabel}>{s.name}</span>
                  <span className={styles.stickerTag}>{s.tag}</span>
                </div>
              </button>

              {onAddStickerToCenter && (
                <button
                  type="button"
                  className={styles.quickAddCenterBtn}
                  onClick={() => onAddStickerToCenter(s.id)}
                  title={`Drop ${s.name} into page center`}
                  aria-label={`Place ${s.name} at center`}
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Stamping Hint */}
      <div className={styles.barFooter}>
        <p className={styles.hintText}>
          {selectedSticker
            ? 'Tap anywhere on the illustration stage to stamp!'
            : 'Select a stamp above, or drag placed stamps to reposition.'}
        </p>
        {activeStickerObj && (
          <span className={styles.activeStampPill}>
            Active Tool: <strong>{activeStickerObj.name}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

StickerBar.propTypes = {
  selectedSticker: PropTypes.string,
  onSelectSticker: PropTypes.func.isRequired,
  onClearStickers: PropTypes.func.isRequired,
  stickersCount: PropTypes.number,
  onAddStickerToCenter: PropTypes.func,
  bubbleText: PropTypes.string,
  onChangeBubbleText: PropTypes.func,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
};
