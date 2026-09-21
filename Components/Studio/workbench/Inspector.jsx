import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { SparklesIcon, TrashIcon } from '../../Icons';
import { SceneBackgroundIcon, TextToolIcon } from '../StudioSVGs';
import {
  STAMP_CATEGORIES,
  STAMP_IDS,
  TINTABLE_STAMPS,
  drawStamp,
} from '../drawStamp';
import styles from './Inspector.module.css';
import { ShapeIcon } from './ToolRail';
import {
  ColorField,
  FieldGroup,
  NumberField,
  SegmentedControl,
  SelectField,
  SliderField,
  TextAreaField,
  TextField,
  ToggleRow,
} from './WorkbenchFields';
import { InspectorSection, WorkbenchButton } from './WorkbenchShell';

/**
 * The contextual properties panel.
 *
 * Two modes, and the mode is the selection. With nothing selected the panel
 * describes the *document* — the substrate the route owns, plus a way in for
 * someone staring at an empty artboard. With a layer selected it describes
 * that layer, and only in terms that layer actually has: a control that cannot
 * change anything is not rendered at all, rather than rendered disabled. The
 * tint knob on a non-tintable stamp is the canonical example, and the reason
 * `TINTABLE_STAMPS` is a published list rather than a detail of the painter.
 */

const GLYPHS = {
  text: TextToolIcon,
  shape: ShapeIcon,
  art: SparklesIcon,
  image: SceneBackgroundIcon,
};

const TYPE_NAMES = {
  text: 'Text layer',
  shape: 'Shape layer',
  art: 'Artwork layer',
  image: 'Image layer',
};

const FONT_OPTIONS = [
  { value: 'display', label: 'Display' },
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'cursive', label: 'Script' },
  { value: 'mono', label: 'Mono' },
];

const WEIGHT_OPTIONS = [
  { value: 400, label: 'Book', title: 'Regular' },
  { value: 600, label: 'Semi', title: 'Semibold' },
  { value: 800, label: 'Bold', title: 'Bold' },
];

const CASE_OPTIONS = [
  { value: 'none', label: 'Aa', title: 'As typed' },
  { value: 'uppercase', label: 'AA', title: 'Uppercase' },
  { value: 'lowercase', label: 'aa', title: 'Lowercase' },
];

const SHAPE_OPTIONS = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'line', label: 'Line' },
];

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover', title: 'Fill the box, cropping the edges' },
  { value: 'contain', label: 'Contain', title: 'Fit the whole image inside' },
];

/* ---------------------------------------------------------------- icons -- */

/* Alignment glyphs: a bar on the edge being aligned to, and the block that
   moves to meet it. Six variants from one component so they cannot drift. */
const ALIGN_GLYPHS = {
  left: { bar: [2, 2, 1.6, 12], block: [5, 4, 9, 3.2] },
  center: { bar: [7.2, 2, 1.6, 12], block: [3, 4, 10, 3.2] },
  right: { bar: [12.4, 2, 1.6, 12], block: [2, 4, 9, 3.2] },
  top: { bar: [2, 2, 12, 1.6], block: [4, 5, 3.2, 9] },
  middle: { bar: [2, 7.2, 12, 1.6], block: [4, 3, 3.2, 10] },
  bottom: { bar: [2, 12.4, 12, 1.6], block: [4, 2, 3.2, 9] },
};

const AlignIcon = ({ edge }) => {
  const { bar, block } = ALIGN_GLYPHS[edge];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x={block[0]}
        y={block[1]}
        width={block[2]}
        height={block[3]}
        rx="1"
        fill="currentColor"
        opacity="0.45"
      />
      <rect
        x={bar[0]}
        y={bar[1]}
        width={bar[2]}
        height={bar[3]}
        rx="0.8"
        fill="currentColor"
      />
    </svg>
  );
};

AlignIcon.propTypes = { edge: PropTypes.string.isRequired };

const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: <AlignIcon edge="left" /> },
  { value: 'center', label: 'Centre', icon: <AlignIcon edge="center" /> },
  { value: 'right', label: 'Right', icon: <AlignIcon edge="right" /> },
];

const ALIGN_EDGES = [
  { edge: 'left', label: 'Align left' },
  { edge: 'center', label: 'Align horizontal centres' },
  { edge: 'right', label: 'Align right' },
  { edge: 'top', label: 'Align top' },
  { edge: 'middle', label: 'Align vertical centres' },
  { edge: 'bottom', label: 'Align bottom' },
];

/* --------------------------------------------------------- stamp picker -- */

/** One stamp, drawn rather than described. A dropdown of 30 snake_case ids is
 *  not a picture library. */
const StampButton = ({ id, active, onSelect }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    // jsdom's 2D context is a stub without a transform stack; the preview is
    // decorative, so it degrades to an empty tile rather than throwing.
    if (!ctx || typeof ctx.setTransform !== 'function') return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const box = 40;

    canvas.width = box * dpr;
    canvas.height = box * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box, box);

    ctx.save();
    ctx.translate(box / 2, box / 2);
    drawStamp(ctx, { type: id, size: box - 8 });
    ctx.restore();
  }, [id]);

  const name = id.replace(/_/g, ' ');

  return (
    <button
      type="button"
      className={`${styles.stamp} ${active ? styles.stampActive : ''}`}
      aria-pressed={active}
      aria-label={name}
      title={name}
      onClick={() => onSelect(id)}
    >
      <canvas
        ref={canvasRef}
        className={styles.stampCanvas}
        width={40}
        height={40}
      />
    </button>
  );
};

StampButton.propTypes = {
  id: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

const StampPicker = ({ value, onChange }) => {
  const categories = Array.isArray(STAMP_CATEGORIES)
    ? STAMP_CATEGORIES
    : [{ id: 'all', name: 'Artwork', stamps: STAMP_IDS ?? [] }];

  if (categories.length === 0) {
    return <p className={styles.note}>No artwork is available yet.</p>;
  }

  return (
    <div className={styles.stampGroups}>
      {categories.map((category) => (
        <div key={category.id} className={styles.stampGroup}>
          <p className={styles.stampGroupName}>{category.name}</p>
          <div
            className={styles.stampGrid}
            role="group"
            aria-label={category.name}
          >
            {category.stamps.map((id) => (
              <StampButton
                key={id}
                id={id}
                active={id === value}
                onSelect={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

StampPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

/* ------------------------------------------------------ per-type bodies -- */

const TextProperties = ({ layer, set }) => (
  <>
    <TextAreaField
      label="Content"
      value={layer.text}
      rows={3}
      placeholder="Type something"
      onChange={(text) => set({ text })}
    />

    <SelectField
      label="Font"
      value={layer.fontFamily}
      options={FONT_OPTIONS}
      onChange={(fontFamily) => set({ fontFamily })}
    />

    <FieldGroup columns={2}>
      <NumberField
        label="Size"
        value={layer.fontSize}
        min={6}
        max={400}
        suffix="pt"
        onChange={(fontSize) => set({ fontSize })}
      />
      <NumberField
        label="Leading"
        value={layer.lineHeight}
        min={0.6}
        max={3}
        step={0.02}
        precision={2}
        onChange={(lineHeight) => set({ lineHeight })}
      />
    </FieldGroup>

    <NumberField
      label="Tracking"
      value={layer.letterSpacing}
      min={-20}
      max={80}
      step={0.5}
      precision={1}
      suffix="px"
      onChange={(letterSpacing) => set({ letterSpacing })}
    />

    <SegmentedControl
      label="Weight"
      options={WEIGHT_OPTIONS}
      value={layer.fontWeight}
      onChange={(fontWeight) => set({ fontWeight })}
    />

    <SegmentedControl
      label="Case"
      options={CASE_OPTIONS}
      value={layer.textTransform ?? 'none'}
      onChange={(textTransform) => set({ textTransform })}
    />

    <SegmentedControl
      label="Align"
      options={TEXT_ALIGN_OPTIONS}
      value={layer.align}
      onChange={(align) => set({ align })}
    />

    <ColorField
      label="Colour"
      value={layer.color}
      onChange={(color) => set({ color })}
    />
  </>
);

TextProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
};

const ShapeProperties = ({ layer, set }) => (
  <>
    <SelectField
      label="Shape"
      value={layer.shape}
      options={SHAPE_OPTIONS}
      onChange={(shape) => set({ shape })}
    />

    {/* A line has no interior and no corners, so it is offered neither. */}
    {layer.shape !== 'line' && (
      <ColorField
        label="Fill"
        value={layer.fill}
        allowClear
        onChange={(fill) => set({ fill })}
      />
    )}

    <ColorField
      label="Stroke"
      value={layer.stroke}
      allowClear
      onChange={(stroke) =>
        // A stroke colour with zero width paints nothing; give it a width the
        // moment one is chosen so the swatch is not a lie.
        set({
          stroke,
          strokeWidth: stroke && !layer.strokeWidth ? 2 : layer.strokeWidth,
        })
      }
    />

    <NumberField
      label="Weight"
      value={layer.strokeWidth}
      min={0}
      max={80}
      suffix="px"
      disabled={!layer.stroke}
      onChange={(strokeWidth) => set({ strokeWidth })}
    />

    {layer.shape === 'rect' && (
      <NumberField
        label="Radius"
        value={layer.radius}
        min={0}
        max={400}
        suffix="px"
        onChange={(radius) => set({ radius })}
      />
    )}
  </>
);

ShapeProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
};

const ArtProperties = ({ layer, set, stampPicker }) => {
  // The published list, guarded: if the stamp library ships a different shape
  // the panel simply hides tint rather than throwing on render.
  const tintable =
    Array.isArray(TINTABLE_STAMPS) && TINTABLE_STAMPS.indexOf(layer.art) !== -1;

  return (
    <>
      {stampPicker ?? (
        <StampPicker value={layer.art} onChange={(art) => set({ art })} />
      )}

      {tintable ? (
        <ColorField
          label="Tint"
          value={layer.tint}
          allowClear
          hint="recolours the body"
          onChange={(tint) => set({ tint })}
        />
      ) : (
        <p className={styles.note}>
          This piece keeps its own colours — pick a tintable stamp to recolour
          it.
        </p>
      )}

      <ToggleRow
        label="Flip horizontally"
        checked={layer.flipX}
        onChange={(flipX) => set({ flipX })}
      />
    </>
  );
};

ArtProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
  stampPicker: PropTypes.node,
};

const ImageProperties = ({ layer, set }) => (
  <>
    <TextField
      label="Source"
      value={layer.src ?? ''}
      placeholder="https://…"
      onChange={(src) => set({ src: src || null })}
    />

    <SegmentedControl
      label="Fit"
      options={FIT_OPTIONS}
      value={layer.fit}
      onChange={(fit) => set({ fit })}
    />

    <NumberField
      label="Radius"
      value={layer.radius}
      min={0}
      max={400}
      suffix="px"
      onChange={(radius) => set({ radius })}
    />
  </>
);

ImageProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
};

const BODIES = {
  text: TextProperties,
  shape: ShapeProperties,
  art: ArtProperties,
  image: ImageProperties,
};

/* -------------------------------------------------------------- panel -- */

export const Inspector = ({
  workbench,
  documentSection = null,
  stampPicker = null,
  children = null,
}) => {
  const { selection, updateLayer, reorder, duplicate, removeLayer, align } =
    workbench;

  if (!selection) {
    return (
      <div className={styles.panel}>
        {documentSection}
        {children}

        <InspectorSection title="Start designing">
          <p className={styles.emptyBody}>
            Nothing is selected. Add a layer, then drag it on the artboard —
            everything about it shows up here.
          </p>

          <div className={styles.addRow}>
            <WorkbenchButton
              variant="subtle"
              icon={<TextToolIcon size={15} />}
              onClick={() => workbench.addLayer('text')}
            >
              Text
            </WorkbenchButton>
            <WorkbenchButton
              variant="subtle"
              icon={<ShapeIcon size={15} />}
              onClick={() => workbench.addLayer('shape')}
            >
              Shape
            </WorkbenchButton>
            <WorkbenchButton
              variant="subtle"
              icon={<SparklesIcon size={15} />}
              onClick={() => workbench.addLayer('art')}
            >
              Artwork
            </WorkbenchButton>
          </div>
        </InspectorSection>
      </div>
    );
  }

  const set = (patch) => updateLayer(selection.id, patch);
  const Body = BODIES[selection.type] ?? ShapeProperties;
  const Glyph = GLYPHS[selection.type] ?? ShapeIcon;

  return (
    <div className={styles.panel}>
      <header className={styles.layerHead}>
        <span className={styles.layerGlyph} aria-hidden="true">
          <Glyph size={16} />
        </span>
        <span className={styles.layerNames}>
          <span className={styles.layerName}>{selection.name}</span>
          <span className={styles.layerType}>
            {TYPE_NAMES[selection.type] ?? 'Layer'}
          </span>
        </span>
      </header>

      <InspectorSection title="Position & size">
        <FieldGroup columns={2}>
          <NumberField
            label="X"
            value={selection.x}
            onChange={(x) => set({ x })}
          />
          <NumberField
            label="Y"
            value={selection.y}
            onChange={(y) => set({ y })}
          />
          <NumberField
            label="W"
            value={selection.width}
            min={12}
            onChange={(width) => set({ width })}
          />
          <NumberField
            label="H"
            value={selection.height}
            min={12}
            onChange={(height) => set({ height })}
          />
        </FieldGroup>

        <NumberField
          label="Rotate"
          value={selection.rotation}
          min={-360}
          max={360}
          suffix="°"
          onChange={(rotation) => set({ rotation })}
        />

        {/* Opacity is stored 0–1 and shown 0–100: nobody thinks in 0.65. */}
        <SliderField
          label="Opacity"
          value={Math.round((selection.opacity ?? 1) * 100)}
          min={0}
          max={100}
          format={(value) => `${value}%`}
          onChange={(value) => set({ opacity: value / 100 })}
        />

        <ToggleRow
          label="Locked"
          hint="ignores clicks"
          checked={selection.locked}
          onChange={(locked) => set({ locked })}
        />
      </InspectorSection>

      <InspectorSection title="Alignment">
        <div className={styles.alignGrid} role="group" aria-label="Align layer">
          {ALIGN_EDGES.map(({ edge, label }) => (
            <button
              key={edge}
              type="button"
              className={styles.alignButton}
              aria-label={label}
              title={label}
              onClick={() => align(edge)}
            >
              <AlignIcon edge={edge} />
            </button>
          ))}
        </div>
      </InspectorSection>

      <InspectorSection title={TYPE_NAMES[selection.type] ?? 'Layer'}>
        <Body layer={selection} set={set} stampPicker={stampPicker} />
      </InspectorSection>

      <InspectorSection title="Arrange">
        <div className={styles.arrangeGrid}>
          <WorkbenchButton
            variant="subtle"
            onClick={() => reorder(selection.id, 'front')}
          >
            To front
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => reorder(selection.id, 'back')}
          >
            To back
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => reorder(selection.id, 'up')}
          >
            Forward
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => reorder(selection.id, 'down')}
          >
            Backward
          </WorkbenchButton>
        </div>

        <div className={styles.arrangeGrid}>
          <WorkbenchButton
            variant="subtle"
            onClick={() => duplicate(selection.id)}
          >
            Duplicate
          </WorkbenchButton>
          <WorkbenchButton
            variant="danger"
            icon={<TrashIcon size={14} />}
            onClick={() => removeLayer(selection.id)}
          >
            Delete
          </WorkbenchButton>
        </div>
      </InspectorSection>
    </div>
  );
};

Inspector.propTypes = {
  workbench: PropTypes.shape({
    selection: PropTypes.object,
    addLayer: PropTypes.func.isRequired,
    updateLayer: PropTypes.func.isRequired,
    removeLayer: PropTypes.func.isRequired,
    duplicate: PropTypes.func.isRequired,
    reorder: PropTypes.func.isRequired,
    align: PropTypes.func.isRequired,
  }).isRequired,
  /** Substrate controls owned by the route, shown when nothing is selected. */
  documentSection: PropTypes.node,
  /** A route-supplied art browser; falls back to the built-in stamp grid. */
  stampPicker: PropTypes.node,
  children: PropTypes.node,
};
