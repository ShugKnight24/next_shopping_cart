import Head from 'next/head';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { starterCast } from '../../Components/Studio/cast/castModel';
import { drawPosterSubstrate } from '../../Components/Studio/drawSubstrate';
import { PosterPanel } from '../../Components/Studio/poster/PosterPanel';
import { SCENE_ENVIRONMENTS } from '../../Components/Studio/sceneEnvironments';
import {
  buildStarter,
  stageOf,
  STARTERS,
} from '../../Components/Studio/starters/starters';
import {
  POSTER_ART_STYLES,
  POSTER_FRAMES,
  POSTER_MATS,
  POSTER_PAPERS,
  POSTER_SIZES,
  PRODUCTS,
} from '../../Components/Studio/workbench/products';
import { VariantStrip } from '../../Components/Studio/workbench/VariantStrip';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';

const summarize = (options, layers) => ({
  Size: POSTER_SIZES.find((s) => s.id === options.size)?.name ?? options.size,
  Orientation: options.orientation === 'landscape' ? 'Landscape' : 'Portrait',
  Backdrop: options.sceneId
    ? (SCENE_ENVIRONMENTS.find((s) => s.id === options.sceneId)?.name ??
      'Illustrated scene')
    : (POSTER_ART_STYLES.find((s) => s.id === options.artStyle)?.name ??
      'Printed colour'),
  Frame: POSTER_FRAMES.find((f) => f.id === options.frame)?.name ?? 'Unframed',
  Paper: POSTER_PAPERS.find((p) => p.id === options.paper)?.name ?? '—',
  Mount: POSTER_MATS.find((m) => m.id === options.mat)?.name ?? 'No mount',
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

/** The backdrop undoes with the idea that chose it. */
const POSTER_DOC_KEYS = ['artStyle', 'sceneId', 'timeOfDay'];

/**
 * A new poster opens finished — the family portrait, acted out by the
 * starter cast — so every control in reach visibly changes something.
 */
const cast = starterCast();
const IDEA = STARTERS.poster[0];
const starter = buildStarter('poster', IDEA, {
  artboard: PRODUCTS.poster.artboard(PRODUCTS.poster.defaults),
  options: PRODUCTS.poster.defaults,
  cast,
});

const INITIAL_OPTIONS = {
  ...PRODUCTS.poster.defaults,
  ...starter.options,
  cast: starter.cast,
  idea: IDEA.id,
};

/** New people and scenery land in the art window. */
const stageFor = (artboard, options) => {
  const stage = stageOf('poster', artboard, options);
  return {
    x: (stage.x0 + stage.x1) / 2,
    feet: stage.feet,
    adultHeight: stage.adultHeight,
  };
};

const FRAME_VARIANTS = POSTER_FRAMES.map((f) => ({
  id: f.id,
  name: f.name,
  options: { frame: f.id },
}));

const stage = (props) => (
  <VariantStrip
    {...props}
    label="Frames"
    variants={FRAME_VARIANTS}
    isActive={(v, options) => v.id === options.frame}
  />
);

const DocumentSection = (props) => (
  <PosterPanel {...props} drawSubstrate={drawPosterSubstrate} />
);

DocumentSection.propTypes = { options: PropTypes.object };

export default function PosterWorkbenchPage() {
  const documentSection = useCallback(
    (props) => <DocumentSection {...props} />,
    []
  );

  return (
    <>
      <Head>
        <title>Poster Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design a museum-grade framed poster starring your family: pick an idea, a backdrop and a frame, then move anything."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.poster}
        templateMode="poster"
        drawSubstrate={drawPosterSubstrate}
        documentSection={documentSection}
        summarize={summarize}
        initialOptions={INITIAL_OPTIONS}
        initialLayers={starter.layers}
        castEnabled
        docKeys={POSTER_DOC_KEYS}
        stageFor={stageFor}
        stage={stage}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
PosterWorkbenchPage.fullBleed = true;
