import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { EyeIcon, LockIcon, SparklesIcon } from '../../Icons';
import { SceneBackgroundIcon, TextToolIcon } from '../StudioSVGs';
import { describeLayer } from './layerModel';
import styles from './LayerPanel.module.css';
import { ShapeIcon } from './ToolRail';

/**
 * The layer stack.
 *
 * Listed topmost-first. The array is stored bottom-up because that is paint
 * order, but every design tool shows the stack the way it is seen — the thing
 * in front at the top — and `SocialStudio` showing it the other way round is
 * the single most common complaint about that editor. The reversal happens
 * here, at the view, and nothing below this file changes.
 *
 * Structurally: the row *is* a `<button>`, and the eye and lock buttons are its
 * siblings inside the `<li>`. Nesting them would produce a button inside a
 * button, which no browser resolves the way the markup reads.
 */

const GLYPHS = {
  text: TextToolIcon,
  shape: ShapeIcon,
  art: SparklesIcon,
  image: SceneBackgroundIcon,
};

/* Hidden and locked need their own silhouette, not a faded copy of the shown
   one — at 14px, opacity alone is not a state anybody can read. */
const EyeOffIcon = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.15 18.15 0 0 0 1 12s4 8 11 8a9.12 9.12 0 0 0 5.39-1.61" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

EyeOffIcon.propTypes = { size: PropTypes.number };

const UnlockIcon = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

UnlockIcon.propTypes = { size: PropTypes.number };

const GripIcon = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
    <g fill="currentColor">
      <circle cx="3" cy="4" r="1" />
      <circle cx="7" cy="4" r="1" />
      <circle cx="3" cy="8" r="1" />
      <circle cx="7" cy="8" r="1" />
      <circle cx="3" cy="12" r="1" />
      <circle cx="7" cy="12" r="1" />
    </g>
  </svg>
);

/* ----------------------------------------------------------------- rows -- */

const LayerRow = ({
  layer,
  selected,
  renaming,
  onSelect,
  onStartRename,
  onRename,
  onCancelRename,
  onToggle,
}) => {
  const Glyph = GLYPHS[layer.type] ?? ShapeIcon;
  const [draft, setDraft] = useState(layer.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!renaming) return;
    setDraft(layer.name);
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renaming, layer.name]);

  const commit = () => {
    const next = draft.trim();
    onRename(next || layer.name);
  };

  return (
    <li
      className={`${styles.row} ${selected ? styles.rowSelected : ''} ${
        layer.visible ? '' : styles.rowHidden
      }`}
    >
      {renaming ? (
        <input
          ref={inputRef}
          type="text"
          className={styles.renameInput}
          value={draft}
          aria-label={`Rename ${layer.name}`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') onCancelRename();
            // The list's shortcuts would otherwise eat the typing.
            event.stopPropagation();
          }}
        />
      ) : (
        <button
          type="button"
          data-layer-id={layer.id}
          className={styles.select}
          aria-pressed={selected}
          onClick={onSelect}
          onDoubleClick={onStartRename}
        >
          <span className={styles.grip} aria-hidden="true">
            <GripIcon />
          </span>
          <span className={styles.glyph} aria-hidden="true">
            <Glyph size={15} />
          </span>
          <span className={styles.names}>
            <span className={styles.name}>{layer.name}</span>
            <span className={styles.meta}>{describeLayer(layer)}</span>
          </span>
          {layer.slotRole && (
            <span className={styles.slotTag} aria-hidden="true">
              slot
            </span>
          )}
        </button>
      )}

      <button
        type="button"
        className={`${styles.iconButton} ${layer.visible ? '' : styles.iconButtonOn}`}
        aria-label={`${layer.visible ? 'Hide' : 'Show'} ${layer.name}`}
        aria-pressed={!layer.visible}
        onClick={() => onToggle({ visible: !layer.visible })}
      >
        {layer.visible ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
      </button>

      <button
        type="button"
        className={`${styles.iconButton} ${layer.locked ? styles.iconButtonOn : ''}`}
        aria-label={`${layer.locked ? 'Unlock' : 'Lock'} ${layer.name}`}
        aria-pressed={layer.locked}
        onClick={() => onToggle({ locked: !layer.locked })}
      >
        {layer.locked ? <LockIcon size={15} /> : <UnlockIcon size={15} />}
      </button>
    </li>
  );
};

LayerRow.propTypes = {
  layer: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  renaming: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onStartRename: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onCancelRename: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

/* ---------------------------------------------------------------- panel -- */

export const LayerPanel = ({ workbench }) => {
  const {
    layers,
    selectedId,
    select,
    updateLayer,
    removeLayer,
    reorder,
    duplicate,
  } = workbench;

  const [renamingId, setRenamingId] = useState(null);
  const listRef = useRef(null);

  // Topmost first. `slice` because `reverse` mutates, and this array is the
  // live history entry.
  const ordered = layers.slice().reverse();

  const focusRow = (id) => {
    listRef.current
      ?.querySelector(`[data-layer-id="${id}"]`)
      ?.focus({ preventScroll: false });
  };

  const onKeyDown = (event) => {
    if (!selectedId || renamingId) return;

    const index = ordered.findIndex((layer) => layer.id === selectedId);
    if (index === -1) return;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      duplicate(selectedId);
      return;
    }

    // Visual order is reversed, so "down the list" is "down the stack".
    const step =
      event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;

    if (step) {
      const next = ordered[index + step];
      if (!next) return;
      event.preventDefault();
      select(next.id);
      focusRow(next.id);
      return;
    }

    if (event.key === ']' || event.key === '[') {
      event.preventDefault();
      reorder(selectedId, event.key === ']' ? 'up' : 'down');
      // Re-find the button after the stack re-renders in its new order.
      window.requestAnimationFrame(() => focusRow(selectedId));
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      removeLayer(selectedId);
    }
  };

  if (ordered.length === 0) {
    return (
      <div className={styles.panel}>
        <Header count={0} />
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nothing on the artboard yet</p>
          <p className={styles.emptyBody}>
            Pick a template to start from a finished layout, or use the tools on
            the left — <kbd className={styles.kbd}>T</kbd> for text,{' '}
            <kbd className={styles.kbd}>R</kbd> for a shape,{' '}
            <kbd className={styles.kbd}>A</kbd> for artwork.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <Header count={ordered.length} />

      <ul className={styles.list} ref={listRef} onKeyDown={onKeyDown}>
        {ordered.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            selected={layer.id === selectedId}
            renaming={renamingId === layer.id}
            onSelect={() => select(layer.id)}
            onStartRename={() => setRenamingId(layer.id)}
            onRename={(name) => {
              updateLayer(layer.id, { name });
              setRenamingId(null);
              window.requestAnimationFrame(() => focusRow(layer.id));
            }}
            onCancelRename={() => {
              setRenamingId(null);
              window.requestAnimationFrame(() => focusRow(layer.id));
            }}
            onToggle={(patch) => updateLayer(layer.id, patch)}
          />
        ))}
      </ul>

      <p className={styles.hintBar}>
        Double-click to rename · <kbd className={styles.kbd}>[</kbd>{' '}
        <kbd className={styles.kbd}>]</kbd> to reorder ·{' '}
        <kbd className={styles.kbd}>⌘D</kbd> to duplicate
      </p>
    </div>
  );
};

LayerPanel.propTypes = {
  workbench: PropTypes.shape({
    layers: PropTypes.array.isRequired,
    selectedId: PropTypes.string,
    select: PropTypes.func.isRequired,
    updateLayer: PropTypes.func.isRequired,
    removeLayer: PropTypes.func.isRequired,
    reorder: PropTypes.func.isRequired,
    duplicate: PropTypes.func.isRequired,
  }).isRequired,
};

const Header = ({ count }) => (
  <div className={styles.header}>
    <h2 className={styles.headerTitle}>Layers</h2>
    <span className={styles.headerCount}>{count}</span>
  </div>
);

Header.propTypes = { count: PropTypes.number.isRequired };
