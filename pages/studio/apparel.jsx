import Head from 'next/head';
import {
  ApparelPanel,
  garmentName,
} from '../../Components/Studio/apparel/ApparelPanel';
import { starterCast } from '../../Components/Studio/cast/castModel';
import { drawApparelSubstrate } from '../../Components/Studio/drawSubstrate';
import {
  buildStarter,
  stageOf,
  STARTERS,
} from '../../Components/Studio/starters/starters';
import {
  FINISHES,
  GARMENT_COLORS,
  GARMENTS,
  PLACEMENTS,
  PRODUCTS,
} from '../../Components/Studio/workbench/products';
import { VariantStrip } from '../../Components/Studio/workbench/VariantStrip';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';

const nameFor = (table, id, fallback = '—') =>
  table.find((entry) => entry.id === id)?.name ?? fallback;

const summarize = (options, layers) => ({
  Garment: nameFor(GARMENTS, options.garment),
  Size: options.size,
  Colourway:
    GARMENT_COLORS.find((c) => c.value === options.color)?.name ??
    options.color,
  'Accent trim':
    GARMENT_COLORS.find((c) => c.value === options.accentColor)?.name ??
    options.accentColor,
  Placement: nameFor(PLACEMENTS, options.placement),
  Finish: nameFor(FINISHES, options.finish),
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

/**
 * A new garment opens finished — the starter kid as the superstar on the
 * chest — so every control in reach visibly changes something.
 */
const cast = starterCast();
const IDEA = STARTERS.apparel[0];
const starter = buildStarter('apparel', IDEA, {
  artboard: PRODUCTS.apparel.artboard(PRODUCTS.apparel.defaults),
  options: PRODUCTS.apparel.defaults,
  cast,
});

const INITIAL_OPTIONS = {
  ...PRODUCTS.apparel.defaults,
  ...starter.options,
  cast: starter.cast,
  idea: IDEA.id,
};

/** New people and scenery land in the chest print panel. */
const stageFor = (artboard, options) => {
  const stage = stageOf('apparel', artboard, options);
  return {
    x: (stage.x0 + stage.x1) / 2,
    feet: stage.feet,
    adultHeight: stage.adultHeight,
  };
};

const GARMENT_VARIANTS = GARMENTS.map((g) => ({
  id: g.id,
  name: garmentName(g.id),
  options: { garment: g.id },
}));

const stage = (props) => (
  <VariantStrip
    {...props}
    label="Garments"
    variants={GARMENT_VARIANTS}
    isActive={(v, options) => v.id === options.garment}
  />
);

const documentSection = (props) => (
  <ApparelPanel {...props} drawSubstrate={drawApparelSubstrate} />
);

export default function ApparelWorkbenchPage() {
  return (
    <>
      <Head>
        <title>Apparel Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design custom kids' hoodies, tees, varsity jackets and canvas kicks starring your own characters, with live print proofing."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.apparel}
        templateMode="apparel"
        drawSubstrate={drawApparelSubstrate}
        documentSection={documentSection}
        summarize={summarize}
        initialOptions={INITIAL_OPTIONS}
        initialLayers={starter.layers}
        castEnabled
        stageFor={stageFor}
        stage={stage}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
ApparelWorkbenchPage.fullBleed = true;
