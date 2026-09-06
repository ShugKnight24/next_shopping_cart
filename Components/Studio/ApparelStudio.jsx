import { useCallback, useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { CheckCircleIcon, SparklesIcon, CloseIcon } from '../Icons';
import styles from './ApparelStudio.module.css';

const GARMENTS = [
  { id: 'hoodie', name: "Organic Kids' Hoodie", price: 48.0, badge: 'Organic Fleece' },
  { id: 'tee', name: "Kids' Heavyweight Graphic Tee", price: 32.0, badge: '240gsm Cotton' },
  { id: 'jacket', name: "Kids' Varsity Bomber Jacket", price: 68.0, badge: 'Snap Closure' },
  { id: 'kicks', name: "Custom Kids' Canvas High-Tops", price: 65.0, badge: 'Cushioned Insole' },
];

const SIZES = [
  { id: 'Youth XS', age: '4-5 Yrs', chest: '24"-26"' },
  { id: 'Youth S', age: '6-7 Yrs', chest: '26"-28"' },
  { id: 'Youth M', age: '8-9 Yrs', chest: '28"-30"' },
  { id: 'Youth L', age: '10-12 Yrs', chest: '30"-32"' },
  { id: 'Youth XL', age: '14-16 Yrs', chest: '32"-34"' },
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

const PLACEMENTS = [
  { id: 'chest', label: 'Center Chest', desc: 'Full-width embroidery crest' },
  { id: 'pocket', label: 'Left Pocket', desc: 'Subtle left-chest signature' },
  { id: 'back', label: 'Hero Backprint', desc: 'Bold oversized statement' },
];

const FONTS = [
  { id: 'sans', name: 'Athletic Block' },
  { id: 'serif', name: 'Heritage Serif' },
  { id: 'display', name: 'Varsity Bold' },
  { id: 'cursive', name: 'Script Signature' },
];

export function ApparelStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [garment, setGarment] = useState('hoodie');
  const [size, setSize] = useState('Youth S');
  const [colorHex, setColorHex] = useState('#1e293b');
  const [placement, setPlacement] = useState('chest');
  const [fontFamily, setFontFamily] = useState('sans');
  const [monogram, setMonogram] = useState('NOAH');
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);

  // Sticker / Patch & Undo/Redo Layering State
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeGarmentObj = GARMENTS.find((g) => g.id === garment) || GARMENTS[0];
  const activeColorObj = COLORS.find((c) => c.hex === colorHex) || COLORS[0];

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
    const dropX = 260;
    const dropY = 210;
    const newSticker = {
      id: `patch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    const customItemId = `CUSTOM-APPAREL-${Date.now()}`;
    const customApparelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f8fafc" rx="8"/>
      <circle cx="80" cy="140" r="50" fill="rgba(0,0,0,0.06)"/>
      <path d="M50 50 L110 50 L130 90 L115 100 L105 80 L105 130 L55 130 L55 80 L45 100 L30 90 Z" fill="${colorHex}" stroke="#334155" stroke-width="2"/>
      <text x="80" y="96" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#ffffff">${(monogram || 'HERO').slice(0, 8).toUpperCase()}</text>
    </svg>`;
    const thumbnailDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(customApparelSvg)}`;

    const customApparelItem = {
      itemid: customItemId,
      productName: `Custom ${activeGarmentObj.name}: "${monogram}"`,
      manufacturer: 'Cart Atelier Kids',
      price: activeGarmentObj.price,
      image: thumbnailDataUrl,
      isCustom: true,
      customMode: 'apparel',
      quantity: 1,
      available: 99,
      customAttributes: {
        Garment: activeGarmentObj.name,
        Size: size,
        Colorway: activeColorObj.name,
        Placement: placement.toUpperCase(),
        Embroidery: monogram.toUpperCase(),
        Font: fontFamily.toUpperCase(),
        Patches: `${stickers.length} Custom Patches`,
      },
    };

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: customApparelItem },
    });

    trackAddToCart(customApparelItem, 1);
    showToast(`Custom ${activeGarmentObj.name} added to your bag!`, 'success');
    setIsCartOpen(true);
    speak(
      `Look at those fresh threads! Your custom ${activeGarmentObj.name} in size ${size} is in the bag!`,
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
              <span>Live Garment Atelier Preview</span>
            </div>
            <div className={styles.headerRightActions}>
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

          <div className={styles.canvasContainer}>
            <CanvasEngine
              width={520}
              height={420}
              mode="apparel"
              config={{
                garment,
                color: colorHex,
                monogram,
                placement,
                fontFamily,
              }}
              selectedSticker={selectedSticker}
              stickers={stickers}
              onUpdateStickers={handleUpdateStickers}
            />
          </div>

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
            <h3>Customize Kids' Apparel & Kicks</h3>
            <p>Embroidered and assembled with certified organic, child-safe materials.</p>
          </div>

          {/* Garment Silhouette */}
          <div className={styles.fieldGroup}>
            <label>Garment Silhouette:</label>
            <div className={styles.garmentList}>
              {GARMENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`${styles.garmentCard} ${
                    garment === g.id ? styles.garmentCardActive : ''
                  }`}
                  onClick={() => setGarment(g.id)}
                >
                  <div className={styles.garmentTop}>
                    <span className={styles.garmentName}>{g.name}</span>
                    <span className={styles.garmentBadge}>{g.badge}</span>
                  </div>
                  <span className={styles.garmentPrice}>${g.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Youth Size Selector */}
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label>Youth Size:</label>
              <button
                type="button"
                className={styles.sizeGuideLink}
                onClick={() => setIsSizingModalOpen(true)}
              >
                Size Guide
              </button>
            </div>
            <div className={styles.sizePillGrid}>
              {SIZES.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  className={`${styles.sizePillBtn} ${
                    size === sz.id ? styles.sizePillBtnActive : ''
                  }`}
                  onClick={() => setSize(sz.id)}
                  title={`${sz.id} (${sz.age})`}
                >
                  <strong>{sz.id}</strong>
                  <span>{sz.age}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monogram / Inscription */}
          <div className={styles.fieldGroup}>
            <label htmlFor="monogramInput">Monogram or Child Name:</label>
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

          {/* Embroidery Placement */}
          <div className={styles.fieldGroup}>
            <label>Embroidery Placement Zone:</label>
            <div className={styles.placementList}>
              {PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.placementBtn} ${
                    placement === p.id ? styles.placementBtnActive : ''
                  }`}
                  onClick={() => setPlacement(p.id)}
                >
                  <span className={styles.placementLabel}>{p.label}</span>
                  <span className={styles.placementDesc}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Style */}
          <div className={styles.fieldGroup}>
            <label>Embroidery Typography:</label>
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

          {/* Base Colorway */}
          <div className={styles.fieldGroup}>
            <label>Base Colorway:</label>
            <div className={styles.colorSwatches}>
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.swatchBtn} ${
                    colorHex === c.hex ? styles.swatchBtnActive : ''
                  }`}
                  onClick={() => setColorHex(c.hex)}
                  title={c.name}
                  aria-label={`Select ${c.name} colorway`}
                >
                  <span
                    className={styles.swatchCircle}
                    style={{ background: c.hex }}
                  />
                  <span className={styles.swatchName}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.guaranteeBox}>
            <CheckCircleIcon size={18} />
            <span>High-Density Japanese Satin Stitch Embroidery • Pre-Shrunk Organic Cotton</span>
          </div>

          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            aria-label="Add Custom Apparel to Bag"
          >
            <span>Add Custom Apparel to Bag • ${activeGarmentObj.price.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* Sizing Guide Modal */}
      {isSizingModalOpen && (
        <div
          className={styles.sizingModalOverlay}
          role="dialog"
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
                All garments feature a relaxed, modern unisex fit designed with room for growth. Pre-washed to prevent shrinkage.
              </p>
              <table className={styles.sizingTable}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Recommended Age</th>
                    <th>Chest (Inches)</th>
                    <th>Length (Inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Youth XS</td>
                    <td>4 - 5 Yrs</td>
                    <td>24" - 26"</td>
                    <td>18"</td>
                  </tr>
                  <tr>
                    <td>Youth S</td>
                    <td>6 - 7 Yrs</td>
                    <td>26" - 28"</td>
                    <td>20"</td>
                  </tr>
                  <tr>
                    <td>Youth M</td>
                    <td>8 - 9 Yrs</td>
                    <td>28" - 30"</td>
                    <td>22"</td>
                  </tr>
                  <tr>
                    <td>Youth L</td>
                    <td>10 - 12 Yrs</td>
                    <td>30" - 32"</td>
                    <td>24"</td>
                  </tr>
                  <tr>
                    <td>Youth XL</td>
                    <td>14 - 16 Yrs</td>
                    <td>32" - 34"</td>
                    <td>26"</td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.sizingTips}>
                <strong>Care Instructions:</strong>
                <span>Machine wash cold inside out with gentle detergent. Tumble dry low or hang dry to preserve embroidery sheen.</span>
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
