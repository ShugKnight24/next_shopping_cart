import PropTypes from 'prop-types';
import { TileGrid } from '../cast/CastArt';
import { SCENE_ENVIRONMENTS, TIME_OF_DAY_OPTIONS } from '../sceneEnvironments';
import {
  CastOnDesign,
  Chip,
  IdeaPicker,
  priceDetail,
  SceneThumb,
} from '../workbench/DesignPanel';
import {
  POSTER_ART_STYLES,
  POSTER_FRAMES,
  POSTER_MATS,
  POSTER_PAPERS,
  POSTER_SIZES,
} from '../workbench/products';
import { SegmentedControl } from '../workbench/WorkbenchFields';
import { InspectorSection } from '../workbench/WorkbenchShell';
import styles from './PosterPanel.module.css';

/**
 * The poster's settings, shown when nothing is selected, in the same order
 * as the book's: the idea, the backdrop, who is in it, then the print
 * itself, every choice a picture.
 */

const MAT_FILL = {
  none: '#ffffff',
  white: '#fbfbf8',
  offwhite: '#f3ecdc',
  black: '#1b1c20',
};

const styleCss = (id) =>
  (POSTER_ART_STYLES.find((s) => s.id === id) ?? POSTER_ART_STYLES[0]).css;

/** A framed print in miniature: moulding, mount, the art window. */
const FrameArt = ({ frame, mat, art }) => (
  <span
    className={styles.frame}
    style={{
      '--frame': frame ?? 'transparent',
      '--mat': MAT_FILL[mat] ?? MAT_FILL.none,
      '--art': art,
      '--mat-gap': mat === 'none' ? '2px' : '6px',
    }}
  >
    <span className={styles.mount}>
      <span className={styles.window} />
    </span>
  </span>
);

FrameArt.propTypes = {
  frame: PropTypes.string,
  mat: PropTypes.string.isRequired,
  art: PropTypes.string.isRequired,
};

/** Each size drawn to scale against the largest. */
const SizeArt = ({ inches, landscape }) => {
  const [w, h] = landscape ? [inches[1], inches[0]] : inches;
  return (
    <span className={styles.sizeBox}>
      <span
        className={styles.size}
        style={{ width: `${(w / 36) * 100}%`, height: `${(h / 36) * 100}%` }}
      />
    </span>
  );
};

SizeArt.propTypes = {
  inches: PropTypes.arrayOf(PropTypes.number).isRequired,
  landscape: PropTypes.bool,
};

const PaperArt = ({ id }) => (
  <span className={`${styles.paper} ${styles[`paper_${id}`] ?? ''}`} />
);

PaperArt.propTypes = { id: PropTypes.string.isRequired };

export const PosterPanel = ({
  options,
  setOption,
  setOptions,
  workbench,
  artboard,
  cast,
  drawSubstrate,
  openPanel,
  editMember,
  placeOnPage,
  applyIdea,
}) => {
  const art = options.sceneId
    ? 'linear-gradient(160deg, #7cc4f5, #b8e3a1)'
    : styleCss(options.artStyle);
  const frameColor = (id) => POSTER_FRAMES.find((f) => f.id === id)?.color;

  return (
    <>
      <IdeaPicker
        mode="poster"
        title="Poster idea"
        note="Pick an idea and your cast poses for it. Then move, swap or restyle anything."
        artboard={artboard}
        options={options}
        cast={cast}
        drawSubstrate={drawSubstrate}
        onApply={applyIdea}
      />

      <InspectorSection title="Backdrop">
        <TileGrid
          label="Printed colour"
          options={POSTER_ART_STYLES.map((s) => ({
            value: s.id,
            name: s.name,
            art: <Chip fill={s.css} />,
          }))}
          value={options.sceneId ? null : options.artStyle}
          onChange={(artStyle) =>
            setOptions((c) => ({ ...c, artStyle, sceneId: null }))
          }
          columns={3}
        />
        <TileGrid
          label="Illustrated scene"
          options={SCENE_ENVIRONMENTS.map((s) => ({
            value: s.id,
            name: s.name.split(' & ')[0],
            art: <SceneThumb sceneId={s.id} timeOfDay={options.timeOfDay} />,
          }))}
          value={options.sceneId}
          onChange={(sceneId) => setOption('sceneId', sceneId)}
          columns={2}
          shape="wide"
        />
        {options.sceneId && (
          <SegmentedControl
            label="Time of day"
            options={TIME_OF_DAY_OPTIONS.map((t) => ({
              value: t.id,
              label: t.label.split(' ')[0],
            }))}
            value={options.timeOfDay}
            onChange={(timeOfDay) => setOption('timeOfDay', timeOfDay)}
          />
        )}
      </InspectorSection>

      <CastOnDesign
        title="On your poster"
        cast={cast}
        workbench={workbench}
        onPlaceMember={placeOnPage}
        onEditMember={editMember}
        openPanel={openPanel}
      />

      <InspectorSection title="Print">
        <TileGrid
          label="Size"
          options={POSTER_SIZES.map((s) => ({
            value: s.id,
            name: s.name.replace(/"/g, ''),
            detail: `$${s.price}`,
            art: (
              <SizeArt
                inches={s.inches}
                landscape={options.orientation === 'landscape'}
              />
            ),
          }))}
          value={options.size}
          onChange={(size) => setOption('size', size)}
          columns={3}
        />
        <SegmentedControl
          label="Orientation"
          value={options.orientation}
          onChange={(value) => setOption('orientation', value)}
          options={[
            { value: 'portrait', label: 'Portrait' },
            { value: 'landscape', label: 'Landscape' },
          ]}
        />
        <TileGrid
          label="Frame"
          options={POSTER_FRAMES.map((f) => ({
            value: f.id,
            name: f.name.replace(
              /^(Gallery|Solid|Vintage|Stretched|Pearl) /,
              ''
            ),
            detail: priceDetail(f.priceModifier),
            art: <FrameArt frame={f.color} mat={options.mat} art={art} />,
          }))}
          value={options.frame}
          onChange={(frame) => setOption('frame', frame)}
          columns={3}
          shape="tall"
        />
        <TileGrid
          label="Mount"
          options={POSTER_MATS.map((m) => ({
            value: m.id,
            name: m.name.replace(
              /^(Gallery|Solid|Vintage|Stretched|Pearl) /,
              ''
            ),
            detail: priceDetail(m.priceModifier),
            art: (
              <FrameArt
                frame={frameColor(options.frame)}
                mat={m.id}
                art={art}
              />
            ),
          }))}
          value={options.mat}
          onChange={(mat) => setOption('mat', mat)}
          columns={4}
          shape="tall"
        />
        <TileGrid
          label="Paper"
          options={POSTER_PAPERS.map((p) => ({
            value: p.id,
            name: p.name.replace(
              /^(Gallery|Solid|Vintage|Stretched|Pearl) /,
              ''
            ),
            detail: priceDetail(p.priceModifier),
            art: <PaperArt id={p.id} />,
          }))}
          value={options.paper}
          onChange={(paper) => setOption('paper', paper)}
          columns={3}
        />
      </InspectorSection>
    </>
  );
};

PosterPanel.propTypes = {
  options: PropTypes.object.isRequired,
  setOption: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  cast: PropTypes.array,
  drawSubstrate: PropTypes.func.isRequired,
  openPanel: PropTypes.func.isRequired,
  editMember: PropTypes.func.isRequired,
  placeOnPage: PropTypes.func.isRequired,
  applyIdea: PropTypes.func.isRequired,
};
