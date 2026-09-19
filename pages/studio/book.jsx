import Head from 'next/head';
import { drawBookSubstrate } from '../../Components/Studio/drawSubstrate';
import {
  SCENE_ENVIRONMENTS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_EFFECT_OPTIONS,
} from '../../Components/Studio/sceneEnvironments';
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

const summarize = (options, layers) => ({
  Format: nameFor(BOOK_FORMATS, options.format),
  Cover: nameFor(BOOK_COVERS, options.cover),
  Paper: nameFor(BOOK_PAPERS, options.paper),
  Scene: nameFor(SCENE_ENVIRONMENTS, options.sceneId, 'Default'),
  'Time of day': nameFor(TIME_OF_DAY_OPTIONS, options.timeOfDay, 'Day'),
  Hero: options.childName || 'Unnamed',
  Elements: `${layers.length} design ${layers.length === 1 ? 'element' : 'elements'}`,
});

const DocumentSection = ({ options, setOption }) => (
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
  </>
);

export default function BookWorkbenchPage() {
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
        drawSubstrate={drawBookSubstrate}
        documentSection={(props) => <DocumentSection {...props} />}
        summarize={summarize}
      />
    </>
  );
}

// The workbench is a full-viewport app, not a page inside the storefront shell.
BookWorkbenchPage.fullBleed = true;
