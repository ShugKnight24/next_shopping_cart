import PropTypes from 'prop-types';
import { useId, useMemo, useState } from 'react';
import { RotateCcwIcon, SparklesIcon } from '../../Icons';
import {
  CompanionPortrait,
  DEFAULT_PET_NAMES,
  HeroPortrait,
  PET_SPECIES,
} from '../CharacterPortraits';
import {
  CHARACTER_GROUPS,
  COMPANION_GROUPS,
  DEFAULT_AVATAR,
  DEFAULT_COMPANION,
  describeCharacter,
  normalizeAvatar,
  normalizeCompanion,
  randomAvatar,
  randomCompanion,
} from '../core/characterSchema';
import styles from './CharacterPanel.module.css';
import {
  SegmentedControl,
  SelectField,
  SwatchGrid,
  TextField,
} from './WorkbenchFields';
import { InspectorSection, WorkbenchButton } from './WorkbenchShell';

/**
 * The cast panel: the hero and the co-star, inside the workbench inspector.
 *
 * Everything it offers comes out of `core/characterSchema` — the same tables the
 * canvas renderer reads — so an option cannot appear here without reaching the
 * printed page. The two portraits are the ones `CharacterPortraits` draws,
 * imported rather than re-derived: one implementation, two hosts.
 */

/* ----------------------------------------------------------- group rows -- */

/**
 * A segmented control is only honest at inspector width when the whole group
 * fits on one line. Twelve hairstyles, or a three-up row carrying
 * "Pocket-sized", would spill out of a 320px rail — those become a select.
 */
const SEGMENT_MAX_OPTIONS = 3;
const SEGMENT_MAX_LABEL = 8;

const fitsSegments = (table) =>
  table.length <= SEGMENT_MAX_OPTIONS &&
  table.every((option) => option.name.length <= SEGMENT_MAX_LABEL);

/** One schema group, drawn with the workbench primitive that suits its shape. */
const renderGroup = (group, source, onChange) => {
  const value = source[group.key];
  const commit = (next) => onChange(group.key, next);

  if (group.kind === 'swatch') {
    return (
      <SwatchGrid
        key={group.key}
        label={group.label}
        options={group.table}
        value={value}
        onChange={commit}
        columns={Math.min(6, group.table.length)}
      />
    );
  }

  const options = group.table.map((option) => ({
    value: option.id,
    label: option.name,
  }));

  return fitsSegments(group.table) ? (
    <SegmentedControl
      key={group.key}
      label={group.label}
      options={options}
      value={value}
      onChange={commit}
    />
  ) : (
    <SelectField
      key={group.key}
      label={group.label}
      options={options}
      value={value}
      onChange={commit}
    />
  );
};

/* ---------------------------------------------------------------- panel -- */

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'companion', label: 'Companion' },
];

export const CharacterPanel = ({
  avatar,
  companion,
  onChangeAvatar,
  onChangeCompanion,
}) => {
  const baseId = useId();
  const [tab, setTab] = useState('hero');
  const [announcement, setAnnouncement] = useState('');

  const hero = useMemo(() => normalizeAvatar(avatar), [avatar]);
  const pet = useMemo(() => normalizeCompanion(companion), [companion]);
  const sheet = useMemo(() => describeCharacter(hero, pet), [hero, pet]);

  const isHero = tab === 'hero';
  const idFor = (name) => `${baseId}-${name}`;

  const species =
    PET_SPECIES.find((entry) => entry.id === pet.species) ?? PET_SPECIES[0];

  const heroLabel = `Hero portrait. ${[
    'Skin',
    'Hair',
    'Eyes',
    'Expression',
    'Outfit',
    'Accessories',
  ]
    .map((key) => `${key}: ${sheet[key]}`)
    .join('. ')}.`;

  const companionLabel = `Portrait of ${pet.name}. ${[
    'Companion Coat',
    'Companion Collar',
    'Companion Pose',
  ]
    .map((key) => `${key.replace('Companion ', '')}: ${sheet[key]}`)
    .join('. ')}.`;

  const setHeroKey = (key, value) => onChangeAvatar({ ...hero, [key]: value });
  const setPetKey = (key, value) => onChangeCompanion({ ...pet, [key]: value });

  /** Renaming is the shopper's job; a species swap only renames a pet still
   *  carrying the mascot's own default name. */
  const setSpecies = (id) => {
    const defaults = Object.values(DEFAULT_PET_NAMES);
    const keepName = pet.name && !defaults.includes(pet.name);

    onChangeCompanion({
      ...pet,
      species: id,
      name: keepName ? pet.name : (DEFAULT_PET_NAMES[id] ?? pet.name),
    });
  };

  const handleSurprise = () => {
    if (isHero) {
      onChangeAvatar(randomAvatar());
      setAnnouncement('Hero randomized.');
      return;
    }

    onChangeCompanion({ ...randomCompanion(pet.species), name: pet.name });
    setAnnouncement(`${pet.name} randomized.`);
  };

  const handleReset = () => {
    if (isHero) {
      onChangeAvatar({ ...DEFAULT_AVATAR });
      setAnnouncement('Hero reset to the default look.');
      return;
    }

    onChangeCompanion({
      ...DEFAULT_COMPANION,
      species: pet.species,
      name: pet.name,
    });
    setAnnouncement(`${pet.name} reset to the default look.`);
  };

  /** Arrow keys move between tabs inside one tab stop, as a tablist should. */
  const handleTabKeys = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];
    if (!step) return;

    event.preventDefault();
    const index = TABS.findIndex((entry) => entry.id === tab);
    setTab(TABS[(index + step + TABS.length) % TABS.length].id);
  };

  return (
    <InspectorSection title="Cast">
      <div className={styles.tabs} role="tablist" aria-label="Character">
        {TABS.map((entry) => {
          const selected = entry.id === tab;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={idFor(`${entry.id}-tab`)}
              aria-selected={selected}
              aria-controls={idFor(entry.id)}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
              onClick={() => setTab(entry.id)}
              onKeyDown={handleTabKeys}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <p className={styles.srOnly} role="status">
        {announcement}
      </p>

      <div className={styles.stage}>
        {isHero ? (
          <HeroPortrait avatar={hero} label={heroLabel} />
        ) : (
          <CompanionPortrait companion={pet} label={companionLabel} />
        )}
      </div>

      <p className={styles.caption}>
        <strong className={styles.captionName}>
          {isHero ? 'Starring hero' : pet.name}
        </strong>
        <span className={styles.captionMeta}>
          {isHero ? sheet.Outfit : species.archetype}
        </span>
      </p>

      <div className={styles.actions}>
        <WorkbenchButton
          variant="subtle"
          icon={<SparklesIcon size={14} />}
          onClick={handleSurprise}
        >
          Surprise me
        </WorkbenchButton>
        <WorkbenchButton
          icon={<RotateCcwIcon size={14} />}
          onClick={handleReset}
        >
          Reset
        </WorkbenchButton>
      </div>

      <div
        id={idFor('hero')}
        role="tabpanel"
        aria-labelledby={idFor('hero-tab')}
        hidden={!isHero}
        className={styles.fields}
      >
        {isHero &&
          CHARACTER_GROUPS.map((group) => renderGroup(group, hero, setHeroKey))}
      </div>

      <div
        id={idFor('companion')}
        role="tabpanel"
        aria-labelledby={idFor('companion-tab')}
        hidden={isHero}
        className={styles.fields}
      >
        {!isHero && (
          <>
            <TextField
              label="Name"
              value={pet.name}
              onChange={(value) => setPetKey('name', value)}
              placeholder="Biscuit, Nova, Barnaby…"
              hint="Printed wherever the co-star is named."
            />

            <SelectField
              label="Species"
              value={pet.species}
              onChange={setSpecies}
              options={PET_SPECIES.map((entry) => ({
                value: entry.id,
                label: entry.name,
              }))}
            />

            {COMPANION_GROUPS.map((group) =>
              renderGroup(group, pet, setPetKey)
            )}
          </>
        )}
      </div>
    </InspectorSection>
  );
};

CharacterPanel.propTypes = {
  avatar: PropTypes.object,
  companion: PropTypes.object,
  onChangeAvatar: PropTypes.func.isRequired,
  onChangeCompanion: PropTypes.func.isRequired,
};
