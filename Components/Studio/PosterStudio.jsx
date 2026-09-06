import { useCallback, useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { CheckCircleIcon, SparklesIcon, CloseIcon } from '../Icons';
import { EyePreviewIcon } from './StudioSVGs';
import styles from './PosterStudio.module.css';

const SIZES = [
  { id: '12x18', name: '12" × 18" Gallery Print', basePrice: 29.99, badge: 'Compact' },
  { id: '18x24', name: '18" × 24" Classic Exhibition', basePrice: 44.99, badge: 'Most Popular' },
  { id: '24x36', name: '24" × 36" Statement Archival', basePrice: 59.99, badge: 'Gallery Grand' },
];

const ORIENTATIONS = [
  { id: 'portrait', label: 'Vertical Portrait', ratio: '3:4' },
  { id: 'landscape', label: 'Horizontal Landscape', ratio: '4:3' },
];

const PALETTES = [
  { id: 'cosmic', name: 'Midnight Cosmic', preview: '#0f172a' },
  { id: 'sunburst', name: 'Sunburst Amber', preview: '#f59e0b' },
  { id: 'retro', name: 'Neon Retro', preview: '#db2777' },
  { id: 'minimal', name: 'Nordic Slate', preview: '#64748b' },
  { id: 'botanical', name: 'Sage Botanical', preview: '#15803d' },
  { id: 'sunset', name: 'Pacific Sunset', preview: '#ea580c' },
];

const FRAMES = [
  { id: 'oak', name: 'Solid Natural Oak', priceDelta: 25, badge: 'Best Seller' },
  { id: 'black', name: 'Matte Gallery Black', priceDelta: 20, badge: 'Modern' },
  { id: 'white', name: 'Gallery Crisp White', priceDelta: 20, badge: 'Clean' },
  { id: 'gold', name: 'Vintage Florentine Gold', priceDelta: 30, badge: 'Luxury' },
  { id: 'none', name: 'Unframed Archival Print', priceDelta: 0, badge: 'Print Only' },
];

const PAPERS = [
  { id: 'cotton', name: '250gsm Archival Cotton Rag', priceDelta: 0, badge: 'Museum' },
  { id: 'canvas', name: 'Textured Stretched Canvas', priceDelta: 15, badge: 'Canvas' },
  { id: 'luster', name: 'Ultra Semi-Gloss Luster', priceDelta: 10, badge: 'Vibrant' },
];

const FONTS = [
  { id: 'sans', name: 'Modern Sans' },
  { id: 'serif', name: 'Editorial Serif' },
  { id: 'display', name: 'Impact Display' },
  { id: 'cursive', name: 'Artisan Script' },
];

export function PosterStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [size, setSize] = useState('18x24');
  const [orientation, setOrientation] = useState('portrait');
  const [headline, setHeadline] = useState('REACH FOR THE STARS');
  const [subquote, setSubquote] = useState(
    'Dream bigger, explore further, and shine bright.'
  );
  const [artStyle, setArtStyle] = useState('cosmic');
  const [frame, setFrame] = useState('oak');
  const [paper, setPaper] = useState('cotton');
  const [fontFamily, setFontFamily] = useState('sans');
  const [showBleed, setShowBleed] = useState(false);
  const [isPreviewProofOpen, setIsPreviewProofOpen] = useState(false);

  // Sticker & Undo/Redo Layering State
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeSizeObj = SIZES.find((s) => s.id === size) || SIZES[1];
  const activeFrameObj = FRAMES.find((f) => f.id === frame) || FRAMES[0];
  const activePaperObj = PAPERS.find((p) => p.id === paper) || PAPERS[0];
  const totalPrice = activeSizeObj.basePrice + activeFrameObj.priceDelta + activePaperObj.priceDelta;

  // Canvas dynamic dimensions based on orientation
  const canvasWidth = orientation === 'landscape' ? 560 : 440;
  const canvasHeight = orientation === 'landscape' ? 420 : 540;

  // History tracking
  const handleUpdateStickers = useCallback((newStickers) => {
    setStickers(newStickers);
    setHistory((hPrev) => {
      const sliced = hPrev.slice(0, historyIndex + 1);
      return [...sliced, newStickers];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      setStickers(prev);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setStickers(next);
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleDropStickerToCenter = (type) => {
    const dropX = canvasWidth / 2;
    const dropY = canvasHeight / 2;
    const newSticker = {
      id: `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      x: dropX,
      y: dropY,
      scale: 1.1,
      rotation: 0,
      flipX: false,
    };
    handleUpdateStickers([...stickers, newSticker]);
  };

  const handleAddToCart = () => {
    const customItemId = `CUSTOM-POSTER-${Date.now()}`;
    const frameColor =
      frame === 'oak'
        ? '#d4a373'
        : frame === 'black'
        ? '#1e293b'
        : frame === 'gold'
        ? '#d97706'
        : '#f8fafc';
    const customPosterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f8fafc" rx="8"/>
      <rect x="14" y="14" width="132" height="132" fill="${frameColor}" rx="4"/>
      <rect x="22" y="22" width="116" height="116" fill="#ffffff"/>
      <rect x="30" y="30" width="100" height="100" fill="#0f172a"/>
      <circle cx="80" cy="70" r="22" fill="rgba(255,255,255,0.2)"/>
      <text x="80" y="112" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#ffffff">${(headline || 'POSTER').slice(0, 16).toUpperCase()}</text>
    </svg>`;
    const thumbnailDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(customPosterSvg)}`;

    const customPosterItem = {
      itemid: customItemId,
      productName: `Custom Poster: "${headline}"`,
      manufacturer: 'Cart Gallery Press',
      price: totalPrice,
      image: thumbnailDataUrl,
      isCustom: true,
      customMode: 'poster',
      quantity: 1,
      available: 99,
      customAttributes: {
        Headline: headline,
        Size: activeSizeObj.name,
        Orientation: orientation === 'landscape' ? 'Landscape (Horizontal)' : 'Portrait (Vertical)',
        Palette: artStyle.toUpperCase(),
        Frame: activeFrameObj.name,
        Paper: activePaperObj.name,
        Font: fontFamily.toUpperCase(),
        Stamps: `${stickers.length} Custom Emblems`,
      },
    };

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: customPosterItem },
    });

    trackAddToCart(customPosterItem, 1);
    showToast(`Custom poster "${headline}" added to your bag!`, 'success');
    setIsCartOpen(true);
    speak(
      `Splendid taste! Your ${activeSizeObj.name} framed print "${headline}" will look sensational on the wall!`,
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
                onClick={() => setIsPreviewProofOpen(true)}
                title="View Gallery Proof"
                aria-label="View Gallery Proof"
              >
                <EyePreviewIcon size={14} />
                <span>Gallery Proof</span>
              </button>
              <button
                type="button"
                className={`${styles.bleedBtn} ${showBleed ? styles.bleedBtnActive : ''}`}
                onClick={() => setShowBleed((b) => !b)}
                title="Toggle Print Bleed Guides"
              >
                <span>Bleed Guides</span>
              </button>
            </div>
          </div>

          <div className={styles.canvasContainer}>
            <CanvasEngine
              width={canvasWidth}
              height={canvasHeight}
              mode="poster"
              config={{
                headline,
                subquote,
                artStyle,
                frame,
                fontFamily,
                showBleed,
              }}
              selectedSticker={selectedSticker}
              stickers={stickers}
              onUpdateStickers={handleUpdateStickers}
            />
          </div>

          {/* Sticker Tray with Undo / Redo */}
          <div className={styles.stickerBarWrapper}>
            <StickerBar
              selectedSticker={selectedSticker}
              onSelectSticker={setSelectedSticker}
              onClearStickers={() => handleUpdateStickers([])}
              stickersCount={stickers.length}
              onAddStickerToCenter={handleDropStickerToCenter}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          </div>
        </div>

        {/* Controls Stage */}
        <div className={styles.controlsStage}>
          <div className={styles.paneHeader}>
            <h3>Design Custom Wall Art Poster</h3>
            <p>Giclée pigment print on archival museum-grade fine art stock.</p>
          </div>

          {/* Size Selector */}
          <div className={styles.fieldGroup}>
            <label>Print Dimensions & Format:</label>
            <div className={styles.sizeGrid}>
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.sizeCard} ${size === s.id ? styles.sizeCardActive : ''}`}
                  onClick={() => setSize(s.id)}
                >
                  <div className={styles.sizeTop}>
                    <span className={styles.sizeName}>{s.name}</span>
                    <span className={styles.sizeBadge}>{s.badge}</span>
                  </div>
                  <span className={styles.sizePrice}>${s.basePrice.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation Selector */}
          <div className={styles.fieldGroup}>
            <label>Display Orientation:</label>
            <div className={styles.orientationList}>
              {ORIENTATIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.orientationBtn} ${
                    orientation === o.id ? styles.orientationBtnActive : ''
                  }`}
                  onClick={() => setOrientation(o.id)}
                >
                  <span>{o.label}</span>
                  <span className={styles.ratioPill}>{o.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Headline & Subquote */}
          <div className={styles.fieldGroup}>
            <label htmlFor="posterHeadline">Poster Headline:</label>
            <input
              id="posterHeadline"
              type="text"
              value={headline}
              maxLength={36}
              onChange={(e) => setHeadline(e.target.value)}
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
              onChange={(e) => setSubquote(e.target.value)}
              placeholder="e.g. Dream bigger, explore further..."
              className={styles.textInput}
            />
          </div>

          {/* Typography Style */}
          <div className={styles.fieldGroup}>
            <label>Typography Style:</label>
            <div className={styles.fontList}>
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.fontBtn} ${fontFamily === f.id ? styles.fontBtnActive : ''}`}
                  onClick={() => setFontFamily(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className={styles.fieldGroup}>
            <label>Color Palette:</label>
            <div className={styles.paletteList}>
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.paletteBtn} ${
                    artStyle === p.id ? styles.paletteBtnActive : ''
                  }`}
                  onClick={() => setArtStyle(p.id)}
                >
                  <span
                    className={styles.paletteColorSwatch}
                    style={{ background: p.preview }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Museum Framing Option */}
          <div className={styles.fieldGroup}>
            <label>Museum Framing Option:</label>
            <div className={styles.frameList}>
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.frameCard} ${
                    frame === f.id ? styles.frameCardActive : ''
                  }`}
                  onClick={() => setFrame(f.id)}
                >
                  <div className={styles.frameTop}>
                    <span className={styles.frameName}>{f.name}</span>
                    <span className={styles.frameBadge}>{f.badge}</span>
                  </div>
                  <span className={styles.framePrice}>
                    {f.priceDelta === 0 ? 'Included' : `+ $${f.priceDelta.toFixed(2)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Paper Finish Option */}
          <div className={styles.fieldGroup}>
            <label>Fine Art Paper Stock:</label>
            <div className={styles.paperList}>
              {PAPERS.map((pap) => (
                <button
                  key={pap.id}
                  type="button"
                  className={`${styles.paperCard} ${
                    paper === pap.id ? styles.paperCardActive : ''
                  }`}
                  onClick={() => setPaper(pap.id)}
                >
                  <div className={styles.frameTop}>
                    <span className={styles.frameName}>{pap.name}</span>
                    <span className={styles.frameBadge}>{pap.badge}</span>
                  </div>
                  <span className={styles.framePrice}>
                    {pap.priceDelta === 0 ? 'Included' : `+ $${pap.priceDelta.toFixed(2)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.guaranteeBox}>
            <CheckCircleIcon size={18} />
            <span>Ready to Hang with Premium Hanging Wire & Corner Bumpers Installed</span>
          </div>

          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            aria-label="Add Framed Poster to Bag"
          >
            <span>Add Custom Framed Poster • ${totalPrice.toFixed(2)}</span>
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
                  <strong>{activeSizeObj.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Orientation:</span>
                  <strong>{orientation.toUpperCase()}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Frame:</span>
                  <strong>{activeFrameObj.name}</strong>
                </div>
                <div className={styles.proofSpecItem}>
                  <span>Paper:</span>
                  <strong>{activePaperObj.name}</strong>
                </div>
              </div>

              <div className={styles.proofCanvasWrap}>
                <CanvasEngine
                  width={orientation === 'landscape' ? 480 : 360}
                  height={orientation === 'landscape' ? 360 : 450}
                  mode="poster"
                  config={{
                    headline,
                    subquote,
                    artStyle,
                    frame,
                    fontFamily,
                    showBleed: false,
                  }}
                  selectedSticker={null}
                  stickers={stickers}
                />
              </div>

              <div className={styles.proofModalFooter}>
                <p className={styles.proofDisclaimer}>
                  Certified pigment proof. Hand-inspected and printed with 100% acid-free museum inks.
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
