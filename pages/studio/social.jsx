import Head from 'next/head';
import { starterCast } from '../../Components/Studio/cast/castModel';
import { SCENE_ENVIRONMENTS } from '../../Components/Studio/sceneEnvironments';
import {
  BACKDROPS,
  drawSocialSubstrate,
  formatById,
  SOCIAL_FORMATS,
  themeById,
} from '../../Components/Studio/social/socialArt';
import { SocialPanel } from '../../Components/Studio/social/SocialPanel';
import {
  buildStarter,
  relayout,
  stageOf,
  STARTERS,
} from '../../Components/Studio/starters/starters';
import { PRODUCTS } from '../../Components/Studio/workbench/products';
import { VariantStrip } from '../../Components/Studio/workbench/VariantStrip';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';
import { SITE_URL } from '../../utils/site';

const summarize = (options, layers) => ({
  Format: formatById(options.format).name,
  Colours: themeById(options.theme).name,
  Backdrop: options.sceneId
    ? (SCENE_ENVIRONMENTS.find((s) => s.id === options.sceneId)?.name ??
      'Illustrated scene')
    : (BACKDROPS.find((b) => b.id === options.backdrop)?.name ?? 'Plain'),
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

/** The look undoes with the idea that chose it (and a theme with its retint). */
const SOCIAL_DOC_KEYS = ['theme', 'backdrop', 'sceneId', 'timeOfDay'];

/**
 * A new post opens finished — a store product in the spotlight — so every
 * control in reach visibly changes something.
 */
const cast = starterCast();
const IDEA = STARTERS.social[0];
const starter = buildStarter('social', IDEA, {
  artboard: PRODUCTS.social.artboard(PRODUCTS.social.defaults),
  options: PRODUCTS.social.defaults,
  cast,
});

const INITIAL_OPTIONS = {
  ...PRODUCTS.social.defaults,
  ...starter.options,
  cast: starter.cast,
  idea: IDEA.id,
};

const stageFor = (artboard, options) => {
  const stage = stageOf('social', artboard, options);
  return {
    x: (stage.x0 + stage.x1) / 2,
    feet: stage.feet,
    adultHeight: stage.adultHeight,
  };
};

const FORMAT_VARIANTS = SOCIAL_FORMATS.map((f) => ({
  id: f.id,
  name: f.name,
  options: { format: f.id },
}));

const fitFormat = (layers, from, to, options) =>
  relayout(layers, from, to, 'social', options);

const stage = (props) => (
  <VariantStrip
    {...props}
    label="Formats"
    variants={FORMAT_VARIANTS}
    artboardFor={PRODUCTS.social.artboard}
    fitLayers={fitFormat}
    isActive={(v, options) => v.id === options.format}
  />
);

const documentSection = (props) => (
  <SocialPanel {...props} drawSubstrate={drawSocialSubstrate} />
);

export default function SocialWorkbenchPage() {
  return (
    <>
      <Head>
        <title>Social Post Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design posts, stories, pins and fliers starring your own characters and products from the store, then download them at full size."
        />
        <link rel="canonical" href={`${SITE_URL}/studio/social`} />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.social}
        templateMode="social"
        drawSubstrate={drawSocialSubstrate}
        documentSection={documentSection}
        summarize={summarize}
        initialOptions={INITIAL_OPTIONS}
        initialLayers={starter.layers}
        castEnabled
        docKeys={SOCIAL_DOC_KEYS}
        stageFor={stageFor}
        stage={stage}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
SocialWorkbenchPage.fullBleed = true;
