import Head from 'next/head';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import {
  activeSpreadOf,
  bookStage,
  spreadConfig,
  starterBook,
} from '../../Components/Studio/book/bookPages';
import { BookPanel } from '../../Components/Studio/book/BookPanel';
import { PageStrip } from '../../Components/Studio/book/PageStrip';
import {
  memberName,
  starterCast,
} from '../../Components/Studio/cast/castModel';
import { describePerson } from '../../Components/Studio/cast/castRig';
import { drawBookSubstrate } from '../../Components/Studio/drawSubstrate';
import { SCENE_ENVIRONMENTS } from '../../Components/Studio/sceneEnvironments';
import {
  BOOK_COVERS,
  BOOK_FORMATS,
  BOOK_PAPERS,
  PRODUCTS,
} from '../../Components/Studio/workbench/products';
import { SelectField } from '../../Components/Studio/workbench/WorkbenchFields';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';
import { InspectorSection } from '../../Components/Studio/workbench/WorkbenchShell';

/** Scene tables label entries `label`; product tables use `name`. */
const nameFor = (table, id, fallback = '—') => {
  const entry = table.find((item) => item.id === id);
  return entry?.name ?? entry?.label ?? fallback;
};

/**
 * The order sheet: the binding, then everyone in the story and every page's
 * scene, because a storybook that arrives without its cast is not the book
 * that was ordered.
 */
const summarize = (options, layers) => {
  const cast = options.cast ?? [];
  const stories = (options.spreads ?? []).filter((s) => s.kind === 'story');
  const people = Object.fromEntries(
    cast.map((m, i) => [
      `Cast ${i + 1}`,
      `${memberName(m)} (${m.kind === 'pet' ? 'pet' : describePerson(m)})`,
    ])
  );
  return {
    Format: nameFor(BOOK_FORMATS, options.format),
    Cover: nameFor(BOOK_COVERS, options.cover),
    Paper: nameFor(BOOK_PAPERS, options.paper),
    Pages: `${stories.length * 2} story pages`,
    Scenes: stories
      .map((s) => nameFor(SCENE_ENVIRONMENTS, s.sceneId, 'Default'))
      .join(', '),
    ...people,
    Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
  };
};

/**
 * A new book opens on its first story spread with the starter cast already
 * acting out a moment, so every control in reach visibly changes something.
 */
const cast = starterCast();
const {
  spreads,
  activeSpread,
  layers: STARTER_LAYERS,
} = starterBook({
  cast,
  artboard: PRODUCTS.book.artboard(PRODUCTS.book.defaults),
});

const INITIAL_OPTIONS = {
  ...PRODUCTS.book.defaults,
  cast,
  spreads,
  activeSpread,
};

const DocumentSection = ({
  options,
  setOption,
  setOptions,
  workbench,
  artboard,
  openPanel,
  editMember,
  placeOnPage,
  drawSubstrate,
}) => (
  <>
    <BookPanel
      options={options}
      setOptions={setOptions}
      workbench={workbench}
      artboard={artboard}
      drawSubstrate={drawSubstrate}
      openPanel={openPanel}
      onEditMember={editMember}
      onPlaceMember={placeOnPage}
    />

    <InspectorSection title="Book">
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
  </>
);

DocumentSection.propTypes = {
  options: PropTypes.object.isRequired,
  setOption: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.object.isRequired,
  openPanel: PropTypes.func.isRequired,
  editMember: PropTypes.func.isRequired,
  placeOnPage: PropTypes.func.isRequired,
  drawSubstrate: PropTypes.func.isRequired,
};

/** The book draws the spread on screen; the cast is layers on top of it. */
const drawSubstrate = (ctx, board) =>
  drawBookSubstrate(ctx, {
    ...board,
    config: spreadConfig(board.config ?? {}),
  });

/** The pages undo with their art: deleting a spread and undoing brings both back. */
// Which page is open is not history: undo never turns the page.
const BOOK_DOC_KEYS = ['spreads'];

/** Each spread is its own page of layers; unpaged layers belong to the first story. */
const pageScope = (options) => {
  const spreads = options.spreads ?? [];
  if (!spreads.length) return null;
  return {
    id: activeSpreadOf(options)?.id,
    fallback: spreads.find((s) => s.kind === 'story')?.id ?? null,
  };
};

const stageFor = (artboard, options) => {
  const spread = activeSpreadOf(options);
  const stage = bookStage(artboard, spread?.spreadLayout ?? 'panoramic');
  return {
    x: (stage.x0 + stage.x1) / 2,
    feet: stage.feet,
    adultHeight: stage.adultHeight,
  };
};

const stage = (props) => <PageStrip {...props} />;

export default function BookWorkbenchPage() {
  const documentSection = useCallback(
    (props) => <DocumentSection {...props} drawSubstrate={drawSubstrate} />,
    []
  );

  return (
    <>
      <Head>
        <title>Storybook Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design a personalized hardcover storybook: make your cast, pick story moments, move every character and piece of scenery, and proof every page."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.book}
        templateMode="book"
        drawSubstrate={drawSubstrate}
        documentSection={documentSection}
        summarize={summarize}
        initialOptions={INITIAL_OPTIONS}
        initialLayers={STARTER_LAYERS}
        castEnabled
        docKeys={BOOK_DOC_KEYS}
        pageScope={pageScope}
        stageFor={stageFor}
        stage={stage}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
BookWorkbenchPage.fullBleed = true;
