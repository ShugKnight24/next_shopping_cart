# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] - 2026-09-06

### Added
- **Studios Navigation Submenu & Exposed Storefront Links**:
  - Accessible dropdown menu under "Studios" in `Components/Nav.js` with click, hover, keyboard navigation, and click-outside dismissal.
  - Quick access to both **Custom W2P Studio** (`/studio`) and **Social Media Studio** (`/studio/social` with a "NEW" badge).
  - Directly exposed **Cart Bag** link (`/cart`) in the primary desktop navigation bar.
  - Audited `Components/Footer.js` to replace all placeholder `#` links with active routes (`/products`, `/cart`, `/checkout`, `/favorites`, `/sitemap.xml`) and added a dedicated **Creation Studios** navigation column.
- **Finley The Starlight Fox (*The Little Prince* Homage)**:
  - Celestial desert fox companion registered under `config/mascots.js` (`realm: 'kids'`) inspired by Antoine de Saint-Exupéry's *The Little Prince*.
  - Full vector artwork in `Components/Mascot/MascotArtwork.jsx` (`FoxSvg` and `MascotThumbnail`): sunset-amber fur, bushy white-tipped tail, pointed fennec ears, cream ruff, and flowing celestial sky-blue scarf with golden stars.
  - Heartfelt philosophical quotes (*"It is only with the heart that one can see rightly..."*) and interactive reaction chips (*Secret of Heart*, *Tame Finley*, *Starry Rose*).
  - Integrated into the mascot switcher drawer, companion widget with celestial stardust burst particles (`✦` / `★`), Storybook Studio co-star selector, and Canvas Engine page spread illustration.
- **Figma / Photoshop-Lite Social Studio Canvas Editor**:
  - Upgraded `Components/Studio/SocialStudio.jsx` and `SocialStudio.module.css` into a multi-layer vector canvas editor.
  - **Interactive Drag-and-Drop**: Direct canvas manipulation with bounding box hit-testing and dragging.
  - **Figma Selection Bounding Box**: Dashed outline, 4 corner anchor handles, rotation stem, and live dimension badge tooltip.
  - **Photoshop-Style Layer Stack**: Visual layer hierarchy with visibility toggles, reordering (Bring Forward / Send Backward), duplication, and deletion.
  - **Figma Property Inspector**: Precise controls for transform (X, Y, W, H), typography (font family, font size, weight, text alignment, uppercase, letter spacing), and appearance (fill color, stroke color, border radius, opacity).
  - **Alignment Shortcuts**: 1-click alignment tools (Align Left, Center Horizontally, Align Right, Center Vertically).
  - **Add Element Toolbar**: Quick buttons to add text headings, promotional discount badges, and card containers.
  - **Promotional Flier Preset**: Added standard 3:4 promotional flier format (1200×1600 export) alongside Instagram Square, Story/TikTok, Twitter/X, and Pinterest Pin.

---

## [0.7.0] - 2026-09-06

### Added
- **Luna The Cosmic Shepherd (Default Shop Mascot)**:
  - Modeled after the user's late dog Luna (Anatolian Shepherd) with authentic breed features:
    - Warm golden-fawn coat with cream neck and chest.
    - Signature Anatolian Shepherd black muzzle mask with darker eye contours and folded drop ears.
    - Signature distinctive pinkish/white marking arched across the top ridge of her black nose.
    - White astronaut spacesuit with aerospace gold accents, deep navy collar, and an embroidered **"LUNA"** mission patch.
  - Set as the official default companion for the shop realm (`DEFAULT_SHOP_MASCOT_ID = 'luna'`).
- **Dual-Side Anti-Theft Security Watermarks**:
  - High-security canvas watermark engine in `Components/Studio/CanvasEngine.jsx` protecting both the left and right pages of storybook spreads and canvas quadrants.
  - Repeating angled ribbon banners (`CART COMMERCE • PROOF / PREVIEW ONLY • DO NOT REPRODUCE`) and circular `PROTECTED PROOF` stamps prevent AI upscaling and unauthorized taking of artwork.
- **Illustrated Character Avatars & Sharper Selectors**:
  - Crisp vector illustration avatars rendered in the Mascot Switcher popover and the Storybook Co-Star selector for Luna, Leo, Penny, Dexter Dino, Carty, and Sparky.
  - Full-fidelity storybook canvas illustrations for Dexter Dino and Luna in spacesuit.
- **Interactive Mascot Animations & Reaction Chips**:
  - Click/tap jump reactions with floating particle bursts (stars, paws, sparkles).
  - Dynamic interactive action chips in speech bubbles (*Give Space Treat*, *Cosmic Fact*, *High Paw*).
- **Back-to-Top Button Collision Fix**:
  - Repositioned `.backToTop` above the mascot companion (`bottom: 110px; right: 28px; z-index: 950;`), eliminating all overlap.
- **Cinematic Video Suites & Social Media Creation Studio**:
  - Homepage Brand Sizzle Reel (`EcommerceSizzleReel.jsx`) with 4K motion, timeline scrubbing, dynamic glow, and "Shop The Scene" product hotspots.
  - Behind-The-Scenes Artisan Bookmaking Tour (`KidsStudioVideoTour.jsx`) with companion narration and craft quality pillars.
  - Social Media Creation Studio (`/studio/social`) with multi-platform presets (Instagram, TikTok, X, Pinterest), 1-click catalog import, and OLED smartphone mockup preview.

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
