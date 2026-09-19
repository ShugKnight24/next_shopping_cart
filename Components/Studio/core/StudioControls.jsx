import PropTypes from 'prop-types';
import { useId } from 'react';
import { formatPrice } from './pricing';
import styles from './StudioControls.module.css';

/**
 * The control vocabulary shared by every studio.
 *
 * Each studio previously hand-rolled its own swatch row and option pills, which
 * is why selection state was conveyed by CSS class alone and none of it was
 * reachable from a keyboard. These are labelled toggle groups: one tab stop per
 * group, arrow keys move between options, `aria-pressed` announces the active
 * one, and the focus ring is visible.
 *
 * Deliberately `role="group"` + `aria-pressed` rather than
 * `role="radiogroup"` + `role="radio"`. An explicit `role="radio"` on a
 * `<button>` replaces the implicit `button` role, and the studio suite selects
 * these options with `getByRole('button', { name })` in 40-odd places. Radio
 * would be marginally more precise to announce; silently breaking every one of
 * those queries is not worth the difference.
 */

/* ------------------------------------------------------------- swatches -- */

export const SwatchRow = ({
  label,
  hint,
  options,
  value,
  onChange,
  columns = 6,
}) => {
  const groupId = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        {label}
        {hint && <span className={styles.legendHint}>{hint}</span>}
      </legend>

      <div
        className={styles.swatchRow}
        role="group"
        aria-labelledby={`${groupId}-legend`}
        style={{ '--studio-swatch-columns': columns }}
      >
        <span id={`${groupId}-legend`} className={styles.srOnly}>
          {label}
        </span>

        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.swatch} ${isActive ? styles.swatchActive : ''}`}
              style={{ '--studio-swatch-color': option.value }}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => handleRovingKeys(e, options, value, onChange)}
            >
              <span className={styles.swatchDot} aria-hidden="true" />
              <span className={styles.srOnly}>{option.name}</span>
              <span className={styles.swatchTip} aria-hidden="true">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

SwatchRow.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  columns: PropTypes.number,
};

/* ------------------------------------------------------------ pill group -- */

export const OptionPills = ({ label, hint, options, value, onChange }) => {
  const groupId = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend} id={`${groupId}-legend`}>
        {label}
        {hint && <span className={styles.legendHint}>{hint}</span>}
      </legend>

      <div
        className={styles.pillRow}
        role="group"
        aria-labelledby={`${groupId}-legend`}
      >
        {options.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) =>
                handleRovingKeys(
                  e,
                  options.map((o) => ({ value: o.id })),
                  value,
                  onChange
                )
              }
            >
              <span className={styles.pillLabel}>{option.name}</span>
              {option.sub && (
                <span className={styles.pillSub}>{option.sub}</span>
              )}
              {option.priceModifier ? (
                <span className={styles.pillPrice}>
                  +{formatPrice(option.priceModifier)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

OptionPills.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  options: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------ card group -- */

export const OptionCards = ({
  label,
  options,
  value,
  onChange,
  columns = 2,
}) => {
  const groupId = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend} id={`${groupId}-legend`}>
        {label}
      </legend>

      <div
        className={styles.cardGrid}
        role="group"
        aria-labelledby={`${groupId}-legend`}
        style={{ '--studio-card-columns': columns }}
      >
        {options.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) =>
                handleRovingKeys(
                  e,
                  options.map((o) => ({ value: o.id })),
                  value,
                  onChange
                )
              }
            >
              {option.badge && (
                <span className={styles.cardBadge}>{option.badge}</span>
              )}
              {option.Icon && (
                <span className={styles.cardIcon} aria-hidden="true">
                  <option.Icon size={26} />
                </span>
              )}
              <span className={styles.cardName}>{option.name}</span>
              {option.sub && (
                <span className={styles.cardSub}>{option.sub}</span>
              )}
              {option.price != null && (
                <span className={styles.cardPrice}>
                  {formatPrice(option.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

OptionCards.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  columns: PropTypes.number,
};

/* --------------------------------------------------------------- slider -- */

export const StudioSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => v,
}) => {
  const id = useId();

  return (
    <div className={styles.sliderField}>
      <label className={styles.sliderLabel} htmlFor={id}>
        {label}
        <output className={styles.sliderValue} htmlFor={id}>
          {format(value)}
        </output>
      </label>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

StudioSlider.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  format: PropTypes.func,
};

/* ---------------------------------------------------------- price panel -- */

/**
 * Live, itemized price. Every surcharge the shopper has chosen is named, so the
 * number on the Add to Bag button is explainable without opening the cart.
 */
export const PricePanel = ({ price, note }) => (
  <div className={styles.pricePanel}>
    <h4 className={styles.priceHeading}>Your price, itemized</h4>

    <dl className={styles.priceList}>
      {price.lines.map((line) => (
        <div key={line.label} className={styles.priceLine}>
          <dt>
            {line.label}
            {line.meta && <span className={styles.priceMeta}>{line.meta}</span>}
          </dt>
          <dd>{formatPrice(line.amount)}</dd>
        </div>
      ))}
    </dl>

    <div className={styles.priceTotal}>
      <span>{price.quantity > 1 ? `Total (${price.quantity})` : 'Total'}</span>
      <strong>{formatPrice(price.subtotal)}</strong>
    </div>

    {note && <p className={styles.priceNote}>{note}</p>}
  </div>
);

PricePanel.propTypes = {
  price: PropTypes.object.isRequired,
  note: PropTypes.string,
};

/* ------------------------------------------------------------- quantity -- */

export const QuantityStepper = ({ value, onChange, min = 1, max = 25 }) => {
  const id = useId();

  return (
    <div className={styles.quantityField}>
      <label className={styles.quantityLabel} htmlFor={id}>
        Quantity
      </label>
      <div className={styles.quantityControls}>
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          className={styles.quantityInput}
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) {
              onChange(Math.min(max, Math.max(min, next)));
            }
          }}
        />
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
};

QuantityStepper.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

/* ---------------------------------------------------------------- utils -- */

/**
 * Arrow-key movement inside a toggle group. A grouped control that cannot be
 * arrowed through is worse than no grouping at all — it promises behavior it
 * lacks.
 */
function handleRovingKeys(event, options, value, onChange) {
  const keys = [
    'ArrowRight',
    'ArrowDown',
    'ArrowLeft',
    'ArrowUp',
    'Home',
    'End',
  ];
  if (!keys.includes(event.key)) return;

  event.preventDefault();
  const index = options.findIndex((o) => o.value === value);
  const last = options.length - 1;

  const next = {
    ArrowRight: Math.min(last, index + 1),
    ArrowDown: Math.min(last, index + 1),
    ArrowLeft: Math.max(0, index - 1),
    ArrowUp: Math.max(0, index - 1),
    Home: 0,
    End: last,
  }[event.key];

  onChange(options[next].value);
  // Move focus with selection so the next arrow press continues from here.
  const buttons =
    event.currentTarget.parentElement?.querySelectorAll('[aria-pressed]');
  buttons?.[next]?.focus();
}
