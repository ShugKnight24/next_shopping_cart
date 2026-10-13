import PropTypes from 'prop-types';
import { TileGrid } from '../cast/CastArt';
import { drawApparelSubstrate } from '../drawSubstrate';
import {
  CastOnDesign,
  IdeaPicker,
  LivePreview,
  priceDetail,
} from '../workbench/DesignPanel';
import {
  FINISHES,
  GARMENT_COLORS,
  GARMENTS,
  PLACEMENTS,
  YOUTH_SIZES,
} from '../workbench/products';
import { SegmentedControl, SwatchGrid } from '../workbench/WorkbenchFields';
import { InspectorSection } from '../workbench/WorkbenchShell';
import styles from './ApparelPanel.module.css';

/**
 * The garment's settings, shown when nothing is selected, in the book's
 * order: the idea, who is on it, then the garment itself, every choice
 * drawn on the garment you are making.
 */

const BOARD = { width: 520, height: 420 };

/** Where each placement prints, on the 520 × 420 garment art. */
const ZONES = {
  pocket: { x: 192, y: 108, w: 56, h: 44 },
  chest: { x: 196, y: 112, w: 128, h: 164 },
  back: { x: 170, y: 104, w: 180, h: 200 },
};

const SHORT = {
  hoodie: 'Hoodie',
  tee: 'Tee',
  jacket: 'Varsity',
  kicks: 'High-tops',
};

export const garmentName = (id) => SHORT[id] ?? 'Garment';

const GarmentThumb = ({ options, patch, zone = null }) => (
  <LivePreview
    width={BOARD.width}
    height={BOARD.height}
    deps={[
      options.garment,
      options.color,
      options.accentColor,
      options.size,
      options.placement,
      patch.garment,
      patch.placement,
      zone,
    ]}
    draw={(ctx, w, h) => {
      drawApparelSubstrate(ctx, {
        width: w,
        height: h,
        config: { ...options, ...patch },
      });
      const z = zone && ZONES[zone];
      if (!z) return;
      ctx.save();
      ctx.fillStyle = 'rgba(232, 180, 76, 0.22)';
      ctx.strokeStyle = '#e8b44c';
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.roundRect?.(z.x, z.y, z.w, z.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }}
  />
);

GarmentThumb.propTypes = {
  options: PropTypes.object.isRequired,
  patch: PropTypes.object.isRequired,
  zone: PropTypes.string,
};

/** How each finish looks up close: flat ink, satin, chain loops, puff. */
const FinishArt = ({ id }) => (
  <svg viewBox="0 0 48 48" className={styles.finish} aria-hidden="true">
    {id === 'screen' && <rect x="8" y="14" width="32" height="20" rx="3" />}
    {id === 'satin' &&
      Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={10 + i * 3.5}
          y1="14"
          x2={8 + i * 3.5}
          y2="34"
          strokeWidth="2.4"
        />
      ))}
    {id === 'chain' &&
      Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={12 + i * 6} cy="24" rx="4" ry="6" fill="none" />
      ))}
    {id === 'puff' && (
      <>
        <rect x="8" y="16" width="32" height="18" rx="9" />
        <rect
          x="12"
          y="18"
          width="18"
          height="5"
          rx="2.5"
          className={styles.shine}
        />
      </>
    )}
  </svg>
);

FinishArt.propTypes = { id: PropTypes.string.isRequired };

// The segments only fit the size letter, so the hint carries the ages and
// any upcharge; the price is shown where the choice is made.
const sizeHint = (sizeId) => {
  const size = YOUTH_SIZES.find((s) => s.id === sizeId);
  const extras = YOUTH_SIZES.filter((s) => s.priceModifier)
    .map(
      (s) => `${s.name.replace('Youth ', '')} ${priceDetail(s.priceModifier)}`
    )
    .join(', ');
  return [size?.sub && `Ages ${size.sub}.`, extras && `${extras}.`]
    .filter(Boolean)
    .join(' ');
};

export const ApparelPanel = ({
  options,
  setOption,
  workbench,
  artboard,
  cast,
  drawSubstrate,
  openPanel,
  editMember,
  placeOnPage,
  applyIdea,
}) => (
  <>
    <IdeaPicker
      mode="apparel"
      title="Design idea"
      note="Pick an idea and your cast is printed on it. Then move, swap or restyle anything."
      artboard={artboard}
      options={options}
      cast={cast}
      drawSubstrate={drawSubstrate}
      onApply={applyIdea}
    />

    <CastOnDesign
      title={`On your ${garmentName(options.garment).toLowerCase()}`}
      cast={cast}
      workbench={workbench}
      onPlaceMember={placeOnPage}
      onEditMember={editMember}
      openPanel={openPanel}
    />

    <InspectorSection title="Garment">
      <TileGrid
        label="Style"
        options={GARMENTS.map((g) => ({
          value: g.id,
          name: garmentName(g.id),
          detail: `$${g.price}`,
          art: <GarmentThumb options={options} patch={{ garment: g.id }} />,
        }))}
        value={options.garment}
        onChange={(garment) => setOption('garment', garment)}
        columns={2}
        shape="wide"
      />

      <SwatchGrid
        label="Colourway"
        value={options.color}
        onChange={(value) => setOption('color', value)}
        options={GARMENT_COLORS}
      />

      <SwatchGrid
        label="Accent trim"
        hint="Cuffs, hem, collar ribbing and laces."
        value={options.accentColor}
        onChange={(value) => setOption('accentColor', value)}
        options={GARMENT_COLORS}
      />

      <SegmentedControl
        label="Size"
        hint={sizeHint(options.size)}
        value={options.size}
        onChange={(value) => setOption('size', value)}
        options={YOUTH_SIZES.map((s) => ({
          value: s.id,
          label: s.name.replace('Youth ', ''),
          title: `${s.name}, ${priceDetail(s.priceModifier)}`,
        }))}
      />
    </InspectorSection>

    <InspectorSection title="Print">
      <TileGrid
        label="Placement"
        options={PLACEMENTS.map((p) => ({
          value: p.id,
          name: p.name.replace(/^(Left|Center|Hero) /, ''),
          detail: priceDetail(p.priceModifier),
          art: (
            <GarmentThumb
              options={options}
              patch={{ placement: p.id }}
              zone={p.id}
            />
          ),
        }))}
        value={options.placement}
        onChange={(placement) => setOption('placement', placement)}
        columns={3}
      />
      <TileGrid
        label="Finish"
        options={FINISHES.map((f) => ({
          value: f.id,
          name: f.name.replace(/^Flat | Print$| Stitch$/g, ''),
          detail: priceDetail(f.priceModifier),
          art: <FinishArt id={f.id} />,
        }))}
        value={options.finish}
        onChange={(finish) => setOption('finish', finish)}
        columns={4}
      />
    </InspectorSection>
  </>
);

ApparelPanel.propTypes = {
  options: PropTypes.object.isRequired,
  setOption: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  cast: PropTypes.array,
  drawSubstrate: PropTypes.func.isRequired,
  openPanel: PropTypes.func.isRequired,
  editMember: PropTypes.func.isRequired,
  placeOnPage: PropTypes.func.isRequired,
  applyIdea: PropTypes.func.isRequired,
};
