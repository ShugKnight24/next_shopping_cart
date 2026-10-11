import PropTypes from 'prop-types';
import { useState } from 'react';
import { PET_SPECIES } from '../CharacterPortraits';
import {
  COMPANION_GROUPS,
  PET_COLLARS,
  PET_POSES,
  normalizeCompanion,
} from '../core/characterSchema';
import {
  SegmentedControl,
  SwatchGrid,
  ToggleRow,
} from '../workbench/WorkbenchFields';
import { PersonImage, PetImage, TileGrid } from './CastArt';
import styles from './CastPanel.module.css';
import {
  AGES,
  BOTTOMS,
  BROWS,
  BUILDS,
  CLOTH_COLORS,
  EYE_COLORS,
  EYE_STYLES,
  FACE_SHAPES,
  FACIAL_HAIR,
  GLASSES,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  HEIGHTS,
  NOSES,
  PATTERNS,
  SHOES,
  SKIN_TONES,
  TOPS,
  normalizePerson,
} from './castRig';

/**
 * Who a cast member is: their look, edited with try-on tiles. Each tile is
 * this person wearing that option, so a shopper picks by looking, not by
 * reading a list of names.
 */

const TABS = [
  { value: 'body', label: 'Body' },
  { value: 'face', label: 'Face' },
  { value: 'hair', label: 'Hair' },
  { value: 'outfit', label: 'Outfit' },
];

/** SwatchGrid speaks hex values; the rig stores ids. Translate both ways. */
const ColorPicker = ({ label, table, value, onChange }) => (
  <SwatchGrid
    label={label}
    options={table.map((o) => ({ value: o.value, name: o.name }))}
    value={table.find((o) => o.id === value)?.value}
    onChange={(hex) =>
      onChange(table.find((o) => o.value === hex)?.id ?? value)
    }
    columns={7}
  />
);

ColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  table: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export const LookEditor = ({ member, onChange }) => {
  const [tab, setTab] = useState('hair');
  const person = normalizePerson(member);
  const set = (key) => (value) => onChange({ [key]: value });

  /** Tiles that show this person with one option swapped. */
  const tryOn = (key, table, crop, filter = () => true) =>
    table.filter(filter).map((o) => ({
      value: o.id,
      name: o.name,
      art: <PersonImage person={{ ...person, [key]: o.id }} crop={crop} />,
    }));

  const grid = (label, key, table, crop = 'head', extra = {}) => (
    <TileGrid
      label={label}
      options={tryOn(key, table, crop, extra.filter)}
      value={person[key]}
      onChange={set(key)}
      columns={extra.columns ?? 3}
      shape={crop === 'full' ? 'tall' : 'square'}
    />
  );

  return (
    <div className={styles.editor}>
      <SegmentedControl
        label="Edit"
        options={TABS}
        value={tab}
        onChange={setTab}
        hideLabel
      />

      {tab === 'body' && (
        <>
          {grid('Age', 'age', AGES, 'full')}
          {grid('Build', 'build', BUILDS, 'full', { columns: 4 })}
          <SegmentedControl
            label="Height"
            options={HEIGHTS.map((h) => ({ value: h.id, label: h.name }))}
            value={person.height}
            onChange={set('height')}
          />
          <ColorPicker
            label="Skin tone"
            table={SKIN_TONES}
            value={person.skin}
            onChange={set('skin')}
          />
        </>
      )}

      {tab === 'face' && (
        <>
          {grid('Face shape', 'faceShape', FACE_SHAPES, 'head', { columns: 4 })}
          {grid('Eyes', 'eyes', EYE_STYLES)}
          <ColorPicker
            label="Eye colour"
            table={EYE_COLORS}
            value={person.eyeColor}
            onChange={set('eyeColor')}
          />
          {grid('Eyebrows', 'brows', BROWS)}
          {grid('Nose', 'nose', NOSES, 'head', { columns: 4 })}
          {person.age === 'adult' &&
            grid('Facial hair', 'facialHair', FACIAL_HAIR)}
          {grid('Glasses', 'glasses', GLASSES)}
          <ToggleRow
            label="Rosy cheeks"
            checked={person.blush}
            onChange={set('blush')}
          />
          <ToggleRow
            label="Freckles"
            checked={person.freckles}
            onChange={set('freckles')}
          />
        </>
      )}

      {tab === 'hair' && (
        <>
          {grid('Hairstyle', 'hair', HAIR_STYLES, 'head', { columns: 4 })}
          <ColorPicker
            label="Hair colour"
            table={HAIR_COLORS}
            value={person.hairColor}
            onChange={set('hairColor')}
          />
          {grid('Hat', 'hat', HATS, 'head', { columns: 4 })}
          {person.hat !== 'none' && person.hat !== 'crown' && (
            <ColorPicker
              label="Hat colour"
              table={CLOTH_COLORS}
              value={person.hatColor}
              onChange={set('hatColor')}
            />
          )}
        </>
      )}

      {tab === 'outfit' && (
        <>
          {grid('Top or dress', 'top', TOPS, 'full', { columns: 4 })}
          <ColorPicker
            label="Top colour"
            table={CLOTH_COLORS}
            value={person.topColor}
            onChange={set('topColor')}
          />
          {grid('Pattern', 'pattern', PATTERNS, 'full', { columns: 3 })}
          <ColorPicker
            label="Accent colour"
            table={CLOTH_COLORS}
            value={person.accentColor}
            onChange={set('accentColor')}
          />
          {!TOPS.find((t) => t.id === person.top)?.dress && (
            <>
              {grid('Bottoms', 'bottom', BOTTOMS, 'full')}
              <ColorPicker
                label="Bottoms colour"
                table={CLOTH_COLORS}
                value={person.bottomColor}
                onChange={set('bottomColor')}
              />
            </>
          )}
          {grid('Shoes', 'shoes', SHOES, 'full')}
          {person.shoes !== 'barefoot' && (
            <ColorPicker
              label="Shoe colour"
              table={CLOTH_COLORS}
              value={person.shoeColor}
              onChange={set('shoeColor')}
            />
          )}
        </>
      )}
    </div>
  );
};

LookEditor.propTypes = {
  member: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

/** Pets use the existing companion schema and portraits. */
export const PetEditor = ({ member, onChange }) => {
  const pet = { ...normalizeCompanion(member), name: member.name };
  const set = (key) => (value) => onChange({ [key]: value });
  const colourGroup = (key) => COMPANION_GROUPS.find((g) => g.key === key);

  return (
    <div className={styles.editor}>
      <TileGrid
        label="Animal"
        options={PET_SPECIES.map((s) => ({
          value: s.id,
          name: s.name,
          art: <PetImage pet={{ ...pet, species: s.id }} />,
        }))}
        value={pet.species}
        onChange={set('species')}
        columns={4}
      />
      <SwatchGrid
        label={colourGroup('furColor').label}
        options={colourGroup('furColor').table}
        value={pet.furColor}
        onChange={set('furColor')}
        columns={7}
      />
      <TileGrid
        label="Collar"
        options={PET_COLLARS.map((c) => ({
          value: c.id,
          name: c.name,
          art: <PetImage pet={{ ...pet, collar: c.id }} />,
        }))}
        value={pet.collar}
        onChange={set('collar')}
      />
      {pet.collar !== 'none' && (
        <SwatchGrid
          label={colourGroup('collarColor').label}
          options={colourGroup('collarColor').table}
          value={pet.collarColor}
          onChange={set('collarColor')}
          columns={7}
        />
      )}
      <SegmentedControl
        label="Pose"
        options={PET_POSES.map((p) => ({
          value: p.id,
          label: p.name.split(' ')[0],
        }))}
        value={pet.pose}
        onChange={set('pose')}
      />
      <SegmentedControl
        label="Size"
        options={colourGroup('size').table.map((s) => ({
          value: s.id,
          label: s.name.split(' ')[0].replace('-sized', ''),
        }))}
        value={pet.size}
        onChange={set('size')}
      />
    </div>
  );
};

PetEditor.propTypes = {
  member: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
