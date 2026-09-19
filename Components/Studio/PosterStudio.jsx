import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { trackAddToCart } from '../../analytics/google';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { CheckCircleIcon, CloseIcon, SparklesIcon } from '../Icons';
import { useToast } from '../UI/Toast';
import { CanvasEngine } from './CanvasEngine';
import { DesignBar } from './core/DesignBar';
import {
  createDesignDoc,
  createDesignId,
  designToCartItem,
  summarizeDesign,
} from './core/designDoc';
import { computePrice, formatPrice, modifierFor } from './core/pricing';
import {
  OptionCards,
  OptionPills,
  PricePanel,
  QuantityStepper,
  StudioSlider,
  SwatchRow,
} from './core/StudioControls';
import {
  useDesignHistory,
  useUndoRedoShortcuts,
} from './core/useDesignHistory';
import { useDesignPersistence } from './core/useDesignPersistence';
import styles from './PosterStudio.module.css';
import { StickerBar } from './StickerBar';
import { EyePreviewIcon } from './StudioSVGs';

const SIZES = [
  {
    id: '12x18',
    name: '12" × 18" Gallery Print',
    sub: 'Desk, shelf and gallery-wall scale',
    price: 29.99,
    badge: 'Compact',
  },
  {
    id: '18x24',
    name: '18" × 24" Classic Exhibition',
    sub: 'Above a bed, sofa or console',
    price: 44.99,
    badge: 'Most Popular',
  },
  {
    id: '24x36',
    name: '24" × 36" Statement Archival',
    sub: 'Single-piece focal wall',
    price: 59.99,
    badge: 'Gallery Grand',
  },
];

const ORIENTATIONS = [
  { id: 'portrait', name: 'Vertical Portrait', sub: '3:4' },
  { id: 'landscape', name: 'Horizontal Landscape', sub: '4:3' },
];

const PALETTES = [
  { id: 'cosmic', name: 'Midnight Cosmic', preview: '#0f172a' },
  { id: 'sunburst', name: 'Sunburst Amber', preview: '#f59e0b' },
  { id: 'retro', name: 'Neon Retro', preview: '#db2777' },
  { id: 'minimal', name: 'Nordic Slate', preview: '#64748b' },
  { id: 'botanical', name: 'Sage Botanical', preview: '#15803d' },
  { id: 'sunset', name: 'Pacific Sunset', preview: '#ea580c' },
];

const INKS = [
  { value: '#ffffff', name: 'Gallery White' },
  { value: '#fdf6e3', name: 'Warm Ivory' },
  { value: '#fcd34d', name: 'Champagne Gold' },
  { value: '#bae6fd', name: 'Sky Mist' },
  { value: '#fbcfe8', name: 'Soft Blush' },
  { value: '#0f172a', name: 'Deep Ink' },
];

const FRAMES = [
  {
    id: 'oak',
    name: 'Solid Natural Oak',
    sub: 'Best seller',
    priceModifier: 25,
  },
  {
    id: 'black',
    name: 'Matte Gallery Black',
    sub: 'Modern',
    priceModifier: 20,
  },
  { id: 'white', name: 'Gallery Crisp White', sub: 'Clean', priceModifier: 20 },
  {
    id: 'gold',
    name: 'Vintage Florentine Gold',
    sub: 'Luxury',
    priceModifier: 30,
  },
  {
    id: 'none',
    name: 'Unframed Archival Print',
    sub: 'Print only',
    priceModifier: 0,
  },
];

const MATS = [
  {
    id: 'none',
    name: 'No Mat Board',
    sub: 'Full-bleed print',
    priceModifier: 0,
  },
  {
    id: 'white',
    name: 'White Conservation Mat',
    sub: '2 inch bright border',
    priceModifier: 18,
  },
  {
    id: 'offwhite',
    name: 'Off-White Museum Mat',
    sub: '2 inch warm border',
    priceModifier: 18,
  },
  {
    id: 'black',
    name: 'Black Core Mat',
    sub: 'Bevel-cut contrast edge',
    priceModifier: 22,
  },
];

const PAPERS = [
  {
    id: 'cotton',
    name: '250gsm Archival Cotton Rag',
    sub: 'Museum',
    priceModifier: 0,
  },
  {
    id: 'canvas',
    name: 'Textured Stretched Canvas',
    sub: 'Canvas',
    priceModifier: 15,
  },
  {
    id: 'luster',
    name: 'Ultra Semi-Gloss Luster',
    sub: 'Vibrant',
    priceModifier: 10,
  },
];

const FONTS = [
  { id: 'sans', name: 'Modern Sans' },
  { id: 'serif', name: 'Editorial Serif' },
  { id: 'display', name: 'Impact Display' },
  { id: 'cursive', name: 'Artisan Script' },
];

/** A preset is a shortcut through several controls, not a separate render path. */
const LAYOUTS = [
  {
    id: 'centred',
    name: 'Centred Classic',
    sub: 'Stacked and symmetrical',
    options: {
      fontFamily: 'serif',
      headlineScale: 1,
      letterSpacing: 4,
      textColor: '#ffffff',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial Left',
    sub: 'Masthead and rule',
    options: {
      fontFamily: 'sans',
      headlineScale: 0.9,
      letterSpacing: 2,
      textColor: '#fdf6e3',
    },
  },
  {
    id: 'block',
    name: 'Poster Block',
    sub: 'Oversized display type',
    options: {
      fontFamily: 'display',
      headlineScale: 1.35,
      letterSpacing: 0,
      textColor: '#ffffff',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Corner',
    sub: 'Small type, wide air',
    options: {
      fontFamily: 'sans',
      headlineScale: 0.75,
      letterSpacing: 10,
      textColor: '#0f172a',
      artStyle: 'minimal',
      mat: 'white',
    },
  },
];

const PER_STAMP_PRICE = 3.5;
const FREE_STAMPS = 3;

/** Fallback-thumbnail fills. Data, not theme — the canvas snapshot is preferred. */
const FRAME_FILLS = {
  oak: '#d4a373',
  black: '#1e293b',
  white: '#f8fafc',
  gold: '#d97706',
};
const MAT_FILLS = {
  white: '#ffffff',
  offwhite: '#f5efe6',
  black: '#111827',
};

const DEFAULTS = {
  size: '18x24',
  orientation: 'portrait',
  layout: 'centred',
  headline: 'REACH FOR THE STARS',
  subquote: 'Dream bigger, explore further, and shine bright.',
  caption: '',
  artStyle: 'cosmic',
  frame: 'oak',
  mat: 'none',
  paper: 'cotton',
  fontFamily: 'sans',
  textColor: '#ffffff',
  headlineScale: 1,
  letterSpacing: 4,
  bubbleText: 'Adventure time!',
  quantity: 1,
  showBleed: false,
};

const nameOf = (table, id, fallback = '—') =>
  table.find((entry) => entry.id === id)?.name ?? fallback;

/** What the shopper saw, in the words they saw it — cart line and order sheet. */
const LABELS = {
  headline: 'Headline',
  subquote: 'Sub-quote',
  caption: 'Caption',
  size: { label: 'Size', format: (v) => nameOf(SIZES, v) },
  orientation: { label: 'Orientation', format: (v) => nameOf(ORIENTATIONS, v) },
  layout: { label: 'Layout', format: (v) => nameOf(LAYOUTS, v) },
  artStyle: { label: 'Palette', format: (v) => nameOf(PALETTES, v) },
  frame: { label: 'Frame', format: (v) => nameOf(FRAMES, v) },
  mat: { label: 'Mount', format: (v) => nameOf(MATS, v) },
  paper: { label: 'Paper', format: (v) => nameOf(PAPERS, v) },
  fontFamily: { label: 'Typography', format: (v) => nameOf(FONTS, v) },
  textColor: {
    label: 'Headline ink',
    format: (v) => INKS.find((i) => i.value === v)?.name ?? v,
  },
  headlineScale: {
    label: 'Headline scale',
    format: (v) => `${Math.round(v * 100)}%`,
  },
  letterSpacing: { label: 'Letter spacing', format: (v) => `${v}px` },
};

export function PosterStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [options, setOptions] = useState(DEFAULTS);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isPreviewProofOpen, setIsPreviewProofOpen] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const canvasRef = useRef(null);
  const announceTimer = useRef(null);

  const history = useDesignHistory([], { limit: 60 });
  useUndoRedoShortcuts({ undo: history.undo, redo: history.redo });

  const stickers = history.present;

  const {
    headline,
    subquote,
    caption,
    artStyle,
    frame,
    mat,
    paper,
    fontFamily,
    textColor,
    headlineScale,
    letterSpacing,
    orientation,
    layout,
    bubbleText,
    quantity,
    showBleed,
    size,
  } = options;

  const setOption = useCallback(
    (key, value) => setOptions((prev) => ({ ...prev, [key]: value })),
    []
  );

  const applyLayout = useCallback(
    (id) =>
      setOptions((prev) => ({
        ...prev,
        ...(LAYOUTS.find((l) => l.id === id)?.options ?? {}),
        layout: id,
      })),
    []
  );

  const announce = useCallback((message) => {
    setAnnouncement(message);
    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => setAnnouncement(''), 4000);
  }, []);

  useEffect(() => () => clearTimeout(announceTimer.current), []);

  /* ------------------------------------------------------ design document -- */

  const doc = useMemo(
    () => createDesignDoc({ mode: 'poster', options, layers: stickers }),
    [options, stickers]
  );

  const persistence = useDesignPersistence({ mode: 'poster', doc });
  const { sharedDoc, acknowledgeShared } = persistence;

  const { reset: resetHistory } = history;

  const applyDoc = useCallback(
    (incoming) => {
      setOptions({ ...DEFAULTS, ...(incoming?.options ?? {}) });
      resetHistory(Array.isArray(incoming?.layers) ? incoming.layers : []);
    },
    [resetHistory]
  );

  const resetToDefaults = useCallback(() => {
    setOptions(DEFAULTS);
    resetHistory([]);
    setSelectedSticker(null);
  }, [resetHistory]);

  // A `?d=…` link has to open the design it encodes, not the default poster.
  useEffect(() => {
    if (!sharedDoc) return;
    applyDoc(sharedDoc);
    acknowledgeShared();
  }, [sharedDoc, applyDoc, acknowledgeShared]);

  /* ---------------------------------------------------------------- price -- */

  const activeSize = SIZES.find((s) => s.id === size) ?? SIZES[1];
  const activeFrame = FRAMES.find((f) => f.id === frame) ?? FRAMES[0];
  const activeMat = MATS.find((m) => m.id === mat) ?? MATS[0];
  const activePaper = PAPERS.find((p) => p.id === paper) ?? PAPERS[0];
  const activePalette = PALETTES.find((p) => p.id === artStyle) ?? PALETTES[0];

  const price = useMemo(
    () =>
      computePrice({
        base: activeSize.price,
        baseLabel: activeSize.name,
        modifiers: [
          modifierFor(activeFrame, 'Frame'),
          modifierFor(activeMat, 'Mount'),
          modifierFor(activePaper, 'Paper'),
        ].filter(Boolean),
        layerCount: stickers.length,
        perLayer: PER_STAMP_PRICE,
        freeLayers: FREE_STAMPS,
        quantity,
      }),
    [activeSize, activeFrame, activeMat, activePaper, stickers.length, quantity]
  );

  /* --------------------------------------------------------------- canvas -- */

  const canvasWidth = orientation === 'landscape' ? 560 : 440;
  const canvasHeight = orientation === 'landscape' ? 420 : 540;

  const canvasConfig = useMemo(
    () => ({
      headline,
      subquote,
      caption,
      artStyle,
      frame,
      mat,
      paper,
      orientation,
      layout,
      fontFamily,
      textColor,
      headlineScale,
      letterSpacing,
      showBleed,
    }),
    [
      headline,
      subquote,
      caption,
      artStyle,
      frame,
      mat,
      paper,
      orientation,
      layout,
      fontFamily,
      textColor,
      headlineScale,
      letterSpacing,
      showBleed,
    ]
  );

  /** The real artwork, for the cart line and saved-design thumbnails. */
  const snapshot = useCallback(() => {
    try {
      return canvasRef.current?.toDataURL('image/png') ?? null;
    } catch {
      // Canvas is unavailable (jsdom) or tainted — callers fall back.
      return null;
    }
  }, []);

  const handleDropStickerToCenter = (type) => {
    history.update([
      ...stickers,
      {
        id: createDesignId('stamp'),
        type,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        scale: 1.1,
        rotation: 0,
        flipX: false,
        text: type === 'bubble' ? bubbleText : undefined,
      },
    ]);
    announce('Stamp added to the centre of the poster.');
  };

  const openProof = () => {
    setProofImage(snapshot());
    setIsPreviewProofOpen(true);
  };

  const handleAddToCart = () => {
    const customPosterItem = designToCartItem({
      doc,
      itemid: createDesignId('CUSTOM-POSTER'),
      productName: `Custom Poster: "${headline}"`,
      manufacturer: 'Cart Gallery Press',
      price: price.unit,
      image: snapshot() ?? fallbackThumbnail(options, activePalette),
      quantity,
      customAttributes: summarizeDesign(doc, LABELS),
    });

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: customPosterItem },
    });

    trackAddToCart(customPosterItem, quantity);
    showToast(`Custom poster "${headline}" added to your bag!`, 'success');
    announce(`Added to bag — ${formatPrice(price.subtotal)}.`);
    setIsCartOpen(true);
    speak(
      `Splendid taste! Your ${activeSize.name} print "${headline}" will look sensational on the wall!`,
      'celebrating'
    );
  };

  return (
    <div className={styles.studioRoot}>
      <div className={styles.stageGrid}>
        {/* Canvas Stage */}
        <div className={styles.canvasStage}>
          <div className={styles.canvasHeader}>
            <div className={styles.proofBadge}>
              <SparklesIcon size={14} />
              <span>Framed Wall Art Proof Preview</span>
            </div>
            <div className={styles.headerRightActions}>
              <button
                type="button"
                className={styles.proofPreviewBtn}
                onClick={openProof}
                title="View Gallery Proof"
                aria-label="View Gallery Proof"
              >
                <EyePreviewIcon size={14} />
                <span>Gallery Proof</span>
              </button>
              <button
                type="button"
                className={`${styles.bleedBtn} ${showBleed ? styles.bleedBtnActive : ''}`}
                onClick={() => setOption('showBleed', !showBleed)}
                aria-pressed={showBleed}
                title="Toggle Print Bleed Guides"
              >
                <span>Bleed Guides</span>
              </button>
            </div>
          </div>

          <DesignBar
            persistence={persistence}
            modeLabel="poster"
            onRestore={applyDoc}
            onLoad={applyDoc}
            onReset={resetToDefaults}
            thumbnailFor={snapshot}
            summaryFor={() => summarizeDesign(doc, LABELS)}
          />

          <div className={styles.canvasContainer}>
            <CanvasEngine
              canvasRef={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              mode="poster"
              config={canvasConfig}
              // The cart thumbnail is snapshotted from this canvas, so the
              // diagonal PROOF ribbon must not be baked into it.
              exportOptions={{ watermark: false }}
              selectedSticker={selectedSticker}
              stickers={stickers}
              onUpdateStickers={history.update}
            />
          </div>

          <p className={styles.liveStatus} role="status">
            {announcement}
          </p>

          {/* Sticker Tray with Undo / Redo */}
          <div className={styles.stickerBarWrapper}>
            <StickerBar
              selectedSticker={selectedSticker}
              onSelectSticker={setSelectedSticker}
              onClearStickers={() => {
                history.update([]);
                announce('All stamps cleared.');
              }}
              stickersCount={stickers.length}
              onAddStickerToCenter={handleDropStickerToCenter}
              bubbleText={bubbleText}
              onChangeBubbleText={(value) => setOption('bubbleText', value)}
              onUndo={history.undo}
              onRedo={history.redo}
              canUndo={history.canUndo}
              canRedo={history.canRedo}
            />
          </div>
        </div>

        {/* Controls Stage */}
        <div className={styles.controlsStage}>
          <div className={styles.paneHeader}>
            <h3>Design Custom Wall Art Poster</h3>
            <p>Giclée pigment print on archival museum-grade fine art stock.</p>
          </div>

          <OptionCards
            label="Print Dimensions & Format"
            options={SIZES}
            value={size}
            onChange={(value) => setOption('size', value)}
            columns={3}
          />

          <OptionPills
            label="Display Orientation"
            options={ORIENTATIONS}
            value={orientation}
            onChange={(value) => setOption('orientation', value)}
          />

          <OptionPills
            label="Layout Preset"
            hint="Sets typography and ink in one move"
            options={LAYOUTS}
            value={layout}
            onChange={applyLayout}
          />

          <div className={styles.fieldGroup}>
            <label htmlFor="posterHeadline">Poster Headline:</label>
            <input
              id="posterHeadline"
              type="text"
              value={headline}
              maxLength={36}
              onChange={(e) => setOption('headline', e.target.value)}
              placeholder="e.g. REACH FOR THE STARS"
              className={styles.textInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="posterSubquote">Sub-Quote or Inscription:</label>
            <input
              id="posterSubquote"
              type="text"
              value={subquote}
              maxLength={80}
              onChange={(e) => setOption('subquote', e.target.value)}
              placeholder="e.g. Dream bigger, explore further..."
              className={styles.textInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="posterCaption">Caption or Credit Line:</label>
            <input
              id="posterCaption"
              type="text"
              value={caption}
              maxLength={48}
              onChange={(e) => setOption('caption', e.target.value)}
              placeholder="e.g. For Maya — Spring 2026"
              className={styles.textInput}
            />
            <p className={styles.fieldHint}>
              Printed small beneath the sub-quote. Leave blank to omit it.
            </p>
          </div>

          <OptionPills
            label="Typography Style"
            options={FONTS}
            value={fontFamily}
            onChange={(value) => setOption('fontFamily', value)}
          />

          <StudioSlider
            label="Headline scale"
            value={headlineScale}
            onChange={(value) => setOption('headlineScale', value)}
            min={0.6}
            max={1.6}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
          />

          <StudioSlider
            label="Letter spacing"
            value={letterSpacing}
            onChange={(value) => setOption('letterSpacing', value)}
            min={0}
            max={14}
            step={1}
            format={(v) => `${v}px`}
          />

          <SwatchRow
            label="Color Palette"
            hint={activePalette.name}
            options={PALETTES.map((p) => ({ value: p.preview, name: p.name }))}
            value={activePalette.preview}
            onChange={(preview) =>
              setOption(
                'artStyle',
                PALETTES.find((p) => p.preview === preview)?.id ?? 'cosmic'
              )
            }
            columns={6}
          />

          <SwatchRow
            label="Headline Ink"
            hint={INKS.find((i) => i.value === textColor)?.name ?? 'Custom'}
            options={INKS}
            value={textColor}
            onChange={(value) => setOption('textColor', value)}
            columns={6}
          />

          <div className={styles.fieldGroup}>
            <label htmlFor="posterInk">Custom Ink Color:</label>
            <div className={styles.inkRow}>
              <input
                id="posterInk"
                type="color"
                className={styles.inkInput}
                value={textColor}
                onChange={(e) => setOption('textColor', e.target.value)}
              />
              <code className={styles.inkValue}>{textColor.toUpperCase()}</code>
            </div>
          </div>

          <OptionPills
            label="Museum Framing Option"
            options={FRAMES}
            value={frame}
            onChange={(value) => setOption('frame', value)}
          />

          <OptionPills
            label="Mat & Mount"
            hint="Conservation board around the print"
            options={MATS}
            value={mat}
            onChange={(value) => setOption('mat', value)}
          />

          <OptionPills
            label="Fine Art Paper Stock"
            options={PAPERS}
            value={paper}
            onChange={(value) => setOption('paper', value)}
          />

          <QuantityStepper
            value={quantity}
            onChange={(value) => setOption('quantity', value)}
          />

          <PricePanel
            price={price}
            note={`First ${FREE_STAMPS} stamps are included; each further stamp is ${formatPrice(
              PER_STAMP_PRICE
            )}.`}
          />

          <div className={styles.guaranteeBox}>
            <CheckCircleIcon size={18} />
            <span>
              Ready to Hang with Premium Hanging Wire & Corner Bumpers Installed
            </span>
          </div>

          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            aria-label={`Add Framed Poster to Bag — ${formatPrice(price.subtotal)}`}
          >
            <span>
              Add Custom Framed Poster • {formatPrice(price.subtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Gallery Proof Modal */}
      {isPreviewProofOpen && (
        <div
          className={styles.proofModalOverlay}
          role="dialog"
          aria-label="Gallery Proof Preview Modal"
        >
          <div className={styles.proofModalCard}>
            <div className={styles.proofModalHeader}>
              <div className={styles.proofModalTitle}>
                <SparklesIcon size={16} />
                <strong>Archival Gallery Proof Verification</strong>
              </div>
              <button
                type="button"
                className={styles.closeProofBtn}
                onClick={() => setIsPreviewProofOpen(false)}
                aria-label="Close Proof Dialog"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className={styles.proofModalBody}>
              <div className={styles.proofSpecsRow}>
                <div className={styles.proofSpecItem}>
                  <span>Size:</span>
                  <strong>{activeSize.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Orientation:</span>
                  <strong>{orientation.toUpperCase()}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Frame:</span>
                  <strong>{activeFrame.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Mount:</span>
                  <strong>{activeMat.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Paper:</span>
                  <strong>{activePaper.name}</strong>
                </div>
              </div>

              {/* A proof is a still of the artwork. The previous build mounted a
                  second live engine here, which animated and ate gestures it had
                  nowhere to send. */}
              <div className={styles.proofCanvasWrap}>
                {proofImage ? (
                  <img
                    src={proofImage}
                    alt={`Gallery proof of the poster "${headline}"`}
                    className={styles.proofImage}
                  />
                ) : (
                  <div className={styles.proofStill} aria-hidden="true">
                    <CanvasEngine
                      width={orientation === 'landscape' ? 480 : 360}
                      height={orientation === 'landscape' ? 360 : 450}
                      mode="poster"
                      config={{ ...canvasConfig, showBleed: false }}
                      selectedSticker={null}
                      stickers={stickers}
                      isAnimated={false}
                    />
                  </div>
                )}
              </div>

              <div className={styles.proofModalFooter}>
                <p className={styles.proofDisclaimer}>
                  Certified pigment proof. Hand-inspected and printed with 100%
                  acid-free museum inks.
                </p>
                <button
                  type="button"
                  className={styles.proofConfirmBtn}
                  onClick={() => setIsPreviewProofOpen(false)}
                >
                  <span>Confirm Proof & Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Last-resort cart thumbnail when the canvas cannot be snapshotted. It honours
 * the chosen palette, frame (including unframed) and mat rather than drawing a
 * fixed navy panel in a white frame the shopper never picked.
 */
function fallbackThumbnail(opts, palette) {
  const frameFill = FRAME_FILLS[opts.frame];
  const matFill = MAT_FILLS[opts.mat];
  const inset = frameFill ? 14 : 0;
  const artInset = inset + (matFill ? 16 : 6);
  const artSize = 160 - artInset * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f1f5f9" rx="8"/>
      ${frameFill ? `<rect x="${inset}" y="${inset}" width="${160 - inset * 2}" height="${160 - inset * 2}" fill="${frameFill}" rx="4"/>` : ''}
      ${matFill ? `<rect x="${inset + 6}" y="${inset + 6}" width="${160 - (inset + 6) * 2}" height="${160 - (inset + 6) * 2}" fill="${matFill}"/>` : ''}
      <rect x="${artInset}" y="${artInset}" width="${artSize}" height="${artSize}" fill="${palette.preview}"/>
      <text x="80" y="${artInset + artSize - 14}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="${opts.textColor}">${escapeXml(
        (opts.headline || 'POSTER').slice(0, 16).toUpperCase()
      )}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const escapeXml = (value) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]
  );
