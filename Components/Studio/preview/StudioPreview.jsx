import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PersonImage } from '../cast/CastArt';
import { castStarring, KID_LOOKS, kidLookById } from '../cast/castModel';
import { onRasterReady } from '../cast/castRaster';
import { encodeDesign } from '../core/designCodec';
import { DESIGN_SCHEMA_VERSION } from '../core/designDoc';
import { buildStarter, STARTERS } from '../starters/starters';
import { paintLayers } from '../workbench/renderLayers';
import styles from './StudioPreview.module.css';

/**
 * A deliberately shallow taste of one product studio, embedded in the
 * marketing page: the editor's own opening — a finished idea starring a kid
 * — with just enough choice to make it theirs (who, which idea, one product
 * option). No layers, no zoom.
 *
 * It renders through the same starters, substrate painter and layer
 * renderer as the workbench, so the preview and the real editor cannot
 * drift apart, and "Continue in the full designer" opens exactly what is on
 * screen.
 */
export const StudioPreview = ({
  product,
  templateMode,
  drawSubstrate,
  ideas,
  ideaLabel,
  swatch,
  eyebrow,
  headline,
  blurb,
  upsell,
}) => {
  const canvasRef = useRef(null);
  const [look, setLook] = useState(KID_LOOKS[0].id);
  const [name, setName] = useState('');
  const [idea, setIdea] = useState(ideas[0]);
  const [choice, setChoice] = useState(
    swatch ? product.defaults[swatch.key] : null
  );

  const starters = useMemo(
    () =>
      ideas
        .map((id) => STARTERS[templateMode]?.find((s) => s.id === id))
        .filter(Boolean),
    [ideas, templateMode]
  );
  const starter = starters.find((s) => s.id === idea) ?? starters[0];

  const options = useMemo(
    () => ({
      ...product.defaults,
      ...(swatch ? { [swatch.key]: choice } : {}),
    }),
    [product, swatch, choice]
  );
  const artboard = useMemo(() => product.artboard(options), [product, options]);
  const cast = useMemo(() => castStarring(look, name), [look, name]);

  const design = useMemo(() => {
    const built = buildStarter(templateMode, starter, {
      artboard,
      options,
      cast,
    });
    const config = { ...options, ...built.options };
    // A book shows the first page of its story.
    const layers = config.activeSpread
      ? built.layers.filter((l) => l.page === config.activeSpread)
      : built.layers;
    return { config, layers, cast: built.cast };
  }, [templateMode, starter, artboard, options, cast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!ctx || typeof ctx.setTransform !== 'function') return undefined;

    const paint = () => {
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const box = canvas.parentElement?.getBoundingClientRect();
      const room = Math.max(200, (box?.width ?? artboard.width) - 40);
      const displayWidth = Math.min(
        room,
        460,
        (420 * artboard.width) / artboard.height
      );
      const scale = displayWidth / artboard.width;
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(artboard.height * scale * dpr);
      canvas.style.width = `${Math.round(displayWidth)}px`;
      canvas.style.height = `${Math.round(artboard.height * scale)}px`;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, artboard.width, artboard.height);
      drawSubstrate(ctx, { ...artboard, config: design.config });
      paintLayers(ctx, {
        layers: design.layers,
        artboard,
        cast: design.cast,
        scale,
      });
    };

    let frame = requestAnimationFrame(paint);
    // Cast art decodes a frame or two later; paint again when it lands.
    const off = onRasterReady(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });
    return () => {
      cancelAnimationFrame(frame);
      off();
    };
  }, [artboard, design, drawSubstrate]);

  /**
   * The handoff: the idea and the kid, not the layers. The designer rebuilds
   * them with the same starter, so the link stays short and arrives as a
   * real idea the shopper can swap.
   */
  const continueHref = useMemo(() => {
    // Built by hand rather than via createDesignDoc: that stamps `Date.now()`
    // into meta, which differs between the server render and the client
    // hydration and makes React discard the whole link as a mismatch.
    const encoded = encodeDesign({
      v: DESIGN_SCHEMA_VERSION,
      mode: product.mode,
      options,
      layers: [],
      meta: { idea: starter.id, hero: { look, name: name.trim() } },
    });
    return encoded ? `${product.route}?d=${encoded}` : product.route;
  }, [product, options, starter, look, name]);

  const heroName = name.trim() || kidLookById(look).name;

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
            aria-label={`${product.title} preview starring ${heroName}: ${starter.name}`}
          />
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Your star&apos;s name</span>
            <input
              type="text"
              className={styles.input}
              value={name}
              maxLength={14}
              placeholder={kidLookById(look).name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <fieldset className={styles.field}>
            <legend className={styles.fieldLabel}>Who&apos;s the star</legend>
            <div className={styles.kids} role="group" aria-label="Kids">
              {KID_LOOKS.map((kid) => (
                <button
                  key={kid.id}
                  type="button"
                  className={`${styles.kid} ${look === kid.id ? styles.kidActive : ''}`}
                  aria-pressed={look === kid.id}
                  aria-label={kid.name}
                  title={kid.name}
                  onClick={() => setLook(kid.id)}
                >
                  <PersonImage
                    person={castStarring(kid.id)[0]}
                    crop="head"
                    className={styles.kidArt}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.fieldLabel}>{ideaLabel}</legend>
            <div className={styles.ideas} role="group" aria-label={ideaLabel}>
              {starters.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.idea} ${starter.id === s.id ? styles.ideaActive : ''}`}
                  aria-pressed={starter.id === s.id}
                  onClick={() => setIdea(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </fieldset>

          {swatch && (
            <fieldset className={styles.field}>
              <legend className={styles.fieldLabel}>{swatch.label}</legend>
              <div className={styles.swatchRow} role="group">
                {swatch.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={choice === option.value}
                    aria-label={option.name}
                    title={option.name}
                    className={`${styles.swatch} ${
                      choice === option.value ? styles.swatchActive : ''
                    }`}
                    style={{ '--preview-swatch': option.color }}
                    onClick={() => setChoice(option.value)}
                  />
                ))}
              </div>
            </fieldset>
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
  ideas: PropTypes.arrayOf(PropTypes.string).isRequired,
  ideaLabel: PropTypes.string.isRequired,
  swatch: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  eyebrow: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired,
  blurb: PropTypes.string.isRequired,
  upsell: PropTypes.shape({
    title: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};
