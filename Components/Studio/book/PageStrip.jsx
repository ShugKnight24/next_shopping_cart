import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef } from 'react';
import { onRasterReady } from '../cast/castRaster';
import { paintLayers } from '../workbench/renderLayers';
import {
  activeSpreadOf,
  createStorySpread,
  MOMENTS,
  spreadLabel,
} from './bookPages';
import styles from './PageStrip.module.css';

/**
 * The page strip under the book canvas: every spread as a live thumbnail.
 * Click one to turn to it; "Add a page" appends a story spread.
 */

const THUMB_H = 54;

const layersOf = (all, spread, fallback) =>
  all.filter((l) => (l.page ?? fallback) === spread.id);

/** One spread painted small: its substrate and its own layers. */
const SpreadThumb = ({
  spread,
  options,
  artboard,
  drawSubstrate,
  layers,
  cast,
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
      const scale = THUMB_H / artboard.height;
      const w = Math.round(artboard.width * scale);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(THUMB_H * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${THUMB_H}px`;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.clearRect(0, 0, artboard.width, artboard.height);
      try {
        drawSubstrate(ctx, {
          ...artboard,
          config: { ...options, activeSpread: spread.id },
        });
        paintLayers(ctx, { layers, artboard, cast, scale });
      } catch {
        // A thumbnail must never take the editor down with it.
      }
    };

    // Coalesce bursts of edits (a drag) into one repaint per frame.
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
  }, [spread, options, artboard, drawSubstrate, layers, cast]);

  return <canvas ref={ref} className={styles.thumb} aria-hidden="true" />;
};

SpreadThumb.propTypes = {
  spread: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  layers: PropTypes.array.isRequired,
  cast: PropTypes.array,
};

export const PageStrip = ({
  options,
  setOptions,
  workbench,
  artboard,
  drawSubstrate,
  cast,
}) => {
  const spreads = useMemo(() => options.spreads ?? [], [options.spreads]);
  const firstStory = spreads.find((s) => s.kind === 'story')?.id;
  const all = workbench.allLayers ?? workbench.layers;

  // Per-spread lists that keep their identity while that spread is untouched,
  // so editing one page repaints one thumbnail.
  const lists = useRef(new Map());
  const bySpread = useMemo(() => {
    const next = new Map();
    spreads.forEach((spread) => {
      const fresh = layersOf(all, spread, firstStory);
      const prev = lists.current.get(spread.id);
      next.set(
        spread.id,
        prev &&
          prev.length === fresh.length &&
          prev.every((l, i) => l === fresh[i])
          ? prev
          : fresh
      );
    });
    lists.current = next;
    return next;
  }, [all, spreads, firstStory]);
  const activeRef = useRef(null);
  const activeId = activeSpreadOf(options)?.id;

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeId]);

  const go = (id) => {
    workbench.select(null);
    // Turning a page is navigation, not an edit: no undo step.
    setOptions((current) => ({ ...current, activeSpread: id }), {
      commit: false,
    });
  };

  const addPage = () => {
    const spread = createStorySpread(null, {
      sceneId: MOMENTS[0].sceneId,
      timeOfDay: 'day',
    });
    setOptions((current) => ({
      ...current,
      spreads: [...(current.spreads ?? []), spread],
      activeSpread: spread.id,
    }));
    workbench.select(null);
  };

  return (
    <nav className={styles.strip} aria-label="Pages">
      <ol className={styles.list}>
        {spreads.map((spread) => {
          const active = spread.id === activeId;
          const label = spreadLabel(spreads, spread);
          return (
            <li key={spread.id}>
              <button
                ref={active ? activeRef : undefined}
                type="button"
                className={`${styles.page} ${active ? styles.pageActive : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                onClick={() => go(spread.id)}
              >
                <SpreadThumb
                  spread={spread}
                  options={options}
                  artboard={artboard}
                  drawSubstrate={drawSubstrate}
                  layers={bySpread.get(spread.id)}
                  cast={cast}
                />
                <span className={styles.label}>{label}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button type="button" className={styles.add} onClick={addPage}>
            <span aria-hidden="true">+</span>
            Add a page
          </button>
        </li>
      </ol>
    </nav>
  );
};

PageStrip.propTypes = {
  options: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  cast: PropTypes.array,
};
