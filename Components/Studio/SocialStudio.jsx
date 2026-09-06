import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import products from '../../data/products.json';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import {
  SparklesIcon,
  ChevronLeft,
  CheckCircleIcon,
  CartIcon,
  EyeIcon,
  ShareIcon,
} from '../Icons';
import styles from './SocialStudio.module.css';

const PLATFORMS = [
  {
    id: 'instagram_post',
    name: 'Instagram Square',
    aspect: '1:1',
    width: 440,
    height: 440,
    label: 'Feed Post (1080×1080)',
  },
  {
    id: 'instagram_story',
    name: 'Story & TikTok',
    aspect: '9:16',
    width: 315,
    height: 560,
    label: 'Vertical Reel (1080×1920)',
  },
  {
    id: 'twitter_x',
    name: 'Twitter / X Banner',
    aspect: '16:9',
    width: 520,
    height: 292,
    label: 'Landscape Feed (1200×675)',
  },
  {
    id: 'pinterest_pin',
    name: 'Pinterest Pin',
    aspect: '2:3',
    width: 360,
    height: 540,
    label: 'Product Pin (1000×1500)',
  },
];

const TEMPLATES = [
  {
    id: 'minimal_luxury',
    name: 'Luxury Minimalist',
    badge: 'Editorial',
    desc: 'Understated dark slate elegance, serif typography, and fine gold accents.',
  },
  {
    id: 'hype_drop',
    name: 'Hype Drop Streetwear',
    badge: 'High Energy',
    desc: 'Cyberpunk neon volt accents, industrial tape, and bold drop typography.',
  },
  {
    id: 'flash_sale',
    name: 'Flash Sale & Promo',
    badge: 'Conversion',
    desc: 'Vibrant gradient bursts, discount ribbon, and coupon code callout.',
  },
  {
    id: 'creator_spotlight',
    name: 'Customer Spotlight',
    badge: 'Social Proof',
    desc: '5-star gold ratings, pull quote, and verified customer badge.',
  },
];

const COLOR_THEMES = [
  { id: 'obsidian', name: 'Obsidian Midnight', bg: '#090d16', accent: '#f59e0b' },
  { id: 'luxe_cream', name: 'Alabaster Luxe', bg: '#fdfbf7', accent: '#0f172a' },
  { id: 'cyber_volt', name: 'Cyber Volt', bg: '#050811', accent: '#a3e635' },
  { id: 'electric_blue', name: 'Electric Cobalt', bg: '#030712', accent: '#38bdf8' },
  { id: 'crimson_drop', name: 'Crimson Heat', bg: '#180507', accent: '#ef4444' },
];

export function SocialStudio() {
  const { setMascot, speak } = useMascot();
  const { showToast } = useToast();

  const canvasRef = useRef(null);

  // Studio State
  const [selectedPlatform, setSelectedPlatform] = useState('instagram_post');
  const [selectedTemplate, setSelectedTemplate] = useState('minimal_luxury');
  const [selectedColorTheme, setSelectedColorTheme] = useState('obsidian');

  // Selected Catalog Product
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.itemid || 'SM57');

  // Editable Post Elements
  const activeProduct = useMemo(
    () => products.find((p) => p.itemid === selectedProductId) || products[0] || {},
    [selectedProductId]
  );
  const [headline, setHeadline] = useState(
    activeProduct.productName ? `${activeProduct.productName.toUpperCase()} IS BACK` : 'EXCLUSIVE DROP'
  );
  const [subtext, setSubtext] = useState(
    activeProduct.shortDescription || 'Crafted with premium materials. Available in limited quantities.'
  );
  const [priceTag, setPriceTag] = useState(`$${activeProduct.price || 99}`);
  const [badgeText, setBadgeText] = useState('OFFICIAL DROP');
  const [ctaText, setCtaText] = useState('SHOP COLLECTION');
  const [promoCode, setPromoCode] = useState('DROP2026');
  const [showPhoneMockup, setShowPhoneMockup] = useState(false);

  // Set mascot companion to Sparky (Hype Streetwear Hound)
  useEffect(() => {
    setMascot('sparky');
    speak(
      "What's good! I'm Sparky! Pick your platform, grab a product from the vault, and let's craft a viral social post!",
      'happy'
    );
  }, [setMascot, speak]);

  // When product selection changes, update editable fields
  const handleSelectProduct = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    const prod = products.find((p) => p.itemid === id);
    if (prod) {
      setHeadline(`${prod.productName.toUpperCase()} ARCHIVE`);
      setSubtext(prod.shortDescription || prod.description.slice(0, 80));
      setPriceTag(`$${prod.price}`);
      setBadgeText(prod.badges?.[0] || 'BESTSELLER');
      speak(`Loaded "${prod.productName}" into your social template! Ready to roll!`, 'guiding');
    }
  };

  const activePlatformObj =
    PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const activeColorThemeObj =
    COLOR_THEMES.find((c) => c.id === selectedColorTheme) || COLOR_THEMES[0];

  // Render Canvas
  const renderSocialCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = activePlatformObj;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const isLight = activeColorThemeObj.id === 'luxe_cream';
    const textColor = isLight ? '#0f172a' : '#ffffff';
    const subtextColor = isLight ? '#475569' : '#94a3b8';
    const accentColor = activeColorThemeObj.accent;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (selectedColorTheme === 'cyber_volt') {
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(1, '#052e16');
    } else if (selectedColorTheme === 'crimson_drop') {
      bgGrad.addColorStop(0, '#0f0204');
      bgGrad.addColorStop(1, '#450a0a');
    } else if (selectedColorTheme === 'electric_blue') {
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(1, '#082f49');
    } else if (isLight) {
      bgGrad.addColorStop(0, '#fdfbf7');
      bgGrad.addColorStop(1, '#f1f5f9');
    } else {
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // TEMPLATE 1: MINIMAL LUXURY
    if (selectedTemplate === 'minimal_luxury') {
      // Elegant Border Inset
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      ctx.strokeStyle = accentColor;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Top Brand Header
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        (activeProduct.manufacturer || 'CART ATELIER').toUpperCase() + ' • EDITION 2026',
        width / 2,
        42
      );

      // Center Product Stage Circle
      const centerY = height * 0.45;
      const orbGrad = ctx.createRadialGradient(
        width / 2,
        centerY,
        10,
        width / 2,
        centerY,
        width * 0.35
      );
      orbGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(width / 2, centerY, width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Vector Product Silhouette Art
      ctx.fillStyle = isLight ? '#1e293b' : '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 60, centerY - 45, 120, 90, 12);
      ctx.fill();

      ctx.fillStyle = isLight ? '#f1f5f9' : '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeProduct.productName?.slice(0, 16) || 'PRODUCT', width / 2, centerY + 4);

      // Badge Pill
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 50, centerY + 60, 100, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(badgeText.toUpperCase(), width / 2, centerY + 74);

      // Bottom Typography
      ctx.fillStyle = textColor;
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(headline.toUpperCase(), width / 2, height - 90);

      ctx.fillStyle = subtextColor;
      ctx.font = '11px sans-serif';
      ctx.fillText(subtext.slice(0, 48), width / 2, height - 68);

      // Price & CTA
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${priceTag}  |  ${ctaText}`, width / 2, height - 42);
    }

    // TEMPLATE 2: HYPE DROP
    else if (selectedTemplate === 'hype_drop') {
      // Diagonal Caution Lines
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.18)';
      ctx.lineWidth = 14;
      for (let x = -width; x < width * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }

      // Drop Banner Header
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(0, 0, width, 32);
      ctx.fillStyle = '#000000';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ CONFIRMED DROP • LIMITED ARCHIVE RELEASE ⚠', width / 2, 21);

      // Huge Bold Headline
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headline.toUpperCase(), width / 2, 85);

      // Product Visual Centerpiece
      const centerY = height * 0.48;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 75, centerY - 60, 150, 120, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(activeProduct.productName?.slice(0, 14) || 'VAULT PIECE', width / 2, centerY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('SKU: ' + activeProduct.itemid, width / 2, centerY + 20);

      // Glowing Badge
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 60, centerY + 75, 120, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(badgeText.toUpperCase(), width / 2, centerY + 91);

      // Subtext
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(subtext.slice(0, 48), width / 2, height - 60);

      // CTA Box
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(width / 2 - 90, height - 42, 180, 30);
      ctx.fillStyle = '#000000';
      ctx.font = '900 12px sans-serif';
      ctx.fillText(`${ctaText} • ${priceTag}`, width / 2, height - 22);
    }

    // TEMPLATE 3: FLASH SALE
    else if (selectedTemplate === 'flash_sale') {
      // Angled Sale Ribbon
      ctx.save();
      ctx.translate(width - 55, 30);
      ctx.rotate((45 * Math.PI) / 180);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-100, -14, 200, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SALE', 0, 4);
      ctx.restore();

      // Top Tag
      ctx.fillStyle = accentColor;
      ctx.font = '900 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ FLASH SALE IS LIVE', 24, 45);

      // Headline
      ctx.fillStyle = textColor;
      ctx.font = '900 24px sans-serif';
      ctx.fillText(headline.toUpperCase(), 24, 80);

      // Product Visual
      const centerY = height * 0.46;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 70, centerY - 55, 140, 110, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeProduct.productName?.slice(0, 16) || 'PRODUCT', width / 2, centerY);

      // Promo Code Box
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      if (ctx.setLineDash) ctx.setLineDash([4, 3]);
      ctx.strokeRect(width / 2 - 80, centerY + 70, 160, 28);
      if (ctx.setLineDash) ctx.setLineDash([]);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`USE CODE: ${promoCode}`, width / 2, centerY + 88);

      // Price Tag Highlight
      ctx.fillStyle = '#10b981';
      ctx.font = '900 22px sans-serif';
      ctx.fillText(priceTag, width / 2, height - 60);

      // CTA Button
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 85, height - 42, 170, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(ctaText, width / 2, height - 24);
    }

    // TEMPLATE 4: CREATOR SPOTLIGHT
    else {
      // 5 Gold Stars
      ctx.fillStyle = '#f59e0b';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★★★★★', width / 2, 48);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('VERIFIED CUSTOMER REVIEW', width / 2, 68);

      // Pull Quote
      ctx.fillStyle = textColor;
      ctx.font = 'italic bold 16px serif';
      ctx.fillText(`"${subtext.slice(0, 50)}..."`, width / 2, 105);

      // Product Spotlight
      const centerY = height * 0.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 65, centerY - 45, 130, 90, 12);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(activeProduct.productName?.slice(0, 16) || 'PRODUCT', width / 2, centerY + 2);

      // Badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`✓ ${badgeText.toUpperCase()}`, width / 2, centerY + 65);

      // Headline and Pricing
      ctx.fillStyle = textColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(headline.toUpperCase(), width / 2, height - 70);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${priceTag} • ${ctaText}`, width / 2, height - 42);
    }
  }, [
    activePlatformObj,
    activeColorThemeObj,
    selectedTemplate,
    selectedColorTheme,
    activeProduct,
    headline,
    subtext,
    priceTag,
    badgeText,
    ctaText,
    promoCode,
  ]);

  useEffect(() => {
    renderSocialCanvas();
  }, [renderSocialCanvas]);

  // Export 1: High-Res PNG Download
  const handleDownloadPost = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `social-${selectedPlatform}-${activeProduct.itemid || 'post'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Social marketing asset downloaded in high-res PNG!', 'success');
      speak("High-res post exported! You're ready to publish and crush it!", 'celebrating');
    } catch {
      showToast('Unable to export image in this environment', 'error');
    }
  };

  // Export 2: Copy Caption & Hashtags
  const handleCopyCaption = () => {
    const captionText = `🔥 ${activeProduct.productName} by ${
      activeProduct.manufacturer
    } is now live! Available for ${priceTag}. ${
      promoCode ? `Use code ${promoCode} at checkout.` : ''
    } Tap link in bio to secure yours before it sells out! ⚡️\n\n#${activeProduct.manufacturer || 'CartCommerce'} #Streetwear #NewArrivals #Ecommerce #ExclusiveDrop #ShopNow`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(captionText);
      showToast('Caption & hashtags copied to clipboard!', 'success');
      speak('Caption copied! Ready to paste into Instagram, TikTok, or X!', 'happy');
    }
  };

  return (
    <>
      <Head>
        <title>Social Media Creation Studio | Cart Commerce Marketing Workshop</title>
        <meta
          name="description"
          content="Generate high-converting marketing posts for Instagram, TikTok, Twitter/X, and Pinterest. 1-click product catalog import and export print-ready assets."
        />
      </Head>

      <div className={styles.socialStudioRoot}>
        {/* Top Header */}
        <header className={styles.studioHeader}>
          <div className={styles.headerLeft}>
            <Link href="/studio" className={styles.backLink}>
              <ChevronLeft size={16} />
              <span>Back to Creation Studio</span>
            </Link>
            <div className={styles.badgeRow}>
              <span className={styles.proBadge}>
                <SparklesIcon size={12} />
                <span>Store Owner & Creator Workshop</span>
              </span>
            </div>
            <h1 className={styles.headerTitle}>Social Media Creation Studio</h1>
            <p className={styles.headerSubtitle}>
              Transform store catalog products into scroll-stopping marketing assets for Instagram, TikTok,
              X, and Pinterest in seconds.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.mockupToggleBtn}
              onClick={() => setShowPhoneMockup((prev) => !prev)}
              aria-label="Toggle smartphone mockup preview"
            >
              <EyeIcon size={16} />
              <span>{showPhoneMockup ? 'Hide Phone Frame' : 'Phone Mockup'}</span>
            </button>
            <button
              type="button"
              className={styles.primaryExportBtn}
              onClick={handleDownloadPost}
              aria-label="Download social post PNG"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Post (PNG)</span>
            </button>
          </div>
        </header>

        {/* Studio Grid */}
        <div className={styles.studioGrid}>
          {/* Left Column: Live Canvas Preview Stage */}
          <div className={styles.stageColumn}>
            <div className={styles.previewHeader}>
              <div className={styles.platformBadge}>
                <strong>{activePlatformObj.name}</strong>
                <span>{activePlatformObj.label}</span>
              </div>
              <button
                type="button"
                className={styles.copyCaptionBtn}
                onClick={handleCopyCaption}
                title="Copy ready-to-post caption & hashtags"
                aria-label="Copy post caption to clipboard"
              >
                <ShareIcon size={13} />
                <span>Copy Caption</span>
              </button>
            </div>

            {/* Canvas Stage Container */}
            <div
              className={`${styles.canvasContainer} ${
                showPhoneMockup ? styles.phoneMockupFrame : ''
              }`}
            >
              {showPhoneMockup && (
                <div className={styles.phoneNotch}>
                  <span className={styles.phoneTime}>9:41</span>
                  <div className={styles.phoneSpeaker} />
                  <span className={styles.phoneBattery}>100%</span>
                </div>
              )}

              <canvas
                ref={canvasRef}
                style={{
                  width: `${activePlatformObj.width}px`,
                  height: `${activePlatformObj.height}px`,
                }}
                className={styles.socialCanvas}
                aria-label="Social media post canvas preview"
              />

              {showPhoneMockup && (
                <div className={styles.mockupFeedBar}>
                  <div className={styles.feedIcons}>
                    <span>❤️ 1,420</span>
                    <span>💬 84</span>
                    <span>↗ 29</span>
                  </div>
                  <span className={styles.feedShopTag}>
                    <CartIcon size={12} /> View Product
                  </span>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className={styles.tipsBox}>
              <CheckCircleIcon size={16} />
              <span>
                Exported at 2× retina scale for crisp display on mobile OLED screens and social feeds.
              </span>
            </div>
          </div>

          {/* Right Column: Customization Controls Form */}
          <div className={styles.controlsColumn}>
            {/* 1. Target Platform Preset */}
            <section className={styles.controlSection}>
              <h2 className={styles.sectionHeading}>1. Select Target Social Platform</h2>
              <div className={styles.platformGrid}>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.platformCard} ${
                      selectedPlatform === p.id ? styles.platformCardActive : ''
                    }`}
                    onClick={() => setSelectedPlatform(p.id)}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.aspect}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. 1-Click Product Catalog Selector */}
            <section className={styles.controlSection}>
              <h2 className={styles.sectionHeading}>2. Import from Store Catalog</h2>
              <div className={styles.productSelectBox}>
                <label htmlFor="productCatalogSelect">Choose Catalog Product:</label>
                <select
                  id="productCatalogSelect"
                  value={selectedProductId}
                  onChange={handleSelectProduct}
                  className={styles.productSelectDropdown}
                >
                  {products.map((p) => (
                    <option key={p.itemid} value={p.itemid}>
                      {p.productName} — ${p.price} ({p.manufacturer})
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* 3. Designer Template Selection */}
            <section className={styles.controlSection}>
              <h2 className={styles.sectionHeading}>3. Designer Post Template</h2>
              <div className={styles.templateGrid}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.templateCard} ${
                      selectedTemplate === t.id ? styles.templateCardActive : ''
                    }`}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <div className={styles.templateCardTop}>
                      <span className={styles.templateName}>{t.name}</span>
                      <span className={styles.templateBadge}>{t.badge}</span>
                    </div>
                    <p className={styles.templateDesc}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* 4. Color Palette */}
            <section className={styles.controlSection}>
              <h2 className={styles.sectionHeading}>4. Color Palette & Mood</h2>
              <div className={styles.paletteRow}>
                {COLOR_THEMES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.paletteBtn} ${
                      selectedColorTheme === c.id ? styles.paletteBtnActive : ''
                    }`}
                    style={{ backgroundColor: c.bg, borderColor: c.accent }}
                    onClick={() => setSelectedColorTheme(c.id)}
                    title={c.name}
                    aria-label={`Select ${c.name} color palette`}
                  >
                    <span
                      className={styles.swatchAccentDot}
                      style={{ backgroundColor: c.accent }}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* 5. Editable Post Text & Promo */}
            <section className={styles.controlSection}>
              <h2 className={styles.sectionHeading}>5. Customize Post Content</h2>

              <div className={styles.fieldGrid}>
                <div className={styles.fieldItem}>
                  <label htmlFor="postHeadlineInput">Headline:</label>
                  <input
                    id="postHeadlineInput"
                    type="text"
                    value={headline}
                    maxLength={32}
                    onChange={(e) => setHeadline(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.fieldItem}>
                  <label htmlFor="postPriceInput">Price Callout:</label>
                  <input
                    id="postPriceInput"
                    type="text"
                    value={priceTag}
                    maxLength={14}
                    onChange={(e) => setPriceTag(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.fieldItem}>
                  <label htmlFor="postBadgeInput">Badge Stamp:</label>
                  <input
                    id="postBadgeInput"
                    type="text"
                    value={badgeText}
                    maxLength={18}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.fieldItem}>
                  <label htmlFor="postCtaInput">Call to Action:</label>
                  <input
                    id="postCtaInput"
                    type="text"
                    value={ctaText}
                    maxLength={20}
                    onChange={(e) => setCtaText(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                {selectedTemplate === 'flash_sale' && (
                  <div className={styles.fieldItem}>
                    <label htmlFor="postPromoInput">Promo Coupon Code:</label>
                    <input
                      id="postPromoInput"
                      type="text"
                      value={promoCode}
                      maxLength={14}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                )}
              </div>

              <div className={styles.fieldItemFull}>
                <label htmlFor="postSubtextInput">Post Subtext / Description:</label>
                <textarea
                  id="postSubtextInput"
                  rows={2}
                  value={subtext}
                  maxLength={100}
                  onChange={(e) => setSubtext(e.target.value)}
                  className={styles.textareaField}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
