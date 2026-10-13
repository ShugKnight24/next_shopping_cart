import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { LayersIcon, SparklesIcon } from '../../Icons';
import {
  SceneBackgroundIcon,
  TemplateToolIcon,
  TextToolIcon,
} from '../StudioSVGs';
import styles from './ToolRail.module.css';

/**
 * The left tool rail.
 *
 * Two stacks separated by a hairline: the drawing tools, which change what a
 * click on the canvas does, and the panel toggles, which change what the
 * inspector shows. They look alike because they behave alike — one active item
 * per stack — but they are separate groups so a screen reader does not read
 * "Layers" as a sixth drawing tool.
 *
 * Each button advertises its shortcut in the tooltip, so the rail also owns
 * the key handler. A tooltip promising "T" that nothing listens for is the
 * dead-control problem in another costume.
 */

/* Two glyphs the shared icon sets do not have yet. Drawn here, in the same
   24-box 2px-stroke idiom as `Components/Icons`, rather than reaching into a
   file another part of the app owns. */
const CursorIcon = ({ size = 18 }) => (
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
    <path d="M5 3 19 12 12.5 13.4 9.4 19.6z" />
  </svg>
);

CursorIcon.propTypes = { size: PropTypes.number };

const ShapeIcon = ({ size = 18 }) => (
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
    <rect x="3" y="3" width="11" height="11" rx="2" />
    <circle cx="15.5" cy="15.5" r="5.5" />
  </svg>
);

ShapeIcon.propTypes = { size: PropTypes.number };

const railSvg = (size, children) => (
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
    {children}
  </svg>
);

/** Two people, the larger one in front: the cast. */
const CastIcon = ({ size = 18 }) =>
  railSvg(
    size,
    <>
      <circle cx="9" cy="7" r="3.2" />
      <path d="M3.5 20c0-3.6 2.4-6 5.5-6s5.5 2.4 5.5 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.4 14.2c.5-.1 1-.2 1.6-.2 2.4 0 4 1.8 4 4.6" />
    </>
  );

CastIcon.propTypes = { size: PropTypes.number };

/** A tree beside a sun: scenery. */
const SceneryIcon = ({ size = 18 }) =>
  railSvg(
    size,
    <>
      <path d="M8 21v-5" />
      <path d="M8 3.5 3.5 12h9z" />
      <path d="M8 8.5 4.5 16h7z" />
      <circle cx="17.5" cy="7" r="2.6" />
      <path d="M14 21h8" />
    </>
  );

SceneryIcon.propTypes = { size: PropTypes.number };

const TOOLS = [
  { id: 'select', name: 'Select', shortcut: 'V', Icon: CursorIcon },
  { id: 'text', name: 'Text', shortcut: 'T', Icon: TextToolIcon },
  { id: 'shape', name: 'Shape', shortcut: 'R', Icon: ShapeIcon },
  { id: 'art', name: 'Artwork', shortcut: 'A', Icon: SparklesIcon },
  { id: 'image', name: 'Image', shortcut: 'I', Icon: SceneBackgroundIcon },
];

const PANEL_ICONS = {
  templates: TemplateToolIcon,
  layers: LayersIcon,
  cast: CastIcon,
  scenery: SceneryIcon,
};

const DEFAULT_PANELS = [
  { id: 'templates', name: 'Templates', shortcut: '1' },
  { id: 'layers', name: 'Layers', shortcut: '2' },
];

const isEditableTarget = (target) => {
  const tag = target?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;
};

const RailButton = ({ icon, name, shortcut, pressed, onClick }) => (
  <button
    type="button"
    className={`${styles.button} ${pressed ? styles.buttonActive : ''}`}
    aria-label={shortcut ? `${name} (${shortcut})` : name}
    aria-pressed={pressed}
    onClick={onClick}
  >
    <span className={styles.marker} aria-hidden="true" />
    {icon}
    <span className={styles.tip} aria-hidden="true">
      {name}
      {shortcut && <kbd className={styles.kbd}>{shortcut}</kbd>}
    </span>
  </button>
);

RailButton.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  shortcut: PropTypes.string,
  pressed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export const ToolRail = ({
  tool,
  onToolChange,
  panels = DEFAULT_PANELS,
  activePanel = null,
  onPanelChange = null,
}) => {
  const panelList = useMemo(
    () => (Array.isArray(panels) ? panels : []),
    [panels]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      // Modified keys belong to the browser and to undo/redo; a bare letter
      // typed into a field belongs to the field.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const match = TOOLS.find(
        (candidate) => candidate.shortcut === event.key.toUpperCase()
      );
      if (match) {
        event.preventDefault();
        onToolChange(match.id);
        return;
      }

      // The panel toggles advertise number keys too.
      const panel = panelList.find(
        (candidate) => candidate.shortcut === event.key
      );
      if (!panel || !onPanelChange) return;
      event.preventDefault();
      onPanelChange(activePanel === panel.id ? null : panel.id);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToolChange, onPanelChange, activePanel, panelList]);

  return (
    <>
      <div className={styles.group} role="group" aria-label="Drawing tools">
        {TOOLS.map(({ id, name, shortcut, Icon }) => (
          <RailButton
            key={id}
            icon={<Icon size={18} />}
            name={name}
            shortcut={shortcut}
            pressed={tool === id}
            onClick={() => onToolChange(id)}
          />
        ))}
      </div>

      {panelList.length > 0 && onPanelChange && (
        <>
          <span className={styles.divider} aria-hidden="true" />

          <div className={styles.group} role="group" aria-label="Panels">
            {panelList.map((panel) => {
              const Icon = PANEL_ICONS[panel.id] ?? TemplateToolIcon;
              const pressed = activePanel === panel.id;

              return (
                <RailButton
                  key={panel.id}
                  icon={<Icon size={18} />}
                  name={panel.name}
                  shortcut={panel.shortcut}
                  pressed={pressed}
                  // Clicking the open panel closes it — the rail is a toggle,
                  // not a radio group, so the canvas can have the full width.
                  onClick={() => onPanelChange(pressed ? null : panel.id)}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

ToolRail.propTypes = {
  tool: PropTypes.string.isRequired,
  onToolChange: PropTypes.func.isRequired,
  panels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortcut: PropTypes.string,
    })
  ),
  activePanel: PropTypes.string,
  onPanelChange: PropTypes.func,
};

/* `ShapeIcon` is the only glyph in this file with a second home — the layer
   list and the inspector both need it, and duplicating the path three times
   would guarantee they drift. */
export {
  CastIcon,
  DEFAULT_PANELS as RAIL_PANELS,
  TOOLS as RAIL_TOOLS,
  SceneryIcon,
  ShapeIcon,
};
