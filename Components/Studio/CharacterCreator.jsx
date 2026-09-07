import PropTypes from 'prop-types';
import { useState } from 'react';
import { SparklesIcon, CheckCircleIcon } from '../Icons';
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
} from './StudioSVGs';
import styles from './CharacterCreator.module.css';

export const SKIN_TONES = [
  { id: '#fed7aa', label: 'Porcelain Peach', hex: '#fed7aa' },
  { id: '#fbd38d', label: 'Honey Gold', hex: '#fbd38d' },
  { id: '#e5a95d', label: 'Warm Sand', hex: '#e5a95d' },
  { id: '#d97706', label: 'Caramel Bronze', hex: '#d97706' },
  { id: '#92400e', label: 'Deep Chestnut', hex: '#92400e' },
  { id: '#451a03', label: 'Rich Espresso', hex: '#451a03' },
];

export const HAIR_STYLES = [
  { id: 'crop', label: 'Short Crop' },
  { id: 'curls', label: 'Fluffy Curls' },
  { id: 'waves', label: 'Long Waves' },
  { id: 'braids', label: 'Royal Braids' },
  { id: 'ponytail', label: 'High Ponytail' },
  { id: 'spiky', label: 'Spiky Adventure' },
  { id: 'beanie', label: 'Starlight Beanie' },
];

export const HAIR_COLORS = [
  { id: '#1c1917', label: 'Ebony Black', hex: '#1c1917' },
  { id: '#4a2c11', label: 'Chestnut Brown', hex: '#4a2c11' },
  { id: '#fde047', label: 'Golden Sun', hex: '#fde047' },
  { id: '#ea580c', label: 'Auburn Red', hex: '#ea580c' },
  { id: '#ec4899', label: 'Pastel Rose', hex: '#ec4899' },
  { id: '#0284c7', label: 'Galactic Cyan', hex: '#0284c7' },
];

export const ACCESSORIES = [
  { id: 'none', label: 'None' },
  { id: 'glasses', label: 'Round Specs' },
  { id: 'star_shades', label: 'Star Shades' },
  { id: 'superhero_mask', label: 'Hero Mask' },
  { id: 'freckles', label: 'Sun Freckles' },
  { id: 'cape', label: 'Hero Cape' },
];

export const OUTFIT_COLORS = [
  { id: '#2563eb', label: 'Royal Blue', hex: '#2563eb' },
  { id: '#dc2626', label: 'Ruby Crimson', hex: '#dc2626' },
  { id: '#059669', label: 'Emerald Pine', hex: '#059669' },
  { id: '#d97706', label: 'Golden Ochre', hex: '#d97706' },
  { id: '#7c3aed', label: 'Nebula Purple', hex: '#7c3aed' },
  { id: '#0f172a', label: 'Obsidian Black', hex: '#0f172a' },
];

export const PET_SPECIES = [
  { id: 'leo', name: 'Leo The Story Lion', archetype: 'Courage Lion', Svg: MascotLeoSvg },
  { id: 'penny', name: 'Princess Penny', archetype: 'Royal Kitty', Svg: MascotPennySvg },
  { id: 'finley', name: 'Finley Fox', archetype: 'Celestial Fox', Svg: MascotFinleySvg },
  { id: 'luna', name: 'Luna Shepherd', archetype: 'Starlight Pup', Svg: MascotLunaSvg },
  { id: 'dexter', name: 'Dexter Dino', archetype: 'Explorer Dino', Svg: MascotDexterSvg },
  { id: 'carty', name: 'Carty Courier', archetype: 'Courier Bot', Svg: MascotCartySvg },
  { id: 'sparky', name: 'Sparky Hound', archetype: 'Hero Dragon Hound', Svg: MascotSparkySvg },
];

export const PET_COLLARS = [
  { id: 'star_bandana', label: 'Star Bandana' },
  { id: 'golden_bell', label: 'Gold Bell Collar' },
  { id: 'explorer_scarf', label: 'Explorer Scarf' },
  { id: 'capelet', label: 'Mini Capelet' },
  { id: 'bowtie', label: 'Royal Bowtie' },
];

export const PET_BADGES = [
  { id: 'badge_hero', label: 'Hero Shield', Svg: BadgeHeroSvg },
  { id: 'badge_brave', label: 'Brave Heart', Svg: BadgeBraveSvg },
  { id: 'badge_starlight', label: 'Starlight', Svg: BadgeStarlightSvg },
  { id: 'badge_certified', label: 'Official Seal', Svg: BadgeCertifiedSvg },
  { id: 'badge_dino_scout', label: 'Scout Patch', Svg: BadgeDinoScoutSvg },
];

export const DEFAULT_PET_NAMES = {
  leo: 'Leo',
  penny: 'Penny',
  finley: 'Finley',
  luna: 'Luna',
  dexter: 'Dexter',
  carty: 'Carty',
  sparky: 'Sparky',
};

const SPECIES_ALIASES = {
  dog: 'luna',
  cat: 'penny',
  fox: 'finley',
  lion: 'leo',
  dino: 'dexter',
  robot: 'carty',
  dragon: 'sparky',
};

export function CharacterCreator({
  heroName = 'Noah',
  avatar = {},
  onChangeAvatar = () => {},
  companion = {},
  onChangeCompanion = () => {},
  initialTab = 'hero',
  onSave = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'hero' | 'companion'

  // Default values with fallback aliases
  const currentSkin = avatar.skin || '#fbd38d';
  const currentHairStyle = avatar.hairstyle || avatar.hairStyle || 'curls';
  const currentHairColor = avatar.hairColor || avatar.hair || '#4a2c11';
  const currentAccessory = avatar.accessory || 'cape';
  const currentOutfit = avatar.outfitColor || avatar.outfit || '#2563eb';

  const rawSpecies = companion.species || 'leo';
  const petSpecies = SPECIES_ALIASES[rawSpecies] || rawSpecies;
  const petName = companion.name || 'Leo';
  const petFur = companion.furColor || '#ea580c';
  const petCollar = companion.collar || 'star_bandana';
  const petBadge = companion.badge || 'badge_hero';

  const activePetObj = PET_SPECIES.find((p) => p.id === petSpecies) || PET_SPECIES[0];
  const activePetBadgeObj = PET_BADGES.find((b) => b.id === petBadge) || PET_BADGES[0];

  const curPetIdx = PET_SPECIES.findIndex((p) => p.id === petSpecies);
  const nextPetIdx = curPetIdx >= 0 ? (curPetIdx + 1) % PET_SPECIES.length : 0;
  const prevPetIdx = curPetIdx >= 0 ? (curPetIdx - 1 + PET_SPECIES.length) % PET_SPECIES.length : 0;
  const nextPetSpecies = PET_SPECIES[nextPetIdx];
  const nextCompanionLabel = nextPetSpecies?.name.split(' ')[0] || 'Next';

  const handleSelectSpecies = (specId) => {
    const knownDefaultNames = Object.values(DEFAULT_PET_NAMES);
    const shouldUpdateName =
      !companion.name ||
      knownDefaultNames.includes(companion.name) ||
      companion.name === 'Leo';

    const newName = shouldUpdateName
      ? DEFAULT_PET_NAMES[specId] || specId
      : companion.name;

    onChangeCompanion({
      ...companion,
      species: specId,
      name: newName,
    });
  };

  const handleNextCompanion = () => {
    handleSelectSpecies(PET_SPECIES[nextPetIdx].id);
  };

  const handlePrevCompanion = () => {
    handleSelectSpecies(PET_SPECIES[prevPetIdx].id);
  };

  return (
    <div className={styles.creatorRoot}>
      {/* Creator Tabs */}
      <div className={styles.tabBar} role="tablist" aria-label="Character Customizer Tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'hero'}
          className={`${styles.tabBtn} ${activeTab === 'hero' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <SparklesIcon size={14} />
          <span>Star Hero (Child / You)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'companion'}
          className={`${styles.tabBtn} ${activeTab === 'companion' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          <activePetObj.Svg size={15} />
          <span>Trusty Companion (Pet / Co-Star)</span>
        </button>
      </div>

      <div className={styles.creatorLayout}>
        {/* Left: Customization Controls */}
        <div className={styles.controlsCol}>
          {activeTab === 'hero' && (
            <div className={styles.panelSection}>
              {/* Skin Tone Selector */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Skin Tone:</label>
                <div className={styles.swatchGrid}>
                  {SKIN_TONES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`${styles.swatchBtn} ${
                        currentSkin === st.hex ? styles.swatchActive : ''
                      }`}
                      style={{ background: st.hex }}
                      onClick={() => onChangeAvatar({ ...avatar, skin: st.hex })}
                      title={st.label}
                      aria-label={`Select ${st.label} skin tone`}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style Selector */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Hair Style:</label>
                <div className={styles.pillGrid}>
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs.id}
                      type="button"
                      className={`${styles.pillBtn} ${
                        currentHairStyle === hs.id ? styles.pillBtnActive : ''
                      }`}
                      onClick={() =>
                        onChangeAvatar({
                          ...avatar,
                          hairStyle: hs.id,
                          hairstyle: hs.id,
                        })
                      }
                    >
                      {hs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color Selector */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Hair Color:</label>
                <div className={styles.swatchGrid}>
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.id}
                      type="button"
                      className={`${styles.swatchBtn} ${
                        currentHairColor === hc.hex ? styles.swatchActive : ''
                      }`}
                      style={{ background: hc.hex }}
                      onClick={() =>
                        onChangeAvatar({
                          ...avatar,
                          hair: hc.hex,
                          hairColor: hc.hex,
                        })
                      }
                      title={hc.label}
                      aria-label={`Select ${hc.label} hair color`}
                    />
                  ))}
                </div>
              </div>

              {/* Accessory & Headwear */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Face & Character Accessory:</label>
                <div className={styles.pillGrid}>
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className={`${styles.pillBtn} ${
                        currentAccessory === acc.id ? styles.pillBtnActive : ''
                      }`}
                      onClick={() => onChangeAvatar({ ...avatar, accessory: acc.id })}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Color */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Outfit / Cape Color:</label>
                <div className={styles.swatchGrid}>
                  {OUTFIT_COLORS.map((oc) => (
                    <button
                      key={oc.id}
                      type="button"
                      className={`${styles.swatchBtn} ${
                        currentOutfit === oc.hex ? styles.swatchActive : ''
                      }`}
                      style={{ background: oc.hex }}
                      onClick={() =>
                        onChangeAvatar({
                          ...avatar,
                          outfit: oc.hex,
                          outfitColor: oc.hex,
                        })
                      }
                      title={oc.label}
                      aria-label={`Select ${oc.label} outfit color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companion' && (
            <div className={styles.panelSection}>
              {/* Pet Name */}
              <div className={styles.optionGroup}>
                <label htmlFor="petNameInput" className={styles.groupLabel}>
                  Companion Pet Name:
                </label>
                <input
                  id="petNameInput"
                  type="text"
                  className={styles.petNameInput}
                  value={petName}
                  maxLength={18}
                  onChange={(e) =>
                    onChangeCompanion({ ...companion, name: e.target.value })
                  }
                  placeholder="e.g. Barnaby, Biscuit, Nova..."
                />
              </div>

              {/* Companion Species */}
              <div className={styles.optionGroup}>
                <div className={styles.companionHeaderRow}>
                  <label className={styles.groupLabel}>Companion Archetype:</label>
                  <div className={styles.companionNav}>
                    <button
                      type="button"
                      className={styles.cycleBtn}
                      onClick={handlePrevCompanion}
                      title="Previous companion"
                      aria-label="Previous companion archetype"
                    >
                      ‹
                    </button>
                    <span className={styles.cycleCounter}>
                      {curPetIdx >= 0 ? curPetIdx + 1 : 1} of {PET_SPECIES.length}
                    </span>
                    <button
                      type="button"
                      className={styles.cycleBtn}
                      onClick={handleNextCompanion}
                      title={`Switch to next companion (${nextCompanionLabel})`}
                      aria-label={`Switch to next companion (${nextCompanionLabel})`}
                    >
                      Next: {nextCompanionLabel} ›
                    </button>
                  </div>
                </div>
                <div className={styles.speciesGrid}>
                  {PET_SPECIES.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      className={`${styles.speciesCard} ${
                        petSpecies === spec.id ? styles.speciesCardActive : ''
                      }`}
                      onClick={() => handleSelectSpecies(spec.id)}
                    >
                      <spec.Svg size={24} />
                      <span>{spec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fur Palette */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Fur / Coat Color:</label>
                <div className={styles.swatchGrid}>
                  {[
                    { hex: '#ea580c', label: 'Amber Red' },
                    { hex: '#f59e0b', label: 'Golden Honey' },
                    { hex: '#ffffff', label: 'Snow White' },
                    { hex: '#292524', label: 'Midnight Black' },
                    { hex: '#a855f7', label: 'Starlight Lavender' },
                    { hex: '#10b981', label: 'Emerald Dragon' },
                  ].map((f) => (
                    <button
                      key={f.hex}
                      type="button"
                      className={`${styles.swatchBtn} ${
                        petFur === f.hex ? styles.swatchActive : ''
                      }`}
                      style={{ background: f.hex }}
                      onClick={() =>
                        onChangeCompanion({ ...companion, furColor: f.hex })
                      }
                      title={f.label}
                      aria-label={`Select ${f.label} fur color`}
                    />
                  ))}
                </div>
              </div>

              {/* Pet Collar / Wearable */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Collar & Bandana:</label>
                <div className={styles.pillGrid}>
                  {PET_COLLARS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      className={`${styles.pillBtn} ${
                        petCollar === col.id ? styles.pillBtnActive : ''
                      }`}
                      onClick={() =>
                        onChangeCompanion({ ...companion, collar: col.id })
                      }
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Superpower Badge */}
              <div className={styles.optionGroup}>
                <label className={styles.groupLabel}>Companion Superpower Badge:</label>
                <div className={styles.badgeGrid}>
                  {PET_BADGES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`${styles.badgeBtn} ${
                        petBadge === b.id ? styles.badgeBtnActive : ''
                      }`}
                      onClick={() =>
                        onChangeCompanion({ ...companion, badge: b.id })
                      }
                      title={b.label}
                    >
                      <b.Svg size={20} />
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {onSave && (
            <button
              type="button"
              className={styles.applyCreatorBtn}
              onClick={onSave}
              aria-label="Save customized characters"
            >
              <CheckCircleIcon size={16} />
              <span>Apply Custom Characters to Story</span>
            </button>
          )}
        </div>

        {/* Right: Live Interactive Vector Character Card Preview */}
        <div className={styles.previewCol}>
          <div className={styles.characterCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTag}>Live Character Proof</span>
              <span className={styles.cardRoleBadge}>
                {activeTab === 'hero' ? 'Starring Hero' : 'Trusty Companion'}
              </span>
            </div>

            <div className={styles.avatarStageWrap}>
              {activeTab === 'hero' ? (
                <svg
                  width="130"
                  height="160"
                  viewBox="0 0 130 160"
                  className={styles.avatarSvg}
                  aria-hidden="true"
                >
                  {/* Cape behind */}
                  {currentAccessory === 'cape' && (
                    <path
                      d="M65 80 L35 150 L65 140 L95 150 Z"
                      fill={currentOutfit}
                      opacity="0.85"
                    />
                  )}
                  {/* Outfit body */}
                  <rect
                    x="45"
                    y="75"
                    width="40"
                    height="50"
                    rx="10"
                    fill={currentOutfit}
                  />
                  {/* Neck */}
                  <rect x="58" y="65" width="14" height="12" fill={currentSkin} />
                  {/* Head */}
                  <circle cx="65" cy="48" r="24" fill={currentSkin} />
                  {/* Hair Style */}
                  {currentHairStyle === 'crop' && (
                    <path
                      d="M41 45 C41 26 89 26 89 45 C85 32 75 28 65 28 C55 28 45 32 41 45 Z"
                      fill={currentHairColor}
                    />
                  )}
                  {currentHairStyle === 'curls' && (
                    <g fill={currentHairColor}>
                      <circle cx="45" cy="35" r="9" />
                      <circle cx="65" cy="28" r="10" />
                      <circle cx="85" cy="35" r="9" />
                      <circle cx="53" cy="29" r="8" />
                      <circle cx="77" cy="29" r="8" />
                    </g>
                  )}
                  {currentHairStyle === 'waves' && (
                    <path
                      d="M41 46 C41 24 89 24 89 46 L91 75 C85 70 82 50 82 46 C75 32 55 32 48 46 C48 50 45 70 39 75 Z"
                      fill={currentHairColor}
                    />
                  )}
                  {currentHairStyle === 'braids' && (
                    <g fill={currentHairColor}>
                      <path d="M41 45 C41 26 89 26 89 45 Z" />
                      <rect x="38" y="44" width="7" height="35" rx="3.5" />
                      <rect x="85" y="44" width="7" height="35" rx="3.5" />
                    </g>
                  )}
                  {currentHairStyle === 'ponytail' && (
                    <g fill={currentHairColor}>
                      <path d="M41 45 C41 26 89 26 89 45 Z" />
                      <ellipse cx="88" cy="30" rx="14" ry="7" transform="rotate(35 88 30)" />
                    </g>
                  )}
                  {currentHairStyle === 'spiky' && (
                    <polygon
                      points="41,45 45,20 53,30 65,15 77,30 85,20 89,45"
                      fill={currentHairColor}
                    />
                  )}
                  {currentHairStyle === 'beanie' && (
                    <path
                      d="M39 44 C39 25 91 25 91 44 L91 48 L39 48 Z"
                      fill="#0284c7"
                    />
                  )}
                  {/* Eyes */}
                  <circle cx="57" cy="46" r="2.8" fill="#1e293b" />
                  <circle cx="73" cy="46" r="2.8" fill="#1e293b" />
                  <circle cx="58" cy="45" r="1" fill="#ffffff" />
                  <circle cx="74" cy="45" r="1" fill="#ffffff" />
                  {/* Smile */}
                  <path
                    d="M59 55 Q 65 61 71 55"
                    stroke="#1e293b"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Glasses Accessory */}
                  {currentAccessory === 'glasses' && (
                    <g stroke="#0f172a" strokeWidth="2" fill="rgba(255,255,255,0.4)">
                      <circle cx="57" cy="46" r="6" />
                      <circle cx="73" cy="46" r="6" />
                      <line x1="63" y1="46" x2="67" y2="46" />
                    </g>
                  )}
                  {/* Star Shades Accessory */}
                  {currentAccessory === 'star_shades' && (
                    <g fill="#f59e0b">
                      <polygon points="57,40 59,44 63,44 60,47 61,51 57,48 53,51 54,47 51,44 55,44" />
                      <polygon points="73,40 75,44 79,44 76,47 77,51 73,48 69,51 70,47 67,44 71,44" />
                      <line x1="63" y1="45" x2="67" y2="45" stroke="#f59e0b" strokeWidth="2" />
                    </g>
                  )}
                  {/* Superhero mask */}
                  {currentAccessory === 'superhero_mask' && (
                    <path
                      d="M48 42 Q 65 48 82 42 Q 86 52 75 52 Q 65 48 55 52 Q 44 52 48 42 Z"
                      fill="#dc2626"
                    />
                  )}
                  {/* Sun Freckles */}
                  {currentAccessory === 'freckles' && (
                    <g fill="#92400e">
                      <circle cx="53" cy="51" r="0.8" />
                      <circle cx="55" cy="52" r="0.8" />
                      <circle cx="75" cy="51" r="0.8" />
                      <circle cx="77" cy="52" r="0.8" />
                    </g>
                  )}
                </svg>
              ) : (
                <div className={styles.petPreviewWrap}>
                  <activePetObj.Svg size={80} />
                  <div className={styles.petBadgePreview}>
                    <activePetBadgeObj.Svg size={28} />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.cardFooterMeta}>
              <strong className={styles.previewName}>
                {activeTab === 'hero' ? heroName : petName}
              </strong>
              <span className={styles.previewDesc}>
                {activeTab === 'hero'
                  ? `Customized Hero • ${currentHairStyle}`
                  : `${activePetObj.name} with ${activePetBadgeObj.label}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CharacterCreator.propTypes = {
  heroName: PropTypes.string,
  avatar: PropTypes.object,
  onChangeAvatar: PropTypes.func,
  companion: PropTypes.object,
  onChangeCompanion: PropTypes.func,
  initialTab: PropTypes.string,
  onSave: PropTypes.func,
};
