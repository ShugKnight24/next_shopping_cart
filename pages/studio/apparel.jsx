import Head from 'next/head';
import { drawApparelSubstrate } from '../../Components/Studio/drawSubstrate';
import {
  FINISHES,
  GARMENTS,
  GARMENT_COLORS,
  PLACEMENTS,
  PRODUCTS,
  YOUTH_SIZES,
} from '../../Components/Studio/workbench/products';
import {
  SelectField,
  SwatchGrid,
} from '../../Components/Studio/workbench/WorkbenchFields';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';
import { InspectorSection } from '../../Components/Studio/workbench/WorkbenchShell';

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

const DocumentSection = ({ options, setOption }) => (
  <InspectorSection title="Garment">
    <SelectField
      label="Style"
      value={options.garment}
      onChange={(value) => setOption('garment', value)}
      options={GARMENTS.map((g) => ({
        value: g.id,
        label: `${g.name} — $${g.price}`,
      }))}
    />

    <SelectField
      label="Size"
      value={options.size}
      onChange={(value) => setOption('size', value)}
      options={YOUTH_SIZES.map((s) => ({
        value: s.id,
        label: s.priceModifier
          ? `${s.name} (${s.sub}) +$${s.priceModifier.toFixed(2)}`
          : `${s.name} (${s.sub})`,
      }))}
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

    {/* A segmented control cannot hold three long placement names in a 320px
        inspector without overlapping its own label. */}
    <SelectField
      label="Placement"
      value={options.placement}
      onChange={(value) => setOption('placement', value)}
      options={PLACEMENTS.map((p) => ({
        value: p.id,
        label: p.priceModifier
          ? `${p.name} — ${p.sub} (+$${p.priceModifier})`
          : `${p.name} — ${p.sub}`,
      }))}
    />

    <SelectField
      label="Finish"
      value={options.finish}
      onChange={(value) => setOption('finish', value)}
      options={FINISHES.map((f) => ({
        value: f.id,
        label: f.priceModifier ? `${f.name} (+$${f.priceModifier})` : f.name,
      }))}
    />
  </InspectorSection>
);

export default function ApparelWorkbenchPage() {
  return (
    <>
      <Head>
        <title>Apparel Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design custom kids' hoodies, tees, varsity jackets and canvas kicks with templates, layers and live embroidery proofing."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.apparel}
        templateMode="apparel"
        drawSubstrate={drawApparelSubstrate}
        documentSection={(props) => <DocumentSection {...props} />}
        summarize={summarize}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
ApparelWorkbenchPage.fullBleed = true;
