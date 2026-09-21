import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { encodeDesign } from '../core/designCodec';
import { DESIGN_SCHEMA_VERSION } from '../core/designDoc';
import { applyTemplate } from '../workbench/layerModel';
import { paintLayers } from '../workbench/renderLayers';
import { TEMPLATES_BY_MODE } from '../workbench/templates';
import styles from './StudioPreview.module.css';

/**
 * A deliberately shallow taste of one product studio, embedded in the
 * marketing page.
 *
 * It exists to show that the product really is customizable, not to be the
 * place anyone finishes a design — so it offers a handful of options and no
 * layers, templates or zoom. Whatever the visitor does here is encoded into
 * the full designer's share link, so "Continue in the full designer" resumes
 * exactly what is on screen rather than dropping them on a blank artboard.
 *
 * It renders through the same substrate painter and layer renderer as the
 * workbench, so the preview and the real editor cannot drift apart.
 */
export const StudioPreview = ({
  product,
  templateMode,
  drawSubstrate,
  starterTemplateId,
  fields,
  eyebrow,
  headline,
  blurb,
  upsell,
}) => {
  const canvasRef = useRef(null);
  const [options, setOptions] = useState(() => ({ ...product.defaults }));

  const artboard = useMemo(() => product.artboard(options), [product, options]);

  const layers = useMemo(() => {
    const templates = TEMPLATES_BY_MODE[templateMode] ?? [];
    const starter =
      templates.find((t) => t.id === starterTemplateId) ?? templates[0];
    return starter ? applyTemplate(starter, []) : [];
  }, [templateMode, starterTemplateId]);

  /** Text the visitor has typed overrides the starter template's copy. */
  const composed = useMemo(
    () =>
      layers.map((layer) =>
        layer.slotRole && options[`slot_${layer.slotRole}`]
          ? { ...layer, text: options[`slot_${layer.slotRole}`] }
          : layer
      ),
    [layers, options]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const box = canvas.parentElement?.getBoundingClientRect();
    const displayWidth = Math.min(box?.width ?? artboard.width, 460);
    const scale = displayWidth / artboard.width;
    const displayHeight = artboard.height * scale;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.style.width = `${Math.round(displayWidth)}px`;
    canvas.style.height = `${Math.round(displayHeight)}px`;

    if (typeof ctx.setTransform !== 'function') return;

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, artboard.width, artboard.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, artboard.width, artboard.height);

    drawSubstrate(ctx, { ...artboard, config: options });
    paintLayers(ctx, { layers: composed, artboard, scale });
  }, [artboard, composed, drawSubstrate, options]);

  /**
   * The handoff.
   *
   * Encoding every seeded layer produced a ~2.4KB URL, which is past the point
   * where links survive being copied around. The designer already has the
   * template table, so send the template id and the visitor's overrides and let
   * it rebuild — roughly a tenth the size, and it arrives as a real template so
   * template swapping still carries the text across.
   */
  const continueHref = useMemo(() => {
    const slots = fields.reduce((acc, field) => {
      const value = options[field.key];
      if (field.key.startsWith('slot_') && value) {
        acc[field.key.slice('slot_'.length)] = value;
      }
      return acc;
    }, {});

    // Built by hand rather than via createDesignDoc: that stamps `Date.now()`
    // into meta, which differs between the server render and the client
    // hydration and makes React discard the whole link as a mismatch.
    const encoded = encodeDesign({
      v: DESIGN_SCHEMA_VERSION,
      mode: product.mode,
      options,
      layers: [],
      meta: { template: starterTemplateId, slots },
    });
    return encoded ? `${product.route}?d=${encoded}` : product.route;
  }, [product, options, fields, starterTemplateId]);

  const setOption = (key, value) =>
    setOptions((current) => ({ ...current, [key]: value }));

  return (
    <section
      className={styles.preview}
      aria-labelledby={`${product.mode}-preview`}
    >
      <header className={styles.header}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h3 className={styles.headline} id={`${product.mode}-preview`}>
          {headline}
        </h3>
        <p className={styles.blurb}>{blurb}</p>
      </header>

      <div className={styles.body}>
        <div className={styles.stage}>
          <span className={styles.stageTag}>Live preview</span>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={`${product.title} preview`}
          />
        </div>

        <div className={styles.controls}>
          {fields.map((field) =>
            field.type === 'text' ? (
              <label key={field.key} className={styles.field}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <input
                  type="text"
                  className={styles.input}
                  value={options[field.key] ?? field.placeholder ?? ''}
                  maxLength={field.maxLength ?? 28}
                  placeholder={field.placeholder}
                  onChange={(event) => setOption(field.key, event.target.value)}
                />
              </label>
            ) : field.type === 'swatch' ? (
              <fieldset key={field.key} className={styles.field}>
                <legend className={styles.fieldLabel}>{field.label}</legend>
                <div className={styles.swatchRow} role="group">
                  {field.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={options[field.key] === option.value}
                      aria-label={option.name}
                      title={option.name}
                      className={`${styles.swatch} ${
                        options[field.key] === option.value
                          ? styles.swatchActive
                          : ''
                      }`}
                      style={{ '--preview-swatch': option.value }}
                      onClick={() => setOption(field.key, option.value)}
                    />
                  ))}
                </div>
              </fieldset>
            ) : (
              <label key={field.key} className={styles.field}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <select
                  className={styles.select}
                  value={options[field.key] ?? ''}
                  onChange={(event) => setOption(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            )
          )}

          <div className={styles.upsell}>
            <h4 className={styles.upsellTitle}>{upsell.title}</h4>
            <ul className={styles.upsellList}>
              {upsell.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <Link href={continueHref} className={styles.continueBtn}>
              Continue in the full designer
            </Link>

            <p className={styles.upsellNote}>
              Your preview comes with you — nothing is lost.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

StudioPreview.propTypes = {
  product: PropTypes.object.isRequired,
  templateMode: PropTypes.oneOf(['poster', 'apparel', 'book']).isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  starterTemplateId: PropTypes.string,
  fields: PropTypes.array.isRequired,
  eyebrow: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired,
  blurb: PropTypes.string.isRequired,
  upsell: PropTypes.shape({
    title: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};
