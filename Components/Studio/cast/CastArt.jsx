import PropTypes from 'prop-types';
import { useId, useMemo } from 'react';
import { CompanionPortrait } from '../CharacterPortraits';
import styles from './CastPanel.module.css';
import { svgDataUrl } from './castRaster';
import { personArt } from './castRig';
import { pieceArt } from './scenePieces';

/**
 * Picture tiles for the cast and scenery pickers. Every tile is drawn by the
 * same rig the canvas uses, so what a shopper picks is what lands on the page.
 */

const imageSrc = (svg) => svgDataUrl(svg);

/** A person, whole or cropped to the head, as an <img>. */
export const PersonImage = ({
  person,
  placement = null,
  crop = 'full',
  className = '',
}) => {
  // Pickers rebuild their option objects every render; memo on what is drawn.
  const look = JSON.stringify(person);
  const pose = JSON.stringify(placement ?? {});
  const src = useMemo(() => {
    const art = personArt(JSON.parse(look), JSON.parse(pose));
    if (crop !== 'head') return imageSrc(art.svg);
    const [x, y, w, h] = art.headBox;
    return imageSrc(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${art.markup}</svg>`
    );
  }, [look, pose, crop]);
  return (
    <img
      className={`${styles.art} ${className}`}
      src={src}
      alt=""
      draggable={false}
    />
  );
};

PersonImage.propTypes = {
  person: PropTypes.object.isRequired,
  placement: PropTypes.object,
  crop: PropTypes.oneOf(['full', 'head']),
  className: PropTypes.string,
};

export const PieceImage = ({ id, tint = null, className = '' }) => {
  const src = useMemo(() => imageSrc(pieceArt(id, tint).svg), [id, tint]);
  return (
    <img
      className={`${styles.art} ${className}`}
      src={src}
      alt=""
      draggable={false}
    />
  );
};

PieceImage.propTypes = {
  id: PropTypes.string.isRequired,
  tint: PropTypes.string,
  className: PropTypes.string,
};

export const PetImage = ({ pet, className = '' }) => (
  <span
    className={`${styles.art} ${styles.petArt} ${className}`}
    aria-hidden="true"
  >
    <CompanionPortrait companion={pet} label="" />
  </span>
);

PetImage.propTypes = {
  pet: PropTypes.object.isRequired,
  className: PropTypes.string,
};

/** The art for any cast member. */
export const MemberImage = ({
  member,
  crop = 'head',
  placement = null,
  className = '',
}) =>
  member.kind === 'pet' ? (
    <PetImage pet={member} className={className} />
  ) : (
    <PersonImage
      person={member}
      crop={crop}
      placement={placement}
      className={className}
    />
  );

MemberImage.propTypes = {
  member: PropTypes.object.isRequired,
  crop: PropTypes.oneOf(['full', 'head']),
  placement: PropTypes.object,
  className: PropTypes.string,
};

/**
 * A labelled grid of picture options. `role="group"` with `aria-pressed`
 * buttons, never `role="radio"` — the house rule the suites rely on.
 *   options: [{ value, name, art, detail? }] — `detail` is a second line,
 *   such as a price.
 */
export const TileGrid = ({
  label,
  options,
  value,
  onChange,
  columns = 3,
  shape = 'square',
  hideLabel = false,
}) => {
  const labelId = useId();
  return (
    <div className={styles.tileField}>
      <p className={hideLabel ? styles.srOnly : styles.tileLabel} id={labelId}>
        {label}
      </p>
      <div
        className={`${styles.tiles} ${styles[`tiles_${shape}`] ?? ''}`}
        role="group"
        aria-labelledby={labelId}
        style={{ '--cast-columns': columns }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.tile} ${active ? styles.tileActive : ''}`}
              aria-pressed={active}
              aria-label={
                option.detail ? `${option.name}, ${option.detail}` : option.name
              }
              title={option.name}
              onClick={() => onChange(option.value)}
            >
              <span className={styles.tileArt}>{option.art}</span>
              <span className={styles.tileName} aria-hidden="true">
                {option.name}
              </span>
              {option.detail && (
                <span className={styles.tileDetail} aria-hidden="true">
                  {option.detail}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

TileGrid.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      art: PropTypes.node,
      detail: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  columns: PropTypes.number,
  shape: PropTypes.oneOf(['square', 'tall', 'wide']),
  hideLabel: PropTypes.bool,
};
