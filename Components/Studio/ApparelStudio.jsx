import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { CheckCircleIcon, SparklesIcon } from '../Icons';
import styles from './ApparelStudio.module.css';

const GARMENTS = [
  { id: 'hoodie', name: "Organic Kids' Hoodie", price: 48.0, badge: 'Organic Cotton' },
  { id: 'tee', name: "Kids' Crewneck Graphic Tee", price: 32.0, badge: 'Heavyweight 240gsm' },
  { id: 'kicks', name: "Custom Kids' Canvas Kicks", price: 65.0, badge: 'Cushioned Insole' },
];

const COLORS = [
  { id: 'navy', name: 'Midnight Navy', hex: '#1e293b' },
  { id: 'slate', name: 'Heather Slate', hex: '#475569' },
  { id: 'cream', name: 'Vintage Cream', hex: '#f1f5f9' },
  { id: 'pine', name: 'Forest Pine', hex: '#064e3b' },
  { id: 'crimson', name: 'Crimson Red', hex: '#991b1b' },
];

export function ApparelStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [garment, setGarment] = useState('hoodie');
  const [colorHex, setColorHex] = useState('#1e293b');
  const [monogram, setMonogram] = useState('NOAH');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);

  const activeGarmentObj = GARMENTS.find((g) => g.id === garment) || GARMENTS[0];
  const activeColorObj = COLORS.find((c) => c.hex === colorHex) || COLORS[0];

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
        Colorway: activeColorObj.name,
        Embroidery: monogram.toUpperCase(),
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
      `Look at those fresh threads! Your custom ${activeGarmentObj.name} is in the bag!`,
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
            <div className={styles.garmentLabel}>
              Garment: <strong>{activeGarmentObj.name}</strong>
            </div>
          </div>

          <CanvasEngine
            width={520}
            height={420}
            mode="apparel"
            config={{
              garment,
              color: colorHex,
              monogram,
            }}
            selectedSticker={selectedSticker}
            stickers={stickers}
            onUpdateStickers={setStickers}
          />

          <StickerBar
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
            onClearStickers={() => setStickers([])}
            stickersCount={stickers.length}
          />
        </div>

        {/* Controls Stage */}
        <div className={styles.controlsStage}>
          <div className={styles.paneHeader}>
            <h3>Customize Kids' Apparel & Kicks</h3>
            <p>Embroidered and assembled with organic, non-toxic materials.</p>
          </div>

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
            <span>High-Density Japanese Satin Stitch Embroidery</span>
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
    </div>
  );
}
