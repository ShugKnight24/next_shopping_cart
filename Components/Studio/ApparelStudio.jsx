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
import styles from './ApparelStudio.module.css';
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
import { STICKER_CATALOG, StickerBar } from './StickerBar';
import { EyePreviewIcon } from './StudioSVGs';

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 420;

/** First two appliques ride along with the garment; extras are stitched by hand. */
const FREE_PATCHES = 2;
const PER_PATCH_PRICE = 4.5;

const GARMENTS = [
  {
    id: 'hoodie',
    name: "Organic Kids' Hoodie",
    price: 48.0,
    badge: 'Organic Fleece',
  },
  {
    id: 'tee',
    name: "Kids' Heavyweight Graphic Tee",
    price: 32.0,
    badge: '240gsm Cotton',
  },
  {
    id: 'jacket',
    name: "Kids' Varsity Bomber Jacket",
    price: 68.0,
    badge: 'Snap Closure',
  },
  {
    id: 'kicks',
    name: "Custom Kids' Canvas High-Tops",
    price: 65.0,
    badge: 'Cushioned Insole',
  },
];

/**
 * The sizing modal renders straight from this table — it used to hardcode the
 * same five rows, so `chest` was dead data and the "Length" column existed in
 * no source at all.
 */
const SIZES = [
  {
    id: 'Youth XS',
    age: '4-5 Yrs',
    chest: '24"-26"',
    length: '18"',
    priceModifier: 0,
  },
  {
    id: 'Youth S',
    age: '6-7 Yrs',
    chest: '26"-28"',
    length: '20"',
    priceModifier: 0,
  },
  {
    id: 'Youth M',
    age: '8-9 Yrs',
    chest: '28"-30"',
    length: '22"',
    priceModifier: 0,
  },
  {
    id: 'Youth L',
    age: '10-12 Yrs',
    chest: '30"-32"',
    length: '24"',
    priceModifier: 2.5,
  },
  {
    id: 'Youth XL',
    age: '14-16 Yrs',
    chest: '32"-34"',
    length: '26"',
    priceModifier: 4.5,
  },
];

const COLORS = [
  { id: 'navy', name: 'Midnight Navy', hex: '#1e293b' },
  { id: 'slate', name: 'Heather Slate', hex: '#475569' },
  { id: 'cream', name: 'Vintage Cream', hex: '#f8fafc' },
  { id: 'pine', name: 'Forest Pine', hex: '#064e3b' },
  { id: 'crimson', name: 'Crimson Red', hex: '#991b1b' },
  { id: 'amber', name: 'Goldenrod Ochre', hex: '#b45309' },
  { id: 'lavender', name: 'Soft Lavender', hex: '#7c3aed' },
];

const ACCENTS = [
  { id: 'ecru', name: 'Natural Ecru Ribbing', hex: '#e7e5e4' },
  { id: 'ink', name: 'Ink Black Ribbing', hex: '#111827' },
  { id: 'gold', name: 'Goldenrod Trim', hex: '#d97706' },
  { id: 'sky', name: 'Sky Blue Trim', hex: '#38bdf8' },
  { id: 'rose', name: 'Rose Quartz Trim', hex: '#f472b6' },
  { id: 'kelly', name: 'Kelly Green Trim', hex: '#16a34a' },
];

const PLACEMENTS = [
  {
    id: 'chest',
    name: 'Center Chest',
    sub: 'Full-width embroidery crest',
    priceModifier: 4,
  },
  {
    id: 'pocket',
    name: 'Left Pocket',
    sub: 'Subtle left-chest signature',
    priceModifier: 0,
  },
  {
    id: 'back',
    name: 'Hero Backprint',
    sub: 'Bold oversized statement',
    priceModifier: 9,
  },
];

const FONTS = [
  { id: 'sans', name: 'Athletic Block' },
  { id: 'serif', name: 'Heritage Serif' },
  { id: 'display', name: 'Varsity Bold' },
  { id: 'cursive', name: 'Script Signature' },
];

const FINISHES = [
  {
    id: 'satin',
    name: 'Satin Stitch',
    sub: 'High-density Japanese thread',
    priceModifier: 5,
  },
  {
    id: 'chain',
    name: 'Chain Stitch',
    sub: 'Heritage loop needle',
    priceModifier: 7,
  },
  {
    id: 'screen',
    name: 'Flat Screen Print',
    sub: 'Soft-hand water base',
    priceModifier: 0,
  },
  {
    id: 'puff',
    name: 'Puff Print',
    sub: 'Raised 3D ink',
    priceModifier: 9,
  },
];

const byId = (table, id) => table.find((o) => o.id === id) ?? table[0];
const byHex = (table, hex) => table.find((o) => o.hex === hex) ?? table[0];

const DEFAULTS = {
  garment: 'hoodie',
  size: 'Youth S',
  colorHex: COLORS[0].hex,
  accentHex: ACCENTS[0].hex,
  placement: 'chest',
  fontFamily: 'sans',
  finish: 'satin',
  monogram: 'NOAH',
  textScale: 1,
  showBleed: false,
  bubbleText: 'Adventure time!',
  quantity: 1,
};

/** What the shopper sees on the cart line and on the production sheet. */
const LABELS = {
  garment: { label: 'Garment', format: (v) => byId(GARMENTS, v).name },
  size: 'Size',
  colorHex: { label: 'Colorway', format: (v) => byHex(COLORS, v).name },
  accentHex: { label: 'Accent Trim', format: (v) => byHex(ACCENTS, v).name },
  placement: { label: 'Placement', format: (v) => byId(PLACEMENTS, v).name },
  finish: { label: 'Stitch Finish', format: (v) => byId(FINISHES, v).name },
  fontFamily: { label: 'Typography', format: (v) => byId(FONTS, v).name },
  monogram: { label: 'Embroidery', format: (v) => String(v).toUpperCase() },
  textScale: {
    label: 'Monogram Scale',
    format: (v) => `${Math.round(v * 100)}%`,
  },
};

const patchNames = (layers) =>
  layers.length
    ? layers
        .map(
          (layer) =>
            STICKER_CATALOG.find((s) => s.id === layer.type)?.name ?? layer.type
        )
        .join(', ')
    : 'None';

export function ApparelStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [garment, setGarment] = useState(DEFAULTS.garment);
  const [size, setSize] = useState(DEFAULTS.size);
  const [colorHex, setColorHex] = useState(DEFAULTS.colorHex);
  const [accentHex, setAccentHex] = useState(DEFAULTS.accentHex);
  const [placement, setPlacement] = useState(DEFAULTS.placement);
  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
  const [finish, setFinish] = useState(DEFAULTS.finish);
  const [monogram, setMonogram] = useState(DEFAULTS.monogram);
  const [textScale, setTextScale] = useState(DEFAULTS.textScale);
  const [showBleed, setShowBleed] = useState(DEFAULTS.showBleed);
  const [bubbleText, setBubbleText] = useState(DEFAULTS.bubbleText);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);

  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const canvasRef = useRef(null);
  const announceTimer = useRef(null);

  const history = useDesignHistory([]);
  useUndoRedoShortcuts({ undo: history.undo, redo: history.redo });

  const stickers = history.present;
  const { reset: resetHistory, update: updateLayers } = history;

  const activeGarment = byId(GARMENTS, garment);
  const activeSize = byId(SIZES, size);
  const activeColor = byHex(COLORS, colorHex);
  const activeAccent = byHex(ACCENTS, accentHex);
  const activePlacement = byId(PLACEMENTS, placement);
  const activeFinish = byId(FINISHES, finish);

  const announce = useCallback((message) => {
    setAnnouncement(message);
    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => setAnnouncement(''), 4000);
  }, []);

  useEffect(() => () => clearTimeout(announceTimer.current), []);

  /* ------------------------------------------------------ design document -- */

  const doc = useMemo(
    () =>
      createDesignDoc({
        mode: 'apparel',
        options: {
          garment,
          size,
          colorHex,
          accentHex,
          placement,
          fontFamily,
          finish,
          monogram,
          textScale,
          showBleed,
          bubbleText,
          quantity,
        },
        layers: stickers,
      }),
    [
      garment,
      size,
      colorHex,
      accentHex,
      placement,
      fontFamily,
      finish,
      monogram,
      textScale,
      showBleed,
      bubbleText,
      quantity,
      stickers,
    ]
  );

  const persistence = useDesignPersistence({ mode: 'apparel', doc });
  const { sharedDoc, acknowledgeShared } = persistence;

  const applyDoc = useCallback(
    (next) => {
      const o = next?.options ?? {};
      setGarment(o.garment ?? DEFAULTS.garment);
      setSize(o.size ?? DEFAULTS.size);
      setColorHex(o.colorHex ?? DEFAULTS.colorHex);
      setAccentHex(o.accentHex ?? DEFAULTS.accentHex);
      setPlacement(o.placement ?? DEFAULTS.placement);
      setFontFamily(o.fontFamily ?? DEFAULTS.fontFamily);
      setFinish(o.finish ?? DEFAULTS.finish);
      setMonogram(o.monogram ?? DEFAULTS.monogram);
      setTextScale(o.textScale ?? DEFAULTS.textScale);
      setShowBleed(o.showBleed ?? DEFAULTS.showBleed);
      setBubbleText(o.bubbleText ?? DEFAULTS.bubbleText);
      setQuantity(o.quantity ?? DEFAULTS.quantity);
      resetHistory(next?.layers ?? []);
    },
    [resetHistory]
  );

  const resetToDefaults = useCallback(() => {
    applyDoc(null);
    setSelectedSticker(null);
  }, [applyDoc]);

  // A `?d=…` link has to actually open the design it encodes.
  useEffect(() => {
    if (!sharedDoc) return;
    applyDoc(sharedDoc);
    acknowledgeShared();
  }, [sharedDoc, acknowledgeShared, applyDoc]);

  /* ---------------------------------------------------------------- price -- */

  const price = useMemo(
    () =>
      computePrice({
        base: activeGarment.price,
        baseLabel: activeGarment.name,
        modifiers: [
          activeSize.priceModifier
            ? {
                label: `Size: ${activeSize.id}`,
                amount: activeSize.priceModifier,
              }
            : null,
          modifierFor(activePlacement, 'Placement'),
          modifierFor(activeFinish, 'Finish'),
        ],
        layerCount: stickers.length,
        perLayer: PER_PATCH_PRICE,
        freeLayers: FREE_PATCHES,
        quantity,
      }),
    [
      activeGarment,
      activeSize,
      activePlacement,
      activeFinish,
      stickers.length,
      quantity,
    ]
  );

  /* --------------------------------------------------------------- canvas -- */

  /** Real render of the shopper's garment, for the cart line and the shelf. */
  const snapshot = useCallback(() => {
    try {
      return canvasRef.current?.toDataURL('image/png') ?? null;
    } catch {
      // jsdom, and any browser that taints the canvas, cannot export.
      return null;
    }
  }, []);

  const fallbackThumbnail = useCallback(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f8fafc" rx="8"/>
      <circle cx="80" cy="140" r="50" fill="rgba(0,0,0,0.06)"/>
      <path d="M50 50 L110 50 L130 90 L115 100 L105 80 L105 130 L55 130 L55 80 L45 100 L30 90 Z" fill="${colorHex}" stroke="${accentHex}" stroke-width="2"/>
      <text x="80" y="96" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#ffffff">${(monogram || 'HERO').slice(0, 8).toUpperCase()}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [colorHex, accentHex, monogram]);

  const handleDropStickerToCenter = (type) => {
    updateLayers([
      ...stickers,
      {
        id: `patch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        scale: 1.1,
        rotation: 0,
        flipX: false,
        text: type === 'bubble' ? bubbleText : undefined,
      },
    ]);
    announce('Patch added to the garment.');
  };

  // Retitles bubbles already on the garment, uncommitted so a keystroke does
  // not become an undo step of its own.
  const handleBubbleText = useCallback(
    (text) => {
      setBubbleText(text);
      updateLayers(
        (layers) =>
          layers.some((l) => l.type === 'bubble')
            ? layers.map((l) => (l.type === 'bubble' ? { ...l, text } : l))
            : layers,
        { commit: false }
      );
    },
    [updateLayers]
  );

  useEffect(() => {
    if (!isSizingModalOpen && !isProofOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setIsSizingModalOpen(false);
      setIsProofOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSizingModalOpen, isProofOpen]);

  /* ------------------------------------------------------------- checkout -- */

  const handleAddToCart = () => {
    const customApparelItem = designToCartItem({
      doc,
      itemid: createDesignId('CUSTOM-APPAREL'),
      productName: `Custom ${activeGarment.name}: "${monogram}"`,
      manufacturer: 'Cart Kids Craft Studio',
      price: price.unit,
      image: snapshot() ?? fallbackThumbnail(),
      quantity,
      customAttributes: {
        ...summarizeDesign(doc, LABELS),
        Patches: patchNames(stickers),
      },
    });

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: customApparelItem },
    });

    trackAddToCart(customApparelItem, quantity);
    showToast(`Custom ${activeGarment.name} added to your bag!`, 'success');
    setIsCartOpen(true);
    speak(
      `Look at those fresh threads! Your custom ${activeGarment.name} in size ${size} is in the bag!`,
      'celebrating'
    );
  };

  const canvasConfig = {
    garment,
    color: colorHex,
    monogram,
    placement,
    fontFamily,
    size,
    accentColor: accentHex,
    textScale,
    showBleed,
  };

  return (
    <div className={styles.studioRoot}>
      <div className={styles.stageGrid}>
        {/* Canvas Stage */}
        <div className={styles.canvasStage}>
          <div className={styles.canvasHeader}>
            <div className={styles.proofBadge}>
              <SparklesIcon size={14} />
              <span>Live Garment Design Preview</span>
            </div>
            <div className={styles.headerRightActions}>
              <button
                type="button"
                className={styles.proofPreviewBtn}
                onClick={() => setIsProofOpen(true)}
                title="View Stitch Proof"
                aria-label="View Stitch Proof"
              >
                <EyePreviewIcon size={14} />
                <span>Stitch Proof</span>
              </button>
              <button
                type="button"
                className={`${styles.bleedBtn} ${showBleed ? styles.bleedBtnActive : ''}`}
                onClick={() => setShowBleed((b) => !b)}
                aria-pressed={showBleed}
                title="Toggle stitch bleed and safe-zone guides"
              >
                <span>Bleed Guides</span>
              </button>
              <button
                type="button"
                className={styles.sizingGuideBtn}
                onClick={() => setIsSizingModalOpen(true)}
                title="View Sizing Chart"
                aria-label="View Sizing Chart"
              >
                <span>Sizing Chart</span>
              </button>
            </div>
          </div>

          <DesignBar
            persistence={persistence}
            modeLabel="apparel design"
            onRestore={applyDoc}
            onLoad={applyDoc}
            onReset={resetToDefaults}
            thumbnailFor={snapshot}
            summaryFor={() => summarizeDesign(doc, LABELS)}
          />

          <div className={styles.canvasContainer}>
            <CanvasEngine
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              mode="apparel"
              config={canvasConfig}
              canvasRef={canvasRef}
              exportOptions={{ watermark: false }}
              selectedSticker={selectedSticker}
              stickers={stickers}
              onUpdateStickers={updateLayers}
            />
          </div>

          <div className={styles.stickerBarWrapper}>
            <StickerBar
              selectedSticker={selectedSticker}
              onSelectSticker={setSelectedSticker}
              onClearStickers={() => {
                updateLayers([]);
                announce('All patches removed.');
              }}
              stickersCount={stickers.length}
              onAddStickerToCenter={handleDropStickerToCenter}
              bubbleText={bubbleText}
              onChangeBubbleText={handleBubbleText}
              onUndo={history.undo}
              onRedo={history.redo}
              canUndo={history.canUndo}
              canRedo={history.canRedo}
            />
          </div>

          <p className={styles.liveStatus} role="status" aria-live="polite">
            {announcement}
          </p>
        </div>

        {/* Controls Stage */}
        <div className={styles.controlsStage}>
          <div className={styles.paneHeader}>
            <h3>Customize Kids' Apparel & Kicks</h3>
            <p>
              Embroidered and assembled with certified organic, child-safe
              materials.
            </p>
          </div>

          {/* Garment Silhouette — plain toggle buttons: the suite queries these
              by `role="button"`, so they must not become radios. */}
          <div className={styles.fieldGroup}>
            <span className={styles.groupLabel} id="apparelGarmentLabel">
              Garment Silhouette:
            </span>
            <div
              className={styles.garmentList}
              role="group"
              aria-labelledby="apparelGarmentLabel"
            >
              {GARMENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={garment === g.id}
                  className={`${styles.garmentCard} ${
                    garment === g.id ? styles.garmentCardActive : ''
                  }`}
                  onClick={() => setGarment(g.id)}
                >
                  <span className={styles.garmentTop}>
                    <span className={styles.garmentName}>{g.name}</span>
                    <span className={styles.garmentBadge}>{g.badge}</span>
                  </span>
                  <span className={styles.garmentPrice}>
                    {formatPrice(g.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Youth Size Selector */}
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <span className={styles.groupLabel} id="apparelSizeLabel">
                Youth Size:
              </span>
              <button
                type="button"
                className={styles.sizeGuideLink}
                onClick={() => setIsSizingModalOpen(true)}
              >
                Size Guide
              </button>
            </div>
            <div
              className={styles.sizePillGrid}
              role="group"
              aria-labelledby="apparelSizeLabel"
            >
              {SIZES.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  aria-pressed={size === sz.id}
                  className={`${styles.sizePillBtn} ${
                    size === sz.id ? styles.sizePillBtnActive : ''
                  }`}
                  onClick={() => setSize(sz.id)}
                  title={`${sz.id} (${sz.age})`}
                >
                  <strong>{sz.id}</strong>
                  <span>{sz.age}</span>
                  {sz.priceModifier > 0 && (
                    <span className={styles.sizeDelta}>
                      +{formatPrice(sz.priceModifier)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Monogram / Inscription */}
          <div className={styles.fieldGroup}>
            <label className={styles.groupLabel} htmlFor="monogramInput">
              Monogram or Child Name:
            </label>
            <input
              id="monogramInput"
              type="text"
              value={monogram}
              maxLength={12}
              onChange={(e) => setMonogram(e.target.value)}
              placeholder="e.g. NOAH"
              className={styles.textInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <StudioSlider
              label="Monogram scale"
              value={textScale}
              onChange={setTextScale}
              min={0.6}
              max={1.6}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>

          {/* Embroidery Placement */}
          <div className={styles.fieldGroup}>
            <span className={styles.groupLabel} id="apparelPlacementLabel">
              Embroidery Placement Zone:
            </span>
            <div
              className={styles.placementList}
              role="group"
              aria-labelledby="apparelPlacementLabel"
            >
              {PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={placement === p.id}
                  className={`${styles.placementBtn} ${
                    placement === p.id ? styles.placementBtnActive : ''
                  }`}
                  onClick={() => setPlacement(p.id)}
                >
                  <span className={styles.placementLabel}>{p.name}</span>
                  <span className={styles.placementDesc}>{p.sub}</span>
                  {p.priceModifier > 0 && (
                    <span className={styles.placementDelta}>
                      +{formatPrice(p.priceModifier)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <OptionPills
            label="Embroidery Typography"
            options={FONTS}
            value={fontFamily}
            onChange={setFontFamily}
          />

          <OptionPills
            label="Stitch & Finish"
            hint="How the artwork is applied"
            options={FINISHES}
            value={finish}
            onChange={setFinish}
          />

          <SwatchRow
            label="Base Colourway"
            options={COLORS.map((c) => ({ value: c.hex, name: c.name }))}
            value={colorHex}
            onChange={setColorHex}
            columns={7}
          />

          <SwatchRow
            label="Accent Trim"
            hint="Cuffs, hem, collar ribbing and laces"
            options={ACCENTS.map((a) => ({ value: a.hex, name: a.name }))}
            value={accentHex}
            onChange={setAccentHex}
            columns={6}
          />

          <div className={styles.fieldGroup}>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          <PricePanel
            price={price}
            note={`${FREE_PATCHES} appliques are included — each extra patch is ${formatPrice(PER_PATCH_PRICE)}.`}
          />

          <div className={styles.guaranteeBox}>
            <CheckCircleIcon size={18} />
            <span>
              High-Density Japanese Satin Stitch Embroidery • Pre-Shrunk Organic
              Cotton
            </span>
          </div>

          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            aria-label={`Add Custom Apparel to Bag • ${formatPrice(price.subtotal)}`}
          >
            <span>
              Add Custom Apparel to Bag • {formatPrice(price.subtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Stitch Proof Modal */}
      {isProofOpen && (
        <div
          className={styles.proofModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Apparel Stitch Proof Preview Modal"
        >
          <div className={styles.proofModalCard}>
            <div className={styles.proofModalHeader}>
              <div className={styles.proofModalTitle}>
                <SparklesIcon size={16} />
                <strong>Embroidery Stitch Proof Verification</strong>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setIsProofOpen(false)}
                aria-label="Close Stitch Proof Dialog"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className={styles.proofModalBody}>
              <div className={styles.proofSpecsRow}>
                <div className={styles.proofSpecItem}>
                  <span>Garment:</span>
                  <strong>{activeGarment.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Fit:</span>
                  <strong>
                    {activeSize.id} · {activeSize.chest}
                  </strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Zone:</span>
                  <strong>{activePlacement.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Finish:</span>
                  <strong>{activeFinish.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Colourway:</span>
                  <strong>
                    {activeColor.name} / {activeAccent.name}
                  </strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Appliques:</span>
                  <strong>{stickers.length}</strong>
                </div>
              </div>

              <div className={styles.proofCanvasWrap}>
                <CanvasEngine
                  width={420}
                  height={340}
                  mode="apparel"
                  config={{ ...canvasConfig, showBleed: false }}
                  exportOptions={{ watermark: true }}
                  selectedSticker={null}
                  stickers={stickers}
                />
              </div>

              <div className={styles.proofModalFooter}>
                <p className={styles.proofDisclaimer}>
                  Digitized stitch file proof. Thread colours are matched to
                  Madeira Polyneon and hand-inspected before production.
                </p>
                <button
                  type="button"
                  className={styles.proofConfirmBtn}
                  onClick={() => setIsProofOpen(false)}
                >
                  <span>Confirm Stitch Proof &amp; Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sizing Guide Modal */}
      {isSizingModalOpen && (
        <div
          className={styles.sizingModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Youth Apparel Sizing Guide"
        >
          <div className={styles.sizingModalCard}>
            <div className={styles.sizingModalHeader}>
              <div className={styles.sizingModalTitle}>
                <SparklesIcon size={16} />
                <strong>Youth Garment Sizing & Fit Guide</strong>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setIsSizingModalOpen(false)}
                aria-label="Close Sizing Dialog"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className={styles.sizingModalBody}>
              <p className={styles.sizingIntro}>
                All garments feature a relaxed, modern unisex fit designed with
                room for growth. Pre-washed to prevent shrinkage.
              </p>
              <table className={styles.sizingTable}>
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    <th scope="col">Recommended Age</th>
                    <th scope="col">Chest (Inches)</th>
                    <th scope="col">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((sz) => (
                    <tr
                      key={sz.id}
                      className={size === sz.id ? styles.sizingRowActive : ''}
                    >
                      <th scope="row">{sz.id}</th>
                      <td>{sz.age}</td>
                      <td>{sz.chest}</td>
                      <td>{sz.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.sizingTips}>
                <strong>Care Instructions:</strong>
                <span>
                  Machine wash cold inside out with gentle detergent. Tumble dry
                  low or hang dry to preserve embroidery sheen.
                </span>
              </div>

              <button
                type="button"
                className={styles.modalCloseActionBtn}
                onClick={() => setIsSizingModalOpen(false)}
              >
                Got It, Return to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
