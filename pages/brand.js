import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { BRAND_VARIANTS, useBrand } from '../Components/Brand/BrandContext';
import { BrandMark } from '../Components/Brand/BrandMark';
import styles from '../Components/Brand/BrandPage.module.css';
import { PixelPreview } from '../Components/Brand/PixelPreview';
import { CartCommerceMark } from '../Components/Hero/CartCommerceMark';
import { LegacyLogo } from '../Components/Legacy/LegacyLogo';
import { Logo } from '../Components/Logo';
import { useToast } from '../Components/UI/Toast';
import { SITE_URL } from '../utils/site';

const PALETTE = [
  { name: 'Sapphire Navy', token: '--color-primary', hex: '#1E3A5F' },
  { name: 'Midnight', token: '--color-primary-dark', hex: '#0F2744' },
  { name: 'Navy Light', token: '--color-primary-light', hex: '#2D5A87' },
  { name: 'Champagne Gold', token: '--color-gold', hex: '#B8860B' },
  { name: 'Gold Light', token: '--color-gold-light', hex: '#DAA520' },
  { name: 'Gold Deep', token: '--color-gold-hover', hex: '#996515' },
  { name: 'Platinum', token: '--color-platinum', hex: '#A8A9AD' },
  { name: 'Paper', token: '--color-surface', hex: '#FFFFFF' },
];

const FINISHES = [
  {
    name: 'Chrome wire',
    note: 'Basket, rim, posts and wheels',
    className: 'swatchChrome',
  },
  {
    name: 'Gold grip & plate',
    note: 'The only gold on the cart',
    className: 'swatchGold',
  },
  { name: 'Foil', note: 'Crest variant only', className: 'swatchFoil' },
  { name: 'Holo', note: 'Studio variant only', className: 'swatchHolo' },
];

const ANATOMY = [
  'Gold grip — the signature. Always gold, never recoloured.',
  'Chrome wire basket, drawn at the hero cart’s 0.42 : −0.3 oblique.',
  'Gold plate on the square-on long side, where the hero cart wears its name.',
  'Two front wheels on a 4px grid so they stay round at small sizes.',
];

const DONTS = [
  { label: 'Don’t stretch or squash', style: { transform: 'scaleX(1.35)' } },
  { label: 'Don’t rotate the lockup', style: { transform: 'rotate(-12deg)' } },
  {
    label: 'Don’t recolour the gold',
    style: { filter: 'hue-rotate(150deg) saturate(1.6)' },
  },
  {
    label: 'Don’t add effects',
    style: { filter: 'drop-shadow(0 0 6px #ff00aa) blur(0.4px)' },
  },
];

export default function BrandPage() {
  const { variant: activeVariant, setVariant } = useBrand();
  const [previewTheme, setPreviewTheme] = useState('light');
  const toast = useToast();

  const handleSelectVariant = (variantId) => {
    setVariant(variantId);
    const msg = `Active brand set to ${BRAND_VARIANTS[variantId].name}. Header and footer updated.`;
    if (toast?.success) {
      toast.success(msg);
    } else if (toast?.addToast) {
      toast.addToast({ message: msg, type: 'success' });
    }
  };

  return (
    <>
      <Head>
        <title>Brand Identity &amp; Logo System | Cart Commerce</title>
        <meta
          name="description"
          content="The Cart Commerce identity: one chrome-and-gold cart mark, its lockups, five on-brand variants, colour, typography and icon sizes."
        />
        <meta property="og:title" content="Brand Identity | Cart Commerce" />
        <meta
          property="og:description"
          content="One chrome-and-gold cart, every surface."
        />
        <meta
          property="og:image"
          content={`${SITE_URL}/static/img/og-preview.png`}
        />
      </Head>

      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Brand Identity</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Design system · 2026 refresh</span>
            <h1 className={styles.heroTitle}>
              Brand Identity &amp; Logo System
            </h1>
            <p className={styles.heroLead}>
              One chrome-and-gold cart, drawn once and used everywhere — from a
              16px browser tab to the homepage hero. Five variants change the
              ground it sits on, never the cart itself.
            </p>
          </div>
          <div className={styles.heroStage}>
            <Logo variant="primary" theme="dark" className={styles.heroLogo} />
          </div>
        </header>

        {/* The mark */}
        <section className={styles.section} aria-labelledby="mark-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>01 · The mark</span>
            <h2 id="mark-heading">Built from the hero cart</h2>
            <p>
              The glyph is the homepage’s three-quarter chrome cart reduced to a
              64-unit grid: same oblique, same gold grip, same gold plate.
            </p>
          </div>
          <div className={styles.markGrid}>
            <figure className={`${styles.stage} ${styles.stageDark}`}>
              <CartCommerceMark className={styles.heroMark} tagline="" />
              <figcaption>Hero illustration</figcaption>
            </figure>
            <figure className={`${styles.stage} ${styles.stageDark}`}>
              <BrandMark size={168} title="Cart Commerce mark" />
              <figcaption>Primary mark</figcaption>
            </figure>
            <ol className={styles.anatomy}>
              {ANATOMY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Lockups */}
        <section className={styles.section} aria-labelledby="lockup-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>02 · Lockups</span>
            <h2 id="lockup-heading">Horizontal, stacked, mark</h2>
            <p>
              The wordmark is set to a fixed 208-unit measure and the subtitle
              tracks out to the same edge, so the lockup holds its shape in any
              font fallback.
            </p>
          </div>
          <div className={styles.lockupGrid}>
            <div className={`${styles.stage} ${styles.stageLight}`}>
              <Logo variant="primary" className={styles.lockupWide} />
            </div>
            <div className={`${styles.stage} ${styles.stageDark}`}>
              <Logo
                variant="primary"
                theme="dark"
                className={styles.lockupWide}
              />
            </div>
            <div className={`${styles.stage} ${styles.stageLight}`}>
              <Logo
                variant="primary"
                layout="stacked"
                className={styles.lockupStacked}
              />
            </div>
            <div className={`${styles.stage} ${styles.stageDark}`}>
              <Logo
                variant="primary"
                theme="dark"
                layout="stacked"
                className={styles.lockupStacked}
              />
            </div>
          </div>

          <div className={styles.rulesGrid}>
            <div className={styles.ruleCard}>
              <h3>Clear space</h3>
              <div className={styles.clearSpace}>
                <div className={styles.clearSpaceInner}>
                  <Logo variant="primary" className={styles.lockupWide} />
                </div>
              </div>
              <p>
                Keep a quarter of the mark’s height clear on every side — the
                length of the gold grip.
              </p>
            </div>
            <div className={styles.ruleCard}>
              <h3>Minimum size</h3>
              <div className={styles.minSizes}>
                <div>
                  <Logo variant="primary" size="sm" style={{ width: 132 }} />
                  <span>Lockup · 132px wide</span>
                </div>
                <div>
                  <BrandMark size={16} />
                  <span>Mark · 16px</span>
                </div>
              </div>
              <p>
                Below 32px the mark switches to its micro drawing: fewer wires,
                strokes snapped to whole pixels.
              </p>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className={styles.section} aria-labelledby="variant-heading">
          <div className={styles.sectionHeadRow}>
            <div className={styles.sectionHead}>
              <span className={styles.kicker}>03 · Variants</span>
              <h2 id="variant-heading">One mark, five grounds</h2>
              <p>
                Each variant is the same cart for a specific job. The one you
                select here becomes the store’s header and footer logo.
              </p>
            </div>
            <div className={styles.segmented} role="group" aria-label="Preview">
              <button
                type="button"
                aria-pressed={previewTheme === 'light'}
                onClick={() => setPreviewTheme('light')}
              >
                Light Storefront
              </button>
              <button
                type="button"
                aria-pressed={previewTheme === 'dark'}
                onClick={() => setPreviewTheme('dark')}
              >
                Dark Editorial
              </button>
            </div>
          </div>

          <div className={styles.variantGrid}>
            {Object.values(BRAND_VARIANTS).map((variant) => {
              const isActive = activeVariant === variant.id;
              return (
                <article
                  key={variant.id}
                  className={`${styles.variantCard} ${isActive ? styles.variantCardActive : ''}`}
                >
                  <div
                    className={`${styles.variantStage} ${
                      previewTheme === 'dark'
                        ? styles.stageDark
                        : styles.stageLight
                    }`}
                  >
                    <Logo
                      variant={variant.id}
                      theme={previewTheme}
                      className={styles.lockupCard}
                    />
                  </div>
                  <div className={styles.variantBody}>
                    <span className={styles.variantTag}>{variant.badge}</span>
                    <h3>{variant.name}</h3>
                    <p>{variant.description}</p>
                    <p className={styles.variantUsage}>
                      <strong>Use for</strong> {variant.usage}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.variantButton}
                    onClick={() => handleSelectVariant(variant.id)}
                    disabled={isActive}
                  >
                    {isActive ? 'Active store brand' : 'Use for store'}
                  </button>
                </article>
              );
            })}
          </div>

          <div className={styles.markRow}>
            {Object.values(BRAND_VARIANTS).map((variant) => (
              <figure key={variant.id}>
                <BrandMark
                  variant={variant.id}
                  theme="dark"
                  size={72}
                  title={`${variant.name} mark`}
                />
                <figcaption>{variant.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Icons */}
        <section className={styles.section} aria-labelledby="icon-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>04 · Icons</span>
            <h2 id="icon-heading">Favicon &amp; app icon</h2>
            <p>
              The favicon uses the micro drawing: every horizontal edge sits on
              a pixel row at 16px, so the rim, plate and wheels stay crisp.
            </p>
          </div>
          <div className={styles.iconGrid}>
            <figure className={styles.iconCard}>
              <div className={styles.iconSizes}>
                <img src="/favicon.svg" alt="" width="16" height="16" />
                <img src="/favicon.svg" alt="" width="32" height="32" />
                <img
                  src="/apple-touch-icon.png"
                  alt="Apple touch icon at 180px"
                  width="180"
                  height="180"
                  className={styles.touchIcon}
                />
              </div>
              <figcaption>
                Actual size · 16, 32 and 180px
                <code>/favicon.svg · /apple-touch-icon.png</code>
              </figcaption>
            </figure>
            <figure className={styles.iconCard}>
              <div className={styles.iconSizes}>
                <PixelPreview src="/favicon.svg" size={16} zoom={8} />
                <PixelPreview src="/favicon.svg" size={32} zoom={4} />
              </div>
              <figcaption>
                Rasterised at 16 and 32px, magnified
                <code>Each square is one screen pixel</code>
              </figcaption>
            </figure>
            <figure className={styles.iconCard}>
              <div className={styles.tabMock}>
                <span className={styles.tab}>
                  <img src="/favicon.svg" alt="" width="16" height="16" />
                  Cart Commerce
                </span>
                <span className={`${styles.tab} ${styles.tabDark}`}>
                  <img src="/favicon.svg" alt="" width="16" height="16" />
                  Cart Commerce
                </span>
              </div>
              <figcaption>
                In a browser tab, light and dark
                <code>Badge carries its own ground</code>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Colour */}
        <section className={styles.section} aria-labelledby="colour-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>05 · Colour</span>
            <h2 id="colour-heading">Navy, gold, chrome</h2>
            <p>
              Flat colours come from <code>styles/tokens.css</code>. Chrome and
              gold are finishes, used only on the mark.
            </p>
          </div>
          <div className={styles.paletteGrid}>
            {PALETTE.map((c) => (
              <div key={c.token} className={styles.swatch}>
                <span
                  className={styles.swatchChip}
                  style={{ background: `var(${c.token})` }}
                />
                <strong>{c.name}</strong>
                <code>{c.token}</code>
                <code>{c.hex}</code>
              </div>
            ))}
          </div>
          <div className={styles.finishGrid}>
            {FINISHES.map((f) => (
              <div key={f.name} className={styles.swatch}>
                <span
                  className={`${styles.swatchChip} ${styles[f.className]}`}
                />
                <strong>{f.name}</strong>
                <span>{f.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className={styles.section} aria-labelledby="type-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>06 · Typography</span>
            <h2 id="type-heading">Wordmark &amp; voice</h2>
          </div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <span className={styles.typeSampleSans}>CART COMMERCE</span>
              <p>
                Wordmark · <code>--font-sans</code> ExtraBold 800, set to a
                208-unit measure (≈0.11em tracking).
              </p>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeSampleSub}>SHOPPING MADE SIMPLE</span>
              <p>
                Subtitle · Bold 700 at 40% of the wordmark size, tracked flush
                to the wordmark’s right edge. Gold Deep on light, Gold Light on
                navy.
              </p>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeSampleSerif}>Shop smarter.</span>
              <p>
                Editorial · <code>--font-serif</code> Bold, for headlines and
                the Midnight Editorial wordmark.
              </p>
            </div>
          </div>
        </section>

        {/* Do / Don't */}
        <section className={styles.section} aria-labelledby="usage-heading">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>07 · Usage</span>
            <h2 id="usage-heading">Do &amp; don’t</h2>
          </div>
          <div className={styles.usageGrid}>
            <figure className={`${styles.usageCard} ${styles.usageDo}`}>
              <div className={`${styles.usageStage} ${styles.stageLight}`}>
                <Logo variant="primary" className={styles.lockupCard} />
              </div>
              <figcaption>Do · Primary on white or paper</figcaption>
            </figure>
            <figure className={`${styles.usageCard} ${styles.usageDo}`}>
              <div className={`${styles.usageStage} ${styles.stageDark}`}>
                <Logo
                  variant="primary"
                  theme="dark"
                  className={styles.lockupCard}
                />
              </div>
              <figcaption>Do · Dark theme wordmark on navy</figcaption>
            </figure>
            {DONTS.map((d) => (
              <figure
                key={d.label}
                className={`${styles.usageCard} ${styles.usageDont}`}
              >
                <div className={`${styles.usageStage} ${styles.stageLight}`}>
                  <Logo
                    variant="primary"
                    className={styles.lockupCard}
                    style={d.style}
                  />
                </div>
                <figcaption>{d.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Legacy */}
        <section className={styles.legacy}>
          <div>
            <span className={styles.kicker}>Archive</span>
            <h3>Original 2020 logo</h3>
            <p>
              Preserved in <code>public/static/img/legacy/logo.svg</code> and
              rendered by <code>Components/Legacy/LegacyLogo.jsx</code>.
            </p>
          </div>
          <div className={styles.legacyLogo}>
            <LegacyLogo />
          </div>
        </section>
      </div>
    </>
  );
}
