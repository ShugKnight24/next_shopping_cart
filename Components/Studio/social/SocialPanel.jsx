import PropTypes from 'prop-types';
import { useState } from 'react';
import { TileGrid } from '../cast/CastArt';
import { SCENE_ENVIRONMENTS, TIME_OF_DAY_OPTIONS } from '../sceneEnvironments';
import { CATALOG } from '../starters/catalog';
import {
  CastOnDesign,
  IdeaPicker,
  LivePreview,
  Note,
  panelStyles,
  SceneThumb,
} from '../workbench/DesignPanel';
import { createLayer } from '../workbench/layerModel';
import { SegmentedControl, TextAreaField } from '../workbench/WorkbenchFields';
import { InspectorSection, WorkbenchButton } from '../workbench/WorkbenchShell';
import {
  BACKDROPS,
  drawSocialSubstrate,
  SOCIAL_FORMATS,
  SOCIAL_THEMES,
  socialPalette,
} from './socialArt';

/**
 * The social post's settings, in the same order as every other product: the
 * idea, the format, the look, what (and who) is in it, and the words that go
 * with it when it is posted.
 */

const ROLES = [
  ['color', 'colorRole'],
  ['fill', 'fillRole'],
];

/**
 * A new theme repaints every word and badge that took its colour from the
 * old one; anything the shopper coloured by hand keeps its colour.
 */
export const retint = (layers, fromTheme, toTheme) => {
  const from = socialPalette(fromTheme);
  const to = socialPalette(toTheme);
  return layers.map((layer) => {
    let next = layer;
    ROLES.forEach(([key, roleKey]) => {
      const role = layer[roleKey];
      if (role && layer[key] === from[role] && to[role] !== from[role])
        next = { ...next, [key]: to[role] };
    });
    return next;
  });
};

const FormatArt = ({ ratio }) => {
  const [w, h] = ratio >= 1 ? [100, 100 / ratio] : [100 * ratio, 100];
  return (
    <span className={panelStyles.formatBox}>
      <span
        className={panelStyles.format}
        style={{ width: `${w * 0.78}%`, height: `${h * 0.78}%` }}
      />
    </span>
  );
};

FormatArt.propTypes = { ratio: PropTypes.number.isRequired };

const ThemeArt = ({ theme }) => (
  <span
    className={panelStyles.theme}
    style={{
      background: `linear-gradient(150deg, ${theme.bg}, ${theme.edge})`,
    }}
  >
    <span style={{ background: theme.accent }} />
  </span>
);

ThemeArt.propTypes = { theme: PropTypes.object.isRequired };

const BackdropThumb = ({ backdrop, theme }) => (
  <LivePreview
    width={120}
    height={120}
    deps={[backdrop, theme]}
    draw={(ctx, w, h) =>
      drawSocialSubstrate(ctx, {
        width: w,
        height: h,
        config: { backdrop, theme },
      })
    }
  />
);

BackdropThumb.propTypes = {
  backdrop: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

const PRODUCT_PREVIEW = 9;

export const SocialPanel = ({
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
  const [allProducts, setAllProducts] = useState(false);
  const [copied, setCopied] = useState(false);
  const pal = socialPalette(options.theme);

  const setTheme = (theme) =>
    workbench.transact(({ layers, doc }) => ({
      doc: { theme },
      layers: retint(layers, doc.theme ?? options.theme, theme),
    }));

  /** A product photo, its name and its price, as one undo step. */
  const feature = (product) => {
    const { width: w, height: h } = artboard;
    const size = Math.min(w, h) * 0.5;
    const layers = [
      createLayer('image', {
        name: product.productName,
        src: product.image,
        fit: 'contain',
        radius: 18,
        productId: product.itemid,
        x: w / 2,
        y: h * 0.5,
        width: size,
        height: size,
      }),
      createLayer('text', {
        name: 'Product name',
        slotRole: 'subtitle',
        text: product.productName,
        x: w / 2,
        y: h * 0.5 + size / 2 + 30,
        width: w * 0.84,
        height: 44,
        fontSize: 22,
        fontFamily: 'serif',
        fontWeight: 700,
        color: pal.text,
        colorRole: 'text',
      }),
      createLayer('text', {
        name: 'Price',
        slotRole: 'badge',
        text: `$${product.price.toLocaleString('en-US')}`,
        x: w / 2,
        y: h * 0.5 + size / 2 + 66,
        width: w * 0.5,
        height: 36,
        fontSize: 22,
        fontFamily: 'sans',
        fontWeight: 800,
        color: pal.accent,
        colorRole: 'accent',
      }),
    ];
    workbench.transact(({ layers: current }) => ({
      layers: [...current, ...layers],
    }));
    workbench.select(layers[0].id);
    if (!options.caption)
      setOption(
        'caption',
        `${product.productName} by ${product.manufacturer}. Shop it now at Cart Commerce.`
      );
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(options.caption ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const products = allProducts ? CATALOG : CATALOG.slice(0, PRODUCT_PREVIEW);

  return (
    <>
      <IdeaPicker
        mode="social"
        title="Post idea"
        note="Pick an idea and your cast and products star in it. Then move, swap or restyle anything."
        artboard={artboard}
        options={options}
        cast={cast}
        drawSubstrate={drawSubstrate}
        onApply={applyIdea}
      />

      <InspectorSection title="Format">
        <TileGrid
          label="Where it's going"
          hideLabel
          options={SOCIAL_FORMATS.map((f) => ({
            value: f.id,
            name: f.name,
            detail: f.sub.split(' · ')[0],
            art: <FormatArt ratio={f.ratio} />,
          }))}
          value={options.format}
          onChange={(format) => setOption('format', format)}
          columns={3}
        />
      </InspectorSection>

      <InspectorSection title="Look">
        <TileGrid
          label="Colours"
          options={SOCIAL_THEMES.map((t) => ({
            value: t.id,
            name: t.name,
            art: <ThemeArt theme={t} />,
          }))}
          value={options.theme}
          onChange={setTheme}
          columns={4}
        />
        <TileGrid
          label="Backdrop"
          options={BACKDROPS.map((b) => ({
            value: b.id,
            name: b.name,
            art: <BackdropThumb backdrop={b.id} theme={options.theme} />,
          }))}
          value={options.sceneId ? null : options.backdrop}
          onChange={(backdrop) =>
            setOptions((c) => ({ ...c, backdrop, sceneId: null }))
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

      <InspectorSection title="Feature a product">
        <Note>Drop anything from the store into the post, priced.</Note>
        <ul className={panelStyles.products}>
          {products.map((product) => (
            <li key={product.itemid}>
              <button
                type="button"
                className={panelStyles.product}
                onClick={() => feature(product)}
                aria-label={`Feature ${product.productName}`}
              >
                <img src={product.image} alt="" loading="lazy" />
                <span>{product.productName}</span>
              </button>
            </li>
          ))}
        </ul>
        {CATALOG.length > PRODUCT_PREVIEW && (
          <WorkbenchButton
            variant="subtle"
            onClick={() => setAllProducts((v) => !v)}
          >
            {allProducts ? 'Show fewer' : `Show all ${CATALOG.length}`}
          </WorkbenchButton>
        )}
      </InspectorSection>

      <CastOnDesign
        title="In this post"
        cast={cast}
        workbench={workbench}
        onPlaceMember={placeOnPage}
        onEditMember={editMember}
        openPanel={openPanel}
      />

      <InspectorSection title="Caption">
        <TextAreaField
          label="Post caption"
          rows={4}
          value={options.caption ?? ''}
          placeholder="Say something about it…"
          // Typing is not an undo step per letter.
          onChange={(caption) =>
            setOptions((c) => ({ ...c, caption }), { commit: false })
          }
        />
        <WorkbenchButton
          variant="subtle"
          onClick={copyCaption}
          disabled={!options.caption}
        >
          {copied ? 'Copied' : 'Copy caption'}
        </WorkbenchButton>
      </InspectorSection>
    </>
  );
};

SocialPanel.propTypes = {
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
