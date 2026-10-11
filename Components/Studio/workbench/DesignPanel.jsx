import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { MemberImage, TileGrid } from '../cast/CastArt';
import { memberName } from '../cast/castModel';
import { onRasterReady } from '../cast/castRaster';
import { drawEnvironmentScene } from '../sceneRenderer';
import { IdeaThumb } from '../starters/StarterGallery';
import { randomStarter, STARTERS } from '../starters/starters';
import styles from './DesignPanel.module.css';
import { InspectorSection, WorkbenchButton } from './WorkbenchShell';

/**
 * The pieces every product's settings panel is built from, so the book, the
 * poster, the hoodie and the social post all work the same way: pick an
 * idea, see who is in it, then choose the product itself from pictures
 * rather than names.
 */

export const Note = ({ children }) => <p className={styles.note}>{children}</p>;

Note.propTypes = { children: PropTypes.node.isRequired };

/** A small live canvas: `draw(ctx, w, h)` paints in its own units. */
export const LivePreview = ({ width, height, draw, deps }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext?.('2d');
    // jsdom has no real 2D context; the preview is decorative.
    if (!ctx || typeof ctx.setTransform !== 'function') return undefined;
    const paint = () => {
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const box = canvas.getBoundingClientRect();
      const scale = (box.width || 120) / width;
      canvas.width = Math.round(width * scale * dpr);
      canvas.height = Math.round(height * scale * dpr);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      try {
        draw(ctx, width, height);
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
    // `deps` stands in for whatever `draw` closes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <canvas
      ref={ref}
      className={styles.preview}
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-hidden="true"
    />
  );
};

LivePreview.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  draw: PropTypes.func.isRequired,
  deps: PropTypes.array.isRequired,
};

/** One of the illustrated scene environments, small. */
export const SceneThumb = ({ sceneId, timeOfDay = 'day' }) => (
  <LivePreview
    width={160}
    height={110}
    deps={[sceneId, timeOfDay]}
    draw={(ctx, w, h) =>
      drawEnvironmentScene(ctx, {
        sceneId,
        stageX: 0,
        stageY: 0,
        stageW: w,
        stageH: h,
        timeOfDay,
        weatherEffect: 'none',
        isFullBleed: true,
      })
    }
  />
);

SceneThumb.propTypes = {
  sceneId: PropTypes.string.isRequired,
  timeOfDay: PropTypes.string,
};

/** A flat colour (or a gradient, given as CSS) for a swatch tile. */
export const Chip = ({ fill }) => (
  <span className={styles.chip} style={{ background: fill }} />
);

Chip.propTypes = { fill: PropTypes.string.isRequired };

/** A tile's price line, so cost is visible where the choice is made. */
export const priceDetail = (modifier) =>
  modifier
    ? `+$${Number.isInteger(modifier) ? modifier : modifier.toFixed(2)}`
    : 'Included';

/**
 * Ideas, acted out by the shopper's own cast on their own product. Picking
 * one swaps the last idea's layers; anything the shopper added stays.
 */
export const IdeaPicker = ({
  mode,
  title,
  note,
  artboard,
  options,
  cast,
  drawSubstrate,
  onApply,
}) => {
  const list = STARTERS[mode] ?? [];
  if (!list.length || !cast) return null;
  const shape =
    artboard.width >= artboard.height * 1.15
      ? 'wide'
      : artboard.height >= artboard.width * 1.15
        ? 'tall'
        : 'square';
  return (
    <InspectorSection title={title}>
      {note && <Note>{note}</Note>}
      <TileGrid
        label="Ideas"
        hideLabel
        columns={2}
        shape={shape}
        value={options.idea}
        onChange={(id) => onApply(list.find((s) => s.id === id))}
        options={list.map((starter) => ({
          value: starter.id,
          name: starter.name,
          art: (
            <IdeaThumb
              mode={mode}
              starter={starter}
              artboard={artboard}
              options={options}
              cast={cast}
              drawSubstrate={drawSubstrate}
            />
          ),
        }))}
      />
      <WorkbenchButton
        variant="subtle"
        onClick={() => onApply(randomStarter(mode, options.idea))}
      >
        Inspire me
      </WorkbenchButton>
    </InspectorSection>
  );
};

IdeaPicker.propTypes = {
  mode: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  note: PropTypes.node,
  artboard: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  cast: PropTypes.array,
  drawSubstrate: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

/**
 * Everyone in the cast, and whether they are in this design: add them, jump
 * to them, or change how they look.
 */
export const CastOnDesign = ({
  title,
  cast,
  workbench,
  onPlaceMember,
  onEditMember,
  openPanel,
}) => (
  <InspectorSection title={title}>
    <ul className={styles.castList}>
      {(cast ?? []).map((member) => {
        const layer = workbench.layers.find(
          (l) => l.type === 'character' && l.castId === member.id
        );
        return (
          <li key={member.id} className={styles.castRow}>
            <span className={styles.castArt}>
              <MemberImage member={member} crop="head" />
            </span>
            <span className={styles.castName}>{memberName(member)}</span>
            <WorkbenchButton
              variant="subtle"
              aria-label={`${layer ? 'Select' : 'Add'} ${memberName(member)}`}
              onClick={() =>
                layer ? workbench.select(layer.id) : onPlaceMember(member)
              }
            >
              {layer ? 'Select' : 'Add'}
            </WorkbenchButton>
            <WorkbenchButton
              variant="subtle"
              aria-label={`Edit ${memberName(member)}'s look`}
              onClick={() => onEditMember(member.id)}
            >
              Look
            </WorkbenchButton>
          </li>
        );
      })}
    </ul>
    <div className={styles.row}>
      <WorkbenchButton variant="subtle" onClick={() => openPanel('cast')}>
        Manage cast
      </WorkbenchButton>
      <WorkbenchButton variant="subtle" onClick={() => openPanel('scenery')}>
        Add scenery
      </WorkbenchButton>
    </div>
  </InspectorSection>
);

CastOnDesign.propTypes = {
  title: PropTypes.string.isRequired,
  cast: PropTypes.array,
  workbench: PropTypes.object.isRequired,
  onPlaceMember: PropTypes.func.isRequired,
  onEditMember: PropTypes.func.isRequired,
  openPanel: PropTypes.func.isRequired,
};

export { styles as panelStyles };
