import Head from 'next/head';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import {
  DEFAULT_AVATAR,
  DEFAULT_COMPANION,
  describeCharacter,
  normalizeAvatar,
  normalizeCompanion,
} from '../../Components/Studio/core/characterSchema';
import { drawBookSubstrate } from '../../Components/Studio/drawSubstrate';
import {
  SCENE_ENVIRONMENTS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_EFFECT_OPTIONS,
} from '../../Components/Studio/sceneEnvironments';
import { CharacterPanel } from '../../Components/Studio/workbench/CharacterPanel';
import {
  BOOK_COVERS,
  BOOK_FORMATS,
  BOOK_PAPERS,
  PRODUCTS,
} from '../../Components/Studio/workbench/products';
import {
  SelectField,
  TextField,
} from '../../Components/Studio/workbench/WorkbenchFields';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';
import { InspectorSection } from '../../Components/Studio/workbench/WorkbenchShell';

/** Scene tables label entries `label`; product tables use `name`. */
const nameFor = (table, id, fallback = '—') => {
  const entry = table.find((item) => item.id === id);
  return entry?.name ?? entry?.label ?? fallback;
};

/**
 * The cast is page state rather than a substrate option, so the order sheet is
 * built per render from both. Every character choice has to survive into the
 * cart — that is the whole contract `describeCharacter` exists for.
 */
const summarizeWith = (avatar, companion) => (options, layers) => ({
  Format: nameFor(BOOK_FORMATS, options.format),
  Cover: nameFor(BOOK_COVERS, options.cover),
  Paper: nameFor(BOOK_PAPERS, options.paper),
  Scene: nameFor(SCENE_ENVIRONMENTS, options.sceneId, 'Default'),
  'Time of day': nameFor(TIME_OF_DAY_OPTIONS, options.timeOfDay, 'Day'),
  Hero: options.childName || 'Unnamed',
  ...describeCharacter(avatar, companion),
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

/**
 * The book opens on a chapter spread rather than the cover: the hero and the
 * co-star only stand in the framed illustration stage, so a cover-first default
 * would leave every cast control apparently doing nothing.
 */
const INITIAL_OPTIONS = {
  ...PRODUCTS.book.defaults,
  activePage: 2,
  avatar: { ...DEFAULT_AVATAR },
  companion: { ...DEFAULT_COMPANION },
};

const DocumentSection = ({
  options,
  setOption,
  avatar,
  companion,
  onChangeAvatar,
  onChangeCompanion,
}) => (
  <>
    <InspectorSection title="Book">
      <TextField
        label="Hero name"
        value={options.childName ?? ''}
        onChange={(value) => setOption('childName', value)}
        maxLength={18}
        hint="Printed through the story and on the cover plate."
      />

      <SelectField
        label="Format"
        value={options.format}
        onChange={(value) => setOption('format', value)}
        options={BOOK_FORMATS.map((f) => ({
          value: f.id,
          label: `${f.name} — $${f.price}`,
        }))}
      />

      <SelectField
        label="Cover"
        value={options.cover}
        onChange={(value) => setOption('cover', value)}
        options={BOOK_COVERS.map((c) => ({
          value: c.id,
          label: c.priceModifier ? `${c.name} (+$${c.priceModifier})` : c.name,
        }))}
      />

      <SelectField
        label="Paper"
        value={options.paper}
        onChange={(value) => setOption('paper', value)}
        options={BOOK_PAPERS.map((p) => ({
          value: p.id,
          label: p.priceModifier ? `${p.name} (+$${p.priceModifier})` : p.name,
        }))}
      />
    </InspectorSection>

    <InspectorSection title="Scene">
      <SelectField
        label="Environment"
        value={options.sceneId ?? SCENE_ENVIRONMENTS[0]?.id}
        onChange={(value) => setOption('sceneId', value)}
        options={SCENE_ENVIRONMENTS.map((scene) => ({
          value: scene.id,
          label: scene.name,
        }))}
      />

      <SelectField
        label="Time of day"
        value={options.timeOfDay}
        onChange={(value) => setOption('timeOfDay', value)}
        options={TIME_OF_DAY_OPTIONS.map((t) => ({
          value: t.id,
          label: t.label,
        }))}
      />

      <SelectField
        label="Weather"
        value={options.weatherEffect}
        onChange={(value) => setOption('weatherEffect', value)}
        options={WEATHER_EFFECT_OPTIONS.map((w) => ({
          value: w.id,
          label: w.label,
        }))}
      />
    </InspectorSection>

    <CharacterPanel
      avatar={avatar}
      companion={companion}
      onChangeAvatar={onChangeAvatar}
      onChangeCompanion={onChangeCompanion}
    />
  </>
);

DocumentSection.propTypes = {
  options: PropTypes.object.isRequired,
  setOption: PropTypes.func.isRequired,
  avatar: PropTypes.object.isRequired,
  companion: PropTypes.object.isRequired,
  onChangeAvatar: PropTypes.func.isRequired,
  onChangeCompanion: PropTypes.func.isRequired,
};

/**
 * Normalizing allocates, and the painter runs inside the canvas paint path, so
 * cache per source object. Identity is stable between edits because the cast
 * lives in `options` and only the edited record is replaced.
 */
const normalizedCache = new WeakMap();

const normalizedCast = (avatar, companion) => {
  let entry = normalizedCache.get(avatar);

  if (!entry || entry.companionSource !== companion) {
    entry = {
      companionSource: companion,
      hero: normalizeAvatar(avatar),
      coStar: normalizeCompanion(companion),
    };
    normalizedCache.set(avatar, entry);
  }

  return entry;
};

export default function BookWorkbenchPage() {
  // The cast lives in `options`, not in page state, so it rides along in the
  // design document — a shared link or a saved storybook that loses the child
  // hero has lost the only part that made it theirs.
  const drawSubstrate = useCallback((ctx, board) => {
    const config = board.config ?? {};
    const { hero, coStar } = normalizedCast(
      config.avatar ?? DEFAULT_AVATAR,
      config.companion ?? DEFAULT_COMPANION
    );

    drawBookSubstrate(ctx, { ...board, avatar: hero, companion: coStar });
  }, []);

  const summarize = useCallback((options, layers) => {
    const { hero, coStar } = normalizedCast(
      options.avatar ?? DEFAULT_AVATAR,
      options.companion ?? DEFAULT_COMPANION
    );

    return summarizeWith(hero, coStar)(options, layers);
  }, []);

  const documentSection = useCallback(
    ({ options, setOption, setOptions }) => (
      <DocumentSection
        options={options}
        setOption={setOption}
        setOptions={setOptions}
        avatar={options.avatar ?? DEFAULT_AVATAR}
        companion={options.companion ?? DEFAULT_COMPANION}
        onChangeAvatar={(next) =>
          setOption(
            'avatar',
            typeof next === 'function'
              ? next(options.avatar ?? DEFAULT_AVATAR)
              : next
          )
        }
        onChangeCompanion={(next) =>
          setOption(
            'companion',
            typeof next === 'function'
              ? next(options.companion ?? DEFAULT_COMPANION)
              : next
          )
        }
      />
    ),
    []
  );

  return (
    <>
      <Head>
        <title>Storybook Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design a personalized hardcover storybook with cover templates, scene environments, layers and live print proofing."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.book}
        templateMode="book"
        drawSubstrate={drawSubstrate}
        documentSection={documentSection}
        summarize={summarize}
        initialOptions={INITIAL_OPTIONS}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
BookWorkbenchPage.fullBleed = true;
