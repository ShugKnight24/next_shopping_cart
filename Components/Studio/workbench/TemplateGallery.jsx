import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { applyTemplate, createLayer } from './layerModel';
import { paintLayers } from './renderLayers';
import styles from './TemplateGallery.module.css';

/**
 * The template and style browser.
 *
 * Two rules decide how this panel is built:
 *
 * 1. A thumbnail is the composition, not a swatch. Every card paints the
 *    template's own layer stack through `paintLayers` — the same painter the
 *    artboard and the export use — scaled into the card. A coloured rectangle
 *    with a name under it makes every template look like every other one, which
 *    is the reason template pickers get ignored.
 * 2. Applying a template goes through `applyTemplate`, which carries typed
 *    content across by slot role and keeps layers the shopper added themselves.
 *    Browsing layouts must never cost someone their words, and the UI says so
 *    out loud so they will actually browse.
 */

/* The card's paint box, in CSS pixels. Artboards vary wildly in aspect — a
   hoodie front is nearly square, a poster is tall — so the artwork is
   letterboxed inside a fixed box rather than the box tracking the artwork. */
const THUMB = { width: 152, height: 116, padding: 9 };

const PAPER = '#ffffff';

const TemplateThumb = ({ template }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    // jsdom's 2D context is a stub without a transform stack. The thumbnail is
    // decorative, so an unpaintable context leaves an empty card rather than
    // taking the whole panel down — the same accommodation `wrapText` makes.
    if (!ctx || typeof ctx.setTransform !== 'function') return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(THUMB.width * dpr);
    canvas.height = Math.round(THUMB.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, THUMB.width, THUMB.height);

    const artboard = template.artboard ?? { width: 600, height: 800 };
    const scale = Math.min(
      (THUMB.width - THUMB.padding * 2) / artboard.width,
      (THUMB.height - THUMB.padding * 2) / artboard.height
    );

    const width = artboard.width * scale;
    const height = artboard.height * scale;

    ctx.save();
    ctx.translate((THUMB.width - width) / 2, (THUMB.height - height) / 2);
    ctx.scale(scale, scale);

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, artboard.width, artboard.height);

    ctx.beginPath();
    ctx.rect(0, 0, artboard.width, artboard.height);
    ctx.clip();

    // Specs are partial layers; hydrating them through the same factory the
    // editor uses is what gives them `visible`, opacity and the type defaults
    // the painter reads.
    const layers = (template.layers ?? []).map((spec) =>
      createLayer(spec.type, spec)
    );

    paintLayers(ctx, { layers, artboard, scale });
    ctx.restore();
  }, [template]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.thumbCanvas}
      width={THUMB.width}
      height={THUMB.height}
    />
  );
};

TemplateThumb.propTypes = {
  template: PropTypes.shape({
    artboard: PropTypes.object,
    layers: PropTypes.array,
  }).isRequired,
};

/* ---------------------------------------------------------------- cards -- */

const TemplateCard = ({ template, onApply }) => (
  <li className={styles.cardItem}>
    <button type="button" className={styles.card} onClick={onApply}>
      <span className={styles.thumb}>
        <TemplateThumb template={template} />
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardName}>{template.name}</span>
        {template.description && (
          <span className={styles.cardDescription}>{template.description}</span>
        )}
      </span>
    </button>
  </li>
);

TemplateCard.propTypes = {
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
};

const StyleCard = ({ preset, disabled, onApply }) => (
  <li>
    <button
      type="button"
      className={styles.style}
      disabled={disabled}
      onClick={onApply}
    >
      <span className={styles.stylePalette} aria-hidden="true">
        {(preset.palette ?? []).slice(0, 4).map((colour, index) => (
          <span
            // Palettes repeat colours often enough that the value alone is not
            // a key.
            key={`${colour}-${index}`}
            className={styles.styleDot}
            style={{ '--wb-style-dot': colour }}
          />
        ))}
      </span>
      <span className={styles.styleName}>{preset.name}</span>
    </button>
  </li>
);

StyleCard.propTypes = {
  preset: PropTypes.shape({
    name: PropTypes.string.isRequired,
    palette: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  onApply: PropTypes.func.isRequired,
};

/* -------------------------------------------------------------- grouping -- */

/** Group by `category`, insertion-ordered, so the table's own ordering is the
 *  editorial ordering and this file has no opinion about which comes first. */
const groupByCategory = (templates) => {
  const groups = new Map();

  templates.forEach((template) => {
    const key = template.category ?? 'Templates';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(template);
  });

  return [...groups.entries()];
};

/* --------------------------------------------------------------- panel -- */

export const TemplateGallery = ({
  mode,
  templates = [],
  stylePresets = [],
  workbench,
  onApplySubstrate = null,
}) => {
  // The tables are authored by another module and are allowed to be absent or
  // a different shape; an empty panel beats a panel that throws.
  const list = Array.isArray(templates) ? templates.filter(Boolean) : [];
  const styleList = Array.isArray(stylePresets)
    ? stylePresets.filter(
        (preset) => preset && typeof preset.apply === 'function'
      )
    : [];

  const groups = groupByCategory(list);
  const hasLayers = workbench.layers.length > 0;

  const applyTemplateToStack = (template) => {
    workbench.setLayers((current) => applyTemplate(template, current));
    workbench.select(null);
    if (template.substrate) onApplySubstrate?.(template.substrate);
  };

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>Templates</h2>
        <p className={styles.headerNote}>
          Start from a finished layout — your text is kept when you switch.
        </p>
      </header>

      {groups.length === 0 ? (
        <p className={styles.empty}>
          No {mode} templates yet. Build your own layout with the tools on the
          left; it will still export at full resolution.
        </p>
      ) : (
        groups.map(([category, items]) => (
          <section key={category} className={styles.group}>
            <h3 className={styles.groupTitle}>{category}</h3>
            <ul className={styles.grid}>
              {items.map((template) => (
                <TemplateCard
                  key={template.id ?? template.name}
                  template={template}
                  onApply={() => applyTemplateToStack(template)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {styleList.length > 0 && (
        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Styles</h3>
          <p className={styles.groupNote}>
            Recolours and re-types what is already on the artboard. The layout
            does not move.
          </p>

          <ul className={styles.styleRow}>
            {styleList.map((preset) => (
              <StyleCard
                key={preset.id ?? preset.name}
                preset={preset}
                disabled={!hasLayers}
                onApply={() =>
                  workbench.setLayers((current) => preset.apply(current))
                }
              />
            ))}
          </ul>

          {!hasLayers && (
            <p className={styles.groupNote}>
              Add a layer or pick a template first — a style needs something to
              restyle.
            </p>
          )}
        </section>
      )}
    </div>
  );
};

TemplateGallery.propTypes = {
  mode: PropTypes.string.isRequired,
  templates: PropTypes.array,
  stylePresets: PropTypes.array,
  workbench: PropTypes.shape({
    layers: PropTypes.array.isRequired,
    setLayers: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
  }).isRequired,
  /** Called with a template's substrate overrides — the route owns those. */
  onApplySubstrate: PropTypes.func,
};
