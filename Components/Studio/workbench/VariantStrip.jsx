import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef } from 'react';
import styles from '../book/PageStrip.module.css';
import { onRasterReady } from '../cast/castRaster';
import { useSettled } from '../core/useStable';
import { refitLayer } from './layerModel';
import { paintLayers } from './renderLayers';

/**
 * The strip under the canvas, for products without pages: the design as it
 * is right now on every version of the product (each garment, each frame,
 * each post format). It is the book's page strip for a poster or a hoodie:
 * the whole range at a glance, one click to switch.
 *
 *   variants: [{ id, name, options }] — `options` is the patch that variant
 *   applies; `artboardFor(options)` gives its artboard, and
 *   `fitLayers(layers, from, to, options)` carries the design onto it.
 */

const THUMB_H = 54;

const VariantThumb = ({
  config,
  board,
  from,
  layers,
  drawSubstrate,
  cast,
  fitLayers,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext?.('2d');
    // jsdom has no real 2D context; the thumbnail is decorative.
    if (!ctx || typeof ctx.setTransform !== 'function') return undefined;

    const paint = () => {
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const scale = THUMB_H / board.height;
      const w = Math.round(board.width * scale);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(THUMB_H * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${THUMB_H}px`;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.clearRect(0, 0, board.width, board.height);
      try {
        drawSubstrate(ctx, { ...board, config });
        paintLayers(ctx, {
          layers:
            from.width === board.width && from.height === board.height
              ? layers
              : fitLayers(layers, from, board, config),
          artboard: board,
          cast,
          scale,
        });
      } catch {
        // A thumbnail must never take the editor down with it.
      }
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };
    schedule();
    const off = onRasterReady(schedule);
    return () => {
      cancelAnimationFrame(frame);
      off();
    };
  }, [config, board, from, layers, drawSubstrate, cast, fitLayers]);

  return <canvas ref={ref} className={styles.thumb} aria-hidden="true" />;
};

VariantThumb.propTypes = {
  config: PropTypes.object.isRequired,
  board: PropTypes.object.isRequired,
  from: PropTypes.object.isRequired,
  layers: PropTypes.array.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  cast: PropTypes.array,
  fitLayers: PropTypes.func.isRequired,
};

const refitAll = (layers, from, to) =>
  layers.map((l) => refitLayer(l, from, to));

export const VariantStrip = ({
  label,
  variants,
  isActive,
  options,
  setOptions,
  workbench,
  artboard,
  artboardFor,
  drawSubstrate,
  cast,
  fitLayers = refitAll,
}) => {
  // The other formats catch up once a drag pauses: refitting every layer
  // for four boards on each pointer move would cost a frame per move.
  const settled = useSettled(workbench.layers, 120);
  // Stable per variant until an option changes, so a drag repaints the
  // thumbnails without rebuilding their configs.
  const entries = useMemo(
    () =>
      variants.map((variant) => {
        const config = { ...options, ...variant.options };
        const board = artboardFor ? artboardFor(config) : artboard;
        return { variant, config, board };
      }),
    [variants, options, artboard, artboardFor]
  );

  return (
    <nav className={styles.strip} aria-label={label}>
      <ol className={styles.list}>
        {entries.map(({ variant, config, board }) => {
          const active = isActive(variant, options);
          return (
            <li key={variant.id}>
              <button
                type="button"
                className={`${styles.page} ${active ? styles.pageActive : ''}`}
                aria-pressed={active}
                aria-label={variant.name}
                onClick={() =>
                  setOptions((current) => ({ ...current, ...variant.options }))
                }
              >
                <VariantThumb
                  config={config}
                  board={board}
                  from={artboard}
                  layers={settled}
                  drawSubstrate={drawSubstrate}
                  cast={cast}
                  fitLayers={fitLayers}
                />
                <span className={styles.label}>{variant.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

VariantStrip.propTypes = {
  label: PropTypes.string.isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      options: PropTypes.object.isRequired,
    })
  ).isRequired,
  isActive: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  artboardFor: PropTypes.func,
  drawSubstrate: PropTypes.func.isRequired,
  cast: PropTypes.array,
  fitLayers: PropTypes.func,
};
