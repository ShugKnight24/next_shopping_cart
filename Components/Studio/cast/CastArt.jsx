import PropTypes from 'prop-types';
import { useId, useMemo, useRef, useState } from 'react';
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
 *
 * One Tab stop per grid. The arrow keys move focus (up and down by a row),
 * Home and End jump to the ends, and Enter or Space picks: some grids apply
 * a whole idea, so moving through them must not pick each one on the way.
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
  const buttons = useRef([]);
  const activeIndex = options.findIndex((o) => o.value === value);
  const [focusIndex, setFocusIndex] = useState(null);
  // The last tile focused keeps the Tab stop; otherwise the picked one.
  const tabbable =
    focusIndex !== null && focusIndex < options.length
      ? focusIndex
      : Math.max(0, activeIndex);

  const onKeyDown = (event, index) => {
    const step = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns,
      ArrowUp: -columns,
    }[event.key];
    let next;
    if (step) next = Math.min(options.length - 1, Math.max(0, index + step));
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;
    event.preventDefault();
    setFocusIndex(next);
    buttons.current[next]?.focus();
  };

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
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              type="button"
              tabIndex={index === tabbable ? 0 : -1}
              onKeyDown={(event) => onKeyDown(event, index)}
              onFocus={() => setFocusIndex(index)}
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
