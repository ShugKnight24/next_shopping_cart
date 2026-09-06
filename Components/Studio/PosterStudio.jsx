import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { CheckCircleIcon, SparklesIcon } from '../Icons';
import styles from './PosterStudio.module.css';

const PALETTES = [
  { id: 'cosmic', name: 'Midnight Cosmic', preview: '#0f172a' },
  { id: 'sunburst', name: 'Sunburst Amber', preview: '#f59e0b' },
  { id: 'retro', name: 'Neon Retro', preview: '#db2777' },
  { id: 'minimal', name: 'Nordic Slate', preview: '#64748b' },
];

const FRAMES = [
  { id: 'oak', name: 'Solid Natural Oak', priceDelta: 25, badge: 'Best Seller' },
  { id: 'black', name: 'Matte Gallery Black', priceDelta: 20, badge: 'Modern' },
  { id: 'white', name: 'Gallery Crisp White', priceDelta: 20, badge: 'Clean' },
  { id: 'none', name: 'Unframed Archival Print', priceDelta: 0, badge: 'Print Only' },
];

const BASE_PRICE = 29.99;

export function PosterStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak } = useMascot();
  const { showToast } = useToast();

  const [headline, setHeadline] = useState('REACH FOR THE STARS');
  const [subquote, setSubquote] = useState(
    'Dream bigger, explore further, and shine bright.'
  );
  const [artStyle, setArtStyle] = useState('cosmic');
  const [frame, setFrame] = useState('oak');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);

  const activeFrameObj = FRAMES.find((f) => f.id === frame) || FRAMES[0];
  const totalPrice = BASE_PRICE + activeFrameObj.priceDelta;

  const handleAddToCart = () => {
    const customItemId = `CUSTOM-POSTER-${Date.now()}`;
    const frameColor = frame === 'oak' ? '#d4a373' : frame === 'black' ? '#1e293b' : '#f8fafc';
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
        Palette: artStyle.toUpperCase(),
        Frame: activeFrameObj.name,
        Paper: '250gsm Archival Cotton Rag',
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
      `Splendid taste! Your framed print "${headline}" will look sensational on the wall!`,
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
            <div className={styles.frameLabel}>
              Frame: <strong>{activeFrameObj.name}</strong>
            </div>
          </div>

          <CanvasEngine
            width={520}
            height={420}
            mode="poster"
            config={{
              headline,
              subquote,
              artStyle,
              frame,
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
            <h3>Design Custom Wall Art Poster</h3>
            <p>Archival giclée pigment print on 250gsm fine art cotton paper.</p>
          </div>

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

          <div className={styles.guaranteeBox}>
            <CheckCircleIcon size={18} />
            <span>Ready to Hang with Premium Hanging Wire Installed</span>
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
    </div>
  );
}
