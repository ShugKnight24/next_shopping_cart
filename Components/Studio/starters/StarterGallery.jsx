import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef } from 'react';
import { onRasterReady } from '../cast/castRaster';
import { paintLayers } from '../workbench/renderLayers';
import { InspectorSection, WorkbenchButton } from '../workbench/WorkbenchShell';
import styles from './StarterGallery.module.css';
import { buildStarter, randomStarter, STARTERS } from './starters';

/**
 * "Start from an idea": finished designs, drawn live with the shopper's own
 * cast on their own product, for anyone staring at a blank artboard.
 */

export const IdeaThumb = ({
  mode,
  starter,
  artboard,
  options,
  cast,
  drawSubstrate,
}) => {
  const ref = useRef(null);
  const built = useMemo(
    () => buildStarter(mode, starter, { artboard, options, cast }),
    [mode, starter, artboard, options, cast]
  );

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext?.('2d');
    // jsdom has no real 2D context; the thumbnail is decorative.
    if (!ctx || typeof ctx.setTransform !== 'function') return undefined;
    const config = { ...options, ...built.options };
    // A book shows its cover; everything else shows the whole design.
    const page = starter.book ? config.spreads[0].id : null;
    const layers = page
      ? built.layers.filter((l) => l.page === page)
      : built.layers;
    if (page) config.activeSpread = page;

    const paint = () => {
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = canvas.getBoundingClientRect().width || 140;
      const scale = width / artboard.width;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(artboard.height * scale * dpr);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, artboard.width, artboard.height);
      try {
        drawSubstrate(ctx, { ...artboard, config });
        paintLayers(ctx, { layers, artboard, cast: built.cast, scale });
      } catch {
        // decorative
      }
    };
    let frame = requestAnimationFrame(paint);
    const off = onRasterReady(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });
    return () => {
      cancelAnimationFrame(frame);
      off();
    };
  }, [built, options, artboard, drawSubstrate, starter]);

  return (
    <canvas
      ref={ref}
      className={styles.thumb}
      style={{ aspectRatio: `${artboard.width} / ${artboard.height}` }}
      aria-hidden="true"
    />
  );
};

IdeaThumb.propTypes = {
  mode: PropTypes.string.isRequired,
  starter: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  cast: PropTypes.array.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
};

export const StarterGallery = ({
  mode,
  artboard,
  options,
  cast,
  drawSubstrate,
  onApply,
  limit = null,
  title = 'Start from an idea',
}) => {
  const all = STARTERS[mode] ?? [];
  const list = limit ? all.slice(0, limit) : all;
  if (!list.length) return null;

  return (
    <InspectorSection title={title}>
      <p className={styles.note}>
        Not sure where to begin? Open a finished design made with your cast,
        then change anything.
      </p>
      <ul className={styles.grid}>
        {list.map((starter) => (
          <li key={starter.id}>
            <button
              type="button"
              className={styles.card}
              onClick={() => onApply(starter)}
              aria-label={`${starter.name}: ${starter.idea}`}
            >
              <IdeaThumb
                mode={mode}
                starter={starter}
                artboard={artboard}
                options={options}
                cast={cast}
                drawSubstrate={drawSubstrate}
              />
              <span className={styles.name}>{starter.name}</span>
              <span className={styles.idea}>{starter.idea}</span>
            </button>
          </li>
        ))}
      </ul>
      <WorkbenchButton
        variant="primary"
        onClick={() => onApply(randomStarter(mode))}
      >
        Inspire me
      </WorkbenchButton>
    </InspectorSection>
  );
};

StarterGallery.propTypes = {
  mode: PropTypes.oneOf(['poster', 'apparel', 'book', 'social']).isRequired,
  artboard: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  cast: PropTypes.array.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  limit: PropTypes.number,
  title: PropTypes.string,
};
