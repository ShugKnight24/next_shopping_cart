import PropTypes from 'prop-types';
import { TileGrid } from '../cast/CastArt';
import { sameCastArt } from '../cast/castModel';
import { useStable } from '../core/useStable';
import {
  SCENE_ENVIRONMENTS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_EFFECT_OPTIONS,
} from '../sceneEnvironments';
import {
  CastOnDesign,
  LivePreview,
  SceneThumb,
  panelStyles as styles,
} from '../workbench/DesignPanel';
import { paintLayers } from '../workbench/renderLayers';
import { SegmentedControl, SelectField } from '../workbench/WorkbenchFields';
import { InspectorSection, WorkbenchButton } from '../workbench/WorkbenchShell';
import {
  activeSpreadOf,
  createStorySpread,
  momentById,
  momentLayers,
  MOMENTS,
  SPREAD_LAYOUTS,
} from './bookPages';

/**
 * The book's page settings, shown when nothing on the page is selected: the
 * story moment, the scene, the layout, and the page itself. Everything is a
 * picture where a picture says more than a name.
 */

/** A moment acted out by this book's own cast, on its own scene. */
const MomentThumb = ({ moment, cast, artboard, drawSubstrate, options }) => (
  <LivePreview
    width={artboard.width}
    height={artboard.height}
    deps={[moment.id, cast, artboard.width, artboard.height]}
    draw={(ctx) => {
      const spread = createStorySpread(moment, { id: `preview-${moment.id}` });
      drawSubstrate(ctx, {
        ...artboard,
        config: { ...options, spreads: [spread], activeSpread: spread.id },
      });
      paintLayers(ctx, {
        layers: momentLayers(moment, { cast, artboard, spread }).filter(
          (l) => l.type !== 'text'
        ),
        artboard,
        cast,
      });
    }}
  />
);

MomentThumb.propTypes = {
  moment: PropTypes.object.isRequired,
  cast: PropTypes.array.isRequired,
  artboard: PropTypes.object.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
};

export const BookPanel = ({
  options,
  setOptions,
  workbench,
  artboard,
  drawSubstrate,
  openPanel,
  onEditMember,
  onPlaceMember,
}) => {
  const spreads = options.spreads ?? [];
  const spread = activeSpreadOf(options);
  const cast = options.cast ?? [];
  // Typing a name must not repaint every moment picture.
  const castArt = useStable(cast, sameCastArt);

  const withSpread = (list, patch) =>
    list.map((s) => (s.id === spread.id ? { ...s, ...patch } : s));

  const patchSpread = (patch) =>
    workbench.setDoc((doc) => ({ spreads: withSpread(doc.spreads, patch) }));

  /**
   * Act out a moment here, as one undo step: the scene changes and the
   * moment's cast, scenery and words replace the last moment's. Anything the
   * shopper added themselves stays.
   */
  const actOut = (id) => {
    const moment = momentById(id);
    const patch = {
      moment: id,
      sceneId: moment.sceneId,
      timeOfDay: moment.timeOfDay,
      weatherEffect: moment.weatherEffect,
    };
    const next = { ...spread, ...patch };
    const firstStory = spreads.find((s) => s.kind === 'story')?.id;
    workbench.select(null);
    workbench.transact(({ layers, doc }) => ({
      doc: { spreads: withSpread(doc.spreads, patch) },
      layers: [
        ...layers.filter(
          (l) => !((l.page ?? firstStory) === spread.id && l.fromMoment)
        ),
        ...momentLayers(moment, { cast, artboard, spread: next }),
      ],
    }));
  };

  const storyIds = spreads.filter((s) => s.kind === 'story').map((s) => s.id);
  const storyIndex = spread ? storyIds.indexOf(spread.id) : -1;

  const move = (dir) =>
    workbench.setDoc((doc) => {
      const list = doc.spreads.slice();
      const from = list.findIndex((s) => s.id === spread.id);
      const to = from + dir;
      if (to < 0 || to >= list.length || list[to].kind !== 'story') return {};
      [list[from], list[to]] = [list[to], list[from]];
      return { spreads: list };
    });

  /** Copy this spread and its art, as one undo step, and open the copy. */
  const duplicate = () => {
    const copy = {
      ...spread,
      id: `${spread.id}-copy-${Date.now().toString(36)}`,
    };
    const layers = workbench.layers.map((l, i) => ({
      ...l,
      id: `${copy.id}-${i}`,
      page: copy.id,
    }));
    workbench.transact(({ layers: all, doc }) => {
      const list = doc.spreads.slice();
      list.splice(list.findIndex((s) => s.id === spread.id) + 1, 0, copy);
      return { doc: { spreads: list }, layers: [...all, ...layers] };
    });
    setOptions((current) => ({ ...current, activeSpread: copy.id }), {
      commit: false,
    });
  };

  /** Delete this spread and its art, as one undo step. */
  const remove = () => {
    const fallback = storyIds[storyIndex - 1] ?? storyIds[storyIndex + 1];
    // Unpaged layers (older drafts) show on the first story spread, so they
    // are its art: deleting that spread deletes them with it. Otherwise they
    // are pinned to it, so they stay put once the spread order changes.
    const firstStory = storyIds[0];
    workbench.select(null);
    workbench.transact(({ layers, doc }) => ({
      doc: { spreads: doc.spreads.filter((s) => s.id !== spread.id) },
      layers: layers
        .filter((l) => (l.page ?? firstStory) !== spread.id)
        .map((l) => (l.page ? l : { ...l, page: firstStory })),
    }));
    setOptions((current) => ({ ...current, activeSpread: fallback }), {
      commit: false,
    });
  };

  return (
    <>
      {spread?.kind === 'story' && (
        <>
          <InspectorSection title="Story moment">
            <p className={styles.note}>
              Pick a moment and your cast acts it out on this page. Then move,
              swap or restyle anything.
            </p>
            <TileGrid
              label="Moments"
              hideLabel
              options={MOMENTS.map((m) => ({
                value: m.id,
                name: m.name,
                art: (
                  <MomentThumb
                    moment={m}
                    cast={castArt}
                    artboard={artboard}
                    drawSubstrate={drawSubstrate}
                    options={options}
                  />
                ),
              }))}
              value={spread.moment}
              onChange={actOut}
              columns={2}
              shape="wide"
            />
          </InspectorSection>

          <InspectorSection title="Scene">
            <TileGrid
              label="Environment"
              options={SCENE_ENVIRONMENTS.map((s) => ({
                value: s.id,
                name: s.name.split(' & ')[0],
                art: <SceneThumb sceneId={s.id} timeOfDay={spread.timeOfDay} />,
              }))}
              value={spread.sceneId}
              onChange={(sceneId) => patchSpread({ sceneId })}
              columns={2}
              shape="wide"
            />
            <SegmentedControl
              label="Time of day"
              options={TIME_OF_DAY_OPTIONS.map((t) => ({
                value: t.id,
                label: t.label.split(' ')[0],
              }))}
              value={spread.timeOfDay}
              onChange={(timeOfDay) => patchSpread({ timeOfDay })}
            />
            <SelectField
              label="Weather"
              value={spread.weatherEffect}
              onChange={(weatherEffect) => patchSpread({ weatherEffect })}
              options={WEATHER_EFFECT_OPTIONS.map((w) => ({
                value: w.id,
                label: w.label,
              }))}
            />
            <SegmentedControl
              label="Layout"
              options={SPREAD_LAYOUTS}
              value={spread.spreadLayout}
              onChange={(spreadLayout) => patchSpread({ spreadLayout })}
            />
          </InspectorSection>
        </>
      )}

      {spread && spread.kind !== 'story' && (
        <InspectorSection
          title={spread.kind === 'cover' ? 'Cover' : 'Dedication'}
        >
          <p className={styles.note}>
            {spread.kind === 'cover'
              ? 'Add a title with Text, then put your cast on the cover from the list below.'
              : 'A few words before the story begins. Add them with the Text tool.'}
          </p>
        </InspectorSection>
      )}

      <CastOnDesign
        title="On this page"
        cast={cast}
        workbench={workbench}
        onPlaceMember={onPlaceMember}
        onEditMember={onEditMember}
        openPanel={openPanel}
      />

      {spread?.kind === 'story' && (
        <InspectorSection title="Page">
          <div className={styles.row}>
            <WorkbenchButton
              variant="subtle"
              onClick={() => move(-1)}
              disabled={storyIndex <= 0}
            >
              Move earlier
            </WorkbenchButton>
            <WorkbenchButton
              variant="subtle"
              onClick={() => move(1)}
              disabled={storyIndex >= storyIds.length - 1}
            >
              Move later
            </WorkbenchButton>
            <WorkbenchButton variant="subtle" onClick={duplicate}>
              Duplicate
            </WorkbenchButton>
            <WorkbenchButton
              variant="danger"
              onClick={remove}
              disabled={storyIds.length <= 1}
            >
              Delete page
            </WorkbenchButton>
          </div>
        </InspectorSection>
      )}
    </>
  );
};

BookPanel.propTypes = {
  options: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
  openPanel: PropTypes.func.isRequired,
  onEditMember: PropTypes.func.isRequired,
  onPlaceMember: PropTypes.func.isRequired,
};
