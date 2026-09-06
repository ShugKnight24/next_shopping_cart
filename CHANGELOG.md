# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] - 2026-09-06

### Added
- **Anthropomorphic Mascot Companion Engine ("Carty & Friends")**:
  - Decoupled, white-label mascot architecture (`config/mascots.js`) allowing future developers and brands to plug in new characters, themes, and dialogue scripts.
  - Preloaded with two character presets: **Carty The Courier** (e-commerce helper bot with animated antenna and blinking eyes) and **Leo The Story Lion** (children's imagination guide with painter's beret and waving paw).
  - Global `MascotProvider` (`context/MascotProvider.jsx`) managing character state, speech bubbles, and persistent ON/OFF toggle (`localStorage`).
  - Context-aware dialogue responding dynamically to route transitions (`/`, `/products`, `/favorites`, `/studio`), cart events, and studio onboarding.
  - Interactive speech bubble with character switcher popover, dismiss `✕` controls, and persistent ON/OFF toggle pill (`Components/Mascot/MascotCompanion.jsx`).
  - Zero Unicode emojis: 100% scalable vector SVGs with CSS keyframe animations (`Components/Mascot/MascotArtwork.jsx`).
- **Interactive Custom Web-to-Print (W2P) Platform (`/studio`)**:
  - High-performance HTML5 Canvas 2D + SVG composite engine (`Components/Studio/CanvasEngine.jsx`) with 2x retina display scaling, dynamic typography wrapping, and zero external binary dependencies (100% Vercel & Node 24 SSR safe).
  - **Mode 1: Personalized Children's Storybooks**: Child name personalization, reading levels, 4 adventure themes, heartfelt dedication letterpress, 5-page interactive book reader with page flip controls, and decorative sticker stamping.
  - **Mode 2: Custom Framed Art Posters**: Headline typography, quote editor, 4 color palettes, and real-time museum framing simulation (Solid Natural Oak, Matte Black, Gallery White, Frameless).
  - **Mode 3: Kids' Custom Apparel & Kicks**: Organic hoodies, graphic tees, and canvas kicks with real-time monogram embroidery and badge patches.
  - Dynamic vector SVG proof thumbnail generation for instant cart rendering.
- **Cart & Storefront Integration**:
  - Enhanced `store/CartReducer.js` with `ADD_CUSTOM_ITEM` action supporting custom attributes, dynamic proof images, and inventory reconciliation.
  - Enhanced `Components/Cart/CartDrawer.jsx` to render custom item attribute pills (`Hero`, `Theme`, `Binding`, `Frame`, `Embroidery`).
  - Added "Studio W2P" navigational badge in `Components/Nav.js`.
  - Added `/studio` to dynamic XML sitemap in `pages/sitemap.xml.js`.
- **Automated Test Suite Expansion**:
  - Added `__tests__/mascot.test.jsx` (5 tests) and `__tests__/studio.test.jsx` (6 tests), expanding the automated test suite to 100 passing tests across 13 test suites (100% pass rate).

---

## [0.5.0] - 2026-09-06

### Added
- **SEO Rich Snippets, Structured Data & Dynamic XML Sitemap**:
  - Added schema.org `Product` and `BreadcrumbList` JSON-LD structured data on `/products/[productid]` for Google rich snippet display.
  - Added schema.org `WebSite` and `OnlineStore` JSON-LD structured data on `/`.
  - Added comprehensive OpenGraph and Twitter Card social preview meta tags.
  - Added dynamic XML sitemap generator (`pages/sitemap.xml.js`) indexing all 40+ products with dynamic `<lastmod>`, `<changefreq>`, and `<priority>`.
  - Added standard `public/robots.txt` crawler directives pointing to `/sitemap.xml`.
- **Cart Drawer Cross-Sells ("Frequently Paired With")**:
  - Implemented dynamic recommendation shelf in `CartDrawer.jsx` recommending complementary accessories with 1-click `+ Quick Add` and GA4 `trackAddToCart` telemetry.
- **Homepage Discovery & Editorial Storytelling**:
  - Added `FeaturedCategories` visual department discovery grid on homepage (`Components/FeaturedCategories/`).
  - Added `BrandStory` editorial split-screen section (`Components/BrandStory/`) with 3 trust pillars, authenticity certification proof, and zero emojis.
- **Automated Test Suite Expansion**:
  - Added `__tests__/seo.test.js` and `__tests__/homepageSections.test.jsx`, bringing the automated test suite to 88 passing tests across 11 test suites (100% pass rate).

### Security
- **Patched 7 Transitive Vulnerabilities via npm Overrides**:
  - Added `overrides` in `package.json` for `postcss` (8.5.28), `flatted` (3.4.4), `brace-expansion` (1.1.18), and `@humanfs/node` (0.16.8), achieving 0 vulnerabilities in `npm audit`.

---

## [0.4.0] - 2026-09-06

### Added
- **Custom Telemetry & Anti-Bot Detection Engine** (`analytics/telemetry.jsx`):
  - Passive browser automation checks for `navigator.webdriver`, headless globals, and zero-dimension viewports.
  - Behavioral human interaction heuristics tracking mouse movement curvature, human scroll velocity, and typing cadence.
  - Invisible `<HoneypotField />` trap in `pages/_app.js` with instant 100% bot scoring upon automated interaction.
  - Non-blocking beacon dispatcher via `navigator.sendBeacon()` on page visibility change.
- **GA4 Enhanced Ecommerce Suite** (`analytics/google.js`):
  - Added standard ecommerce events: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `apply_promotion`, `search`.
  - Added 3D studio interaction tracking (`studio_3d_interaction`).
  - Added traffic classification user property (`traffic_classification: 'human' | 'suspected_bot'`) for filtering bots in GA4 Exploration reports.
- **Core Web Vitals Telemetry**:
  - Exported `reportWebVitals` in `pages/_app.js` to automatically stream Interaction to Next Paint (INP), LCP, CLS, FCP, and TTFB metrics to GA4.
- **Comprehensive Test Coverage**:
  - Added `__tests__/telemetry.test.jsx` and expanded `__tests__/analytics.test.js`, bringing the test suite to 82 passing tests across 9 test files.

### Changed
- **Node.js 24 Runtime Pinning**:
  - Configured `engines.node: "24.x"` in `package.json` and added `.nvmrc` to resolve discontinued Node.js 18 runtime on Vercel.

---

## [0.3.0] - 2026-09-05

### Added
- **Localized Authentic Product Assets**:
  - Sourced and web-optimized 800x800 studio photos in `/public/images/products/` for `Air Jordan 4 Retro 'Bred Reimagined'`, `Nike Kobe 6 Protro 'Reverse Grinch'`, `Nike LeBron 21 'Akoya'`, and `Sony WH-1000XM5`.
- **Zero-Emoji SVG Icon Library**:
  - Added 20+ custom, accessible vector icons in `Components/Icons/`, replacing all Unicode emojis across the storefront.

### Fixed
- **Stale `localStorage` Hydration Bug**:
  - Replaced blind state overwrite in `CartReducer.js` with a smart catalog inventory reconciler that ensures fresh product titles, images, and prices render on hydration while preserving cart quantities and user favorites.
  - Refactored `CartProvider.jsx` to persist only active cart, promo, and favorites without caching static catalog items.
- **Relative Static Asset Paths**:
  - Fixed relative `../static/img/` paths to `/static/img/` in `data/slides.json`, `data/techItems.json`, and `FullscreenCarousel.jsx`.
- **HTTP 403 Forbidden on External Hotlinks**:
  - Replaced blocked StockX image URLs with local verified assets.
- **Mismatched Headphone Image**:
  - Assigned genuine Sony WH-1000XM5 wireless ANC headphones photo to replace inaccurate Sennheiser photo.

---

## [0.2.0] - 2026-09-05

### Added
- **Interactive 3D Product Studio** (`Product3DStudio.jsx`):
  - 360° orbital turntable with touch & pointer gesture damping.
  - Preset camera angles (3/4 Studio, Side Profile, Top / Laces, Sole / Grip, Heel View).
  - Interactive feature hotspot callout pins with expandable detail modals.
  - Exploded anatomy view mode.
- **Product Detail Layout Overhaul** (`pages/products/[productid].js`):
  - 2-column sticky desktop layout.
  - Sizing/colorway variant selectors with dynamic price modifier recalculation.
  - 5-panel interactive tabs: Overview & Highlights, Specifications, Shipping & Guarantees, Customer Reviews, FAQs.
  - Sticky Buy Bar component (`StickyBuyBar.jsx`) with quick purchase action on scroll.
  - Trust Badges component (`TrustBadges.jsx`) with 4 value-proposition guarantees.
- **Product Catalog Toolbar & Category Tabs** (`CatalogToolbar.jsx`, `CategoryFilterTabs.jsx`):
  - Multi-criteria sorting (Featured, Price: Low to High, Price: High to Low, Rating, Newest).
  - Category tabs with live item count pills across 6 product verticals.
  - In-stock only and On-sale filter toggles.
  - Grid vs. List view switcher.

---

## [0.1.5] - 2026-09-05

### Added
- **Vitest Testing Suite**:
  - Integrated Vitest, `@testing-library/react`, and jsdom with automated unit and integration tests.
  - Added runtime defensive contract resilience for product catalog schemas.
- **Cosmic Hero Animation Switcher**:
  - Added interactive mode switcher with 3 additional animation visualizers.
- **CSS Modules Migration**:
  - Completely migrated styling from Sass to native CSS Modules and design tokens in `styles/tokens.css`.

---

## [0.1.0] - 2021-05-20
- Initial release with Next.js Pages router, CartContext state, Algolia instant search, and basic Google Analytics tracking.
