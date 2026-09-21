import Head from 'next/head';
import { drawPosterSubstrate } from '../../Components/Studio/drawSubstrate';
import {
  POSTER_FRAMES,
  POSTER_MATS,
  POSTER_PAPERS,
  POSTER_SIZES,
  PRODUCTS,
} from '../../Components/Studio/workbench/products';
import {
  SegmentedControl,
  SelectField,
} from '../../Components/Studio/workbench/WorkbenchFields';
import { WorkbenchRoute } from '../../Components/Studio/workbench/WorkbenchRoute';
import { InspectorSection } from '../../Components/Studio/workbench/WorkbenchShell';

const summarize = (options, layers) => ({
  Size: POSTER_SIZES.find((s) => s.id === options.size)?.name ?? options.size,
  Orientation: options.orientation === 'landscape' ? 'Landscape' : 'Portrait',
  Frame: POSTER_FRAMES.find((f) => f.id === options.frame)?.name ?? 'Unframed',
  Paper: POSTER_PAPERS.find((p) => p.id === options.paper)?.name ?? '—',
  Mount: POSTER_MATS.find((m) => m.id === options.mat)?.name ?? 'No mount',
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

const DocumentSection = ({ options, setOption }) => (
  <InspectorSection title="Print">
    <SelectField
      label="Size"
      value={options.size}
      onChange={(value) => setOption('size', value)}
      options={POSTER_SIZES.map((s) => ({
        value: s.id,
        label: `${s.name} — ${s.sub}`,
      }))}
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

    <SelectField
      label="Frame"
      value={options.frame}
      onChange={(value) => setOption('frame', value)}
      options={POSTER_FRAMES.map((f) => ({
        value: f.id,
        label: f.priceModifier ? `${f.name} (+$${f.priceModifier})` : f.name,
      }))}
    />

    <SelectField
      label="Paper stock"
      value={options.paper}
      onChange={(value) => setOption('paper', value)}
      options={POSTER_PAPERS.map((p) => ({
        value: p.id,
        label: p.priceModifier ? `${p.name} (+$${p.priceModifier})` : p.name,
      }))}
    />

    <SelectField
      label="Mount"
      value={options.mat}
      onChange={(value) => setOption('mat', value)}
      options={POSTER_MATS.map((m) => ({
        value: m.id,
        label: m.priceModifier ? `${m.name} (+$${m.priceModifier})` : m.name,
      }))}
    />
  </InspectorSection>
);

export default function PosterWorkbenchPage() {
  return (
    <>
      <Head>
        <title>Poster Designer | Cart Commerce Studio</title>
        <meta
          name="description"
          content="Design a museum-grade framed art poster with templates, styles, layers and live print proofing."
        />
      </Head>

      <WorkbenchRoute
        product={PRODUCTS.poster}
        templateMode="poster"
        drawSubstrate={drawPosterSubstrate}
        documentSection={(props) => <DocumentSection {...props} />}
        summarize={summarize}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
PosterWorkbenchPage.fullBleed = true;
