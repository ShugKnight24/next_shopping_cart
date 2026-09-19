import PropTypes from 'prop-types';
import { useCallback, useId, useRef, useState } from 'react';
import styles from './WorkbenchFields.module.css';

/**
 * The dark control vocabulary of the workbench.
 *
 * `core/StudioControls` is the light-theme set belonging to the page-embedded
 * studios; it is styled for a white card and reaches for the app's light tokens.
 * Rather than teach it a second theme — and risk regressing three shipped
 * studios — the workbench gets its own primitives, drawn on the `--wb-*` layer
 * and shaped for a 320px inspector rather than a full-width form.
 *
 * The shared rules, applied everywhere below:
 *
 * - Every control is driven by a real `<label htmlFor>` bound to a `useId()`.
 *   Nothing here relies on visual proximity to say what it edits.
 * - Toggle groups are `role="group"` + `aria-pressed` on native `<button>`s,
 *   deliberately not `role="radio"` — an explicit radio role would replace the
 *   implicit `button` role, which is what the studio test suite queries by.
 * - Focus is always visible, always `--wb-accent`, never removed.
 * - Numeric labels scrub horizontally, the way every design tool's inspector
 *   works. The keyboard path (type, or arrow keys) is never the fallback.
 */

/* --------------------------------------------------------------- layout -- */

/** A titled stack of rows, optionally two across for paired values (X/Y, W/H). */
export const FieldGroup = ({ label = null, columns = 1, children }) => (
  <div className={styles.group}>
    {label && <p className={styles.groupLabel}>{label}</p>}
    <div className={columns === 2 ? styles.gridTwo : styles.stack}>
      {children}
    </div>
  </div>
);

FieldGroup.propTypes = {
  label: PropTypes.string,
  columns: PropTypes.oneOf([1, 2]),
  children: PropTypes.node,
};

/**
 * The labelled two-column row every field is built from.
 *
 * The hint sits *outside* the `<label>` on purpose. Nested inside, it joins the
 * control's accessible name — "Tint recolours the body" — instead of describing
 * it. Each field owns the `aria-describedby` wiring because the field, not the
 * row, holds the control.
 *
 * `labelProps` exists so a field can put its own behaviour on the label
 * element — `NumberField` hangs the scrub gesture there — without this
 * component growing a branch per field type.
 */
export const FieldRow = ({
  label,
  htmlFor,
  hint = null,
  hintId = undefined,
  layout = 'split',
  labelProps = null,
  children,
}) => (
  <div className={`${styles.row} ${styles[`row_${layout}`]}`}>
    <div className={styles.rowLabelCell}>
      <label className={styles.rowLabel} htmlFor={htmlFor} {...labelProps}>
        <span className={styles.rowLabelText}>{label}</span>
      </label>
      {hint && (
        <span id={hintId} className={styles.rowHint}>
          {hint}
        </span>
      )}
    </div>
    <div className={styles.rowControl}>{children}</div>
  </div>
);

FieldRow.propTypes = {
  label: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  hint: PropTypes.string,
  hintId: PropTypes.string,
  /**
   * `split` puts the control beside the label, `stack` puts it underneath,
   * `full` drops the label out of the flow entirely (it stays for assistive
   * tech) and gives the control the whole row.
   */
  layout: PropTypes.oneOf(['split', 'stack', 'full']),
  labelProps: PropTypes.object,
  children: PropTypes.node,
};

/** `aria-describedby` target for a row's hint, or undefined when there is none. */
const hintIdFor = (id, hint) => (hint ? `${id}-hint` : undefined);

/* --------------------------------------------------------------- number -- */

const round = (value, precision) =>
  Number.parseFloat(Number(value).toFixed(precision));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * A numeric field whose label is a horizontal scrubber.
 *
 * Dragging the label is how you set a size or a rotation without aiming at a
 * 3px stepper; Shift multiplies the step by ten, Alt divides it by ten. The
 * value only leaves this component through `commit`, so clamping and rounding
 * happen in exactly one place whichever gesture produced the change.
 */
export const NumberField = ({
  label,
  value,
  onChange,
  min = -100000,
  max = 100000,
  step = 1,
  precision = 0,
  suffix = null,
  hint = null,
  disabled = false,
  scrubSpeed = 0.5,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);
  const scrub = useRef(null);
  const [scrubbing, setScrubbing] = useState(false);
  // While the field has focus the raw string is authoritative, so a half-typed
  // "-" or "1." is not rewritten under the cursor.
  const [draft, setDraft] = useState(null);

  const commit = useCallback(
    (next) => {
      if (!Number.isFinite(next)) return;
      onChange(round(clamp(next, min, max), precision));
    },
    [onChange, min, max, precision]
  );

  const onPointerDown = (event) => {
    if (disabled || event.button !== 0) return;
    // Suppress the label's default focus-and-select so a scrub does not also
    // drop a caret into the input.
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    scrub.current = { x: event.clientX, from: Number(value) || 0 };
    setScrubbing(true);
  };

  const onPointerMove = (event) => {
    const active = scrub.current;
    if (!active) return;

    const multiplier = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
    const ticks = Math.round((event.clientX - active.x) * scrubSpeed);
    commit(active.from + ticks * step * multiplier);
  };

  const endScrub = (event) => {
    if (!scrub.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    scrub.current = null;
    setScrubbing(false);
  };

  const onKeyDown = (event) => {
    const direction =
      event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (!direction) return;

    event.preventDefault();
    setDraft(null);
    commit((Number(value) || 0) + direction * step * (event.shiftKey ? 10 : 1));
  };

  return (
    <FieldRow
      label={label}
      htmlFor={id}
      hint={hint}
      hintId={hintId}
      labelProps={{
        className: `${styles.rowLabel} ${styles.scrubLabel} ${
          scrubbing ? styles.scrubbing : ''
        }`,
        onPointerDown,
        onPointerMove,
        onPointerUp: endScrub,
        onPointerCancel: endScrub,
      }}
    >
      <div className={styles.numberWrap}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={styles.input}
          aria-describedby={hintId}
          value={draft ?? String(round(Number(value) || 0, precision))}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft !== null) commit(Number.parseFloat(draft));
            setDraft(null);
          }}
          onKeyDown={onKeyDown}
        />
        {suffix && (
          <span className={styles.suffix} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
    </FieldRow>
  );
};

NumberField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  precision: PropTypes.number,
  suffix: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  /** Value steps per pixel dragged. */
  scrubSpeed: PropTypes.number,
};

/* ----------------------------------------------------------------- text -- */

export const TextField = ({
  label,
  value,
  onChange,
  placeholder = '',
  hint = null,
  layout = 'stack',
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);

  return (
    <FieldRow
      label={label}
      htmlFor={id}
      hint={hint}
      hintId={hintId}
      layout={layout}
    >
      <input
        id={id}
        type="text"
        className={styles.input}
        aria-describedby={hintId}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldRow>
  );
};

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  hint: PropTypes.string,
  layout: PropTypes.oneOf(['split', 'stack']),
  disabled: PropTypes.bool,
};

export const TextAreaField = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder = '',
  hint = null,
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);

  return (
    <FieldRow
      label={label}
      htmlFor={id}
      hint={hint}
      hintId={hintId}
      layout="stack"
    >
      <textarea
        id={id}
        className={styles.textarea}
        aria-describedby={hintId}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldRow>
  );
};

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
};

/* --------------------------------------------------------------- select -- */

const OptionList = ({ options }) =>
  options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));

OptionList.propTypes = {
  options: PropTypes.array.isRequired,
};

/** `groups` renders `<optgroup>`s — the stamp library needs them. */
export const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  groups = null,
  hint = null,
  layout = 'split',
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);

  return (
    <FieldRow
      label={label}
      htmlFor={id}
      hint={hint}
      hintId={hintId}
      layout={layout}
    >
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={styles.select}
          aria-describedby={hintId}
          value={value ?? ''}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {groups ? (
            groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                <OptionList options={group.options} />
              </optgroup>
            ))
          ) : (
            <OptionList options={options} />
          )}
        </select>
        <span className={styles.selectChevron} aria-hidden="true">
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
            <path
              d="M3 4.5 6 7.5 9 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </FieldRow>
  );
};

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  groups: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, options: PropTypes.array })
  ),
  hint: PropTypes.string,
  layout: PropTypes.oneOf(['split', 'stack']),
  disabled: PropTypes.bool,
};

/* ---------------------------------------------------------------- colour -- */

const HEX_FALLBACK = '#ffffff';

/**
 * Coerce whatever the layer holds into a 6-digit hex, or null.
 *
 * Layers can legitimately carry `null` (no stroke), a shorthand `#fa0`, or a
 * CSS colour a template author typed by hand. Handing any of those straight to
 * `<input type="color">` silently renders black, which reads as "your colour
 * is black" rather than "not set" — so anything unparseable returns null and
 * the well shows its unset state instead.
 */
export const normalizeHex = (value) => {
  if (typeof value !== 'string') return null;

  const raw = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split('')
      .map((c) => c + c)
      .join('')}`.toLowerCase();
  }

  return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw.toLowerCase()}` : null;
};

export const ColorField = ({
  label,
  value,
  onChange,
  hint = null,
  allowClear = false,
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);
  const pickerId = `${id}-picker`;
  const safe = normalizeHex(value);
  // Typing a hex is character-by-character, so the draft has to survive the
  // intermediate states ("#f", "#ff3") that do not parse yet.
  const [draft, setDraft] = useState(null);

  const commitText = (text) => {
    const parsed = normalizeHex(text);
    if (parsed) onChange(parsed);
    setDraft(null);
  };

  return (
    <FieldRow label={label} htmlFor={id} hint={hint} hintId={hintId}>
      <div className={styles.colorWrap}>
        <span
          className={`${styles.colorWell} ${safe ? '' : styles.colorWellUnset}`}
          style={safe ? { '--wb-field-swatch': safe } : undefined}
        >
          <input
            id={pickerId}
            type="color"
            className={styles.colorPicker}
            value={safe ?? HEX_FALLBACK}
            disabled={disabled}
            aria-label={`${label} colour picker`}
            onChange={(event) => onChange(event.target.value)}
          />
        </span>

        <input
          id={id}
          type="text"
          className={`${styles.input} ${styles.colorText}`}
          aria-describedby={hintId}
          spellCheck="false"
          value={draft ?? safe ?? ''}
          placeholder={safe ? '' : 'None'}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commitText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitText(event.currentTarget.value);
          }}
        />

        {allowClear && (
          <button
            type="button"
            className={styles.colorClear}
            disabled={disabled || !safe}
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => {
              setDraft(null);
              onChange(null);
            }}
          >
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
              <path
                d="M3 3 9 9M9 3 3 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </FieldRow>
  );
};

ColorField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  hint: PropTypes.string,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
};

/* --------------------------------------------------------------- slider -- */

export const SliderField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = null,
  hint = null,
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);
  const numeric = Number(value) || 0;

  return (
    <FieldRow
      label={label}
      htmlFor={id}
      hint={hint}
      hintId={hintId}
      layout="stack"
    >
      <div className={styles.sliderWrap}>
        <input
          id={id}
          type="range"
          className={styles.slider}
          aria-describedby={hintId}
          min={min}
          max={max}
          step={step}
          value={numeric}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output className={styles.sliderValue} htmlFor={id}>
          {format ? format(numeric) : numeric}
        </output>
      </div>
    </FieldRow>
  );
};

SliderField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  format: PropTypes.func,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
};

/* ------------------------------------------------------------- segmented -- */

/** Arrow keys move between options inside one tab stop, as a toolbar should. */
const handleRovingKeys = (event, values, value, onChange) => {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  const direction = keys[event.key];
  if (!direction) return;

  event.preventDefault();
  const index = values.indexOf(value);
  const next = (index + direction + values.length) % values.length;
  onChange(values[next]);
};

/**
 * A joined row of exclusive options — alignment, weight, case, fit.
 *
 * `role="group"` with `aria-pressed`, never `role="radio"`: the explicit radio
 * role would strip the implicit `button` role these are queried by, and the
 * announcement gain is not worth it.
 */
export const SegmentedControl = ({
  label,
  options,
  value,
  onChange,
  hint = null,
  hideLabel = false,
  disabled = false,
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hintIdFor(id, hint);
  const values = options.map((option) => option.value);

  return (
    <FieldRow
      label={label}
      hint={hint}
      hintId={hintId}
      layout={hideLabel ? 'full' : 'split'}
      labelProps={{ id: labelId }}
    >
      <div
        className={styles.segmented}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={hintId}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.segment} ${active ? styles.segmentActive : ''}`}
              aria-pressed={active}
              aria-label={option.icon ? option.label : undefined}
              title={option.title ?? option.label}
              tabIndex={active ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) =>
                handleRovingKeys(event, values, value, onChange)
              }
            >
              {option.icon ?? option.label}
            </button>
          );
        })}
      </div>
    </FieldRow>
  );
};

SegmentedControl.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      title: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  hint: PropTypes.string,
  /** Keep the label for screen readers but give the row its full width. */
  hideLabel: PropTypes.bool,
  disabled: PropTypes.bool,
};

/* -------------------------------------------------------------- swatches -- */

export const SwatchGrid = ({
  label,
  options,
  value,
  onChange,
  columns = 8,
  hint = null,
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hintIdFor(id, hint);
  const values = options.map((option) => option.value);

  return (
    <FieldRow
      label={label}
      hint={hint}
      hintId={hintId}
      layout="stack"
      labelProps={{ id: labelId }}
    >
      <div
        className={styles.swatchGrid}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={hintId}
        style={{ '--wb-swatch-columns': columns }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.swatch} ${active ? styles.swatchActive : ''}`}
              style={{ '--wb-field-swatch': option.value }}
              aria-pressed={active}
              aria-label={option.name}
              title={option.name}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) =>
                handleRovingKeys(event, values, value, onChange)
              }
            />
          );
        })}
      </div>
    </FieldRow>
  );
};

SwatchGrid.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  columns: PropTypes.number,
  hint: PropTypes.string,
};

/* ---------------------------------------------------------------- toggle -- */

export const ToggleRow = ({
  label,
  checked,
  onChange,
  hint = null,
  disabled = false,
}) => {
  const id = useId();
  const hintId = hintIdFor(id, hint);

  return (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabelCell}>
        <label className={styles.toggleLabel} htmlFor={id}>
          <span className={styles.rowLabelText}>{label}</span>
        </label>
        {hint && (
          <span id={hintId} className={styles.rowHint}>
            {hint}
          </span>
        )}
      </span>

      <input
        id={id}
        type="checkbox"
        className={styles.toggleInput}
        aria-describedby={hintId}
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.toggleTrack} aria-hidden="true">
        <span className={styles.toggleThumb} />
      </span>
    </div>
  );
};

ToggleRow.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
};
