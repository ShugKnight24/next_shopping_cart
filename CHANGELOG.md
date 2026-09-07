# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.10.0] - 2026-09-06

### Added
- **Modern 3-Variant Brand Logo System (`Components/Logo.jsx`)**:
  - Engineered 3 distinct, modern luxury vector logo marks crafted in pure vector SVG geometry:
    - **Variant A (Geometric Luxury Monogram)**: Precision interlocking dual-arc 'C' monogram forming an architectural cart profile in champagne gold (`#f59e0b` to `#d97706`) and midnight sapphire (`#0f172a` to `#1e293b`), topped with a faceted diamond gem.
    - **Variant B (Minimalist Continuous Line & Starlight)**: Aerodynamic continuous single-stroke cart silhouette centered around a radiant 8-point starlight jewel with micro-hollow wheel bearings.
    - **Variant C (Archival Heritage Crest)**: Hexagonal luxury heraldic crest shield with inset double-rule, gold filigree cart lattice, and an archival navigational star compass crown.
  - **Dynamic Theme Adaptability**: Built native `theme="light"` and `theme="dark"` styling, completely removing legacy CSS filter hacks (`filter: brightness(0) invert(1)` in `Footer.module.css`).
  - **Customizable Wordmark**: High-tracking luxury sans typography (`font-weight: 800`, `letter-spacing: 0.14em`) and customizable subtitle (defaulting to `"SHOPPING MADE SIMPLE"`, `"CURATED GOODS & KEEPSAKES"`, or `"CURATED LUXURY STOREFRONT"`).
- **Global Brand State Management & Persistence (`Components/Brand/BrandContext.jsx`)**:
  - Created `BrandContext` and `BrandProvider` wrapping the root `_app.js` tree.
  - Safely persists active brand variant choice to `localStorage` (`cart_commerce_brand_variant`), dynamically updating all headers, footers, and logo instances across the entire application in real time.
- **Interactive Brand Identity Hub & Showcase (`pages/brand.js`)**:
  - Dedicated brand design system portal at `/brand` featuring side-by-side high-resolution cards of all 3 variants.
  - Live canvas background switcher (Light Storefront vs. Dark Editorial), typography hierarchy documentation, and 1-click "Select This Variant for Store" buttons with animated toast confirmation.
  - Multi-surface consistency showcase presenting the vector favicon, Apple touch icon, and OpenGraph social card.
- **Brand Variant Picker Modal & Nav Trigger (`Components/Brand/BrandVariantPicker.jsx`)**:
  - Interactive modal dialog accessible from the primary desktop navigation bar via a sleek `Brand ✦` trigger button in `Components/Nav.js`.
  - Also linked directly from `Components/Footer.js` under Shop Info ("Brand Identity & Logos").
- **Modern Vector Brand Assets**:
  - **High-Contrast Favicon (`public/favicon.svg`)**: Upgraded to an obsidian squircle with gold rim, precision cart path, and radiant jewel sparkle.
  - **Apple Touch Icon (`public/apple-touch-icon.svg`)**: 180×180 high-res icon with squircle badge, gold border, and starlight jewel for mobile home screens.
  - **Social OpenGraph Banner (`public/static/img/og-preview.svg`)**: 1200×630 editorial showcase banner with geometric grid accents, corner brackets, centered gold emblem, and creation studio feature pills.
  - **Static SVG Logo (`public/static/img/logo.svg`)**: Updated static vector fallback to the modern Geometric Monogram.
- **Archival Legacy Asset Preservation**:
  - Archived original 2020 cyan/red cloud logo to `public/static/img/legacy/logo.svg`.
  - Archived original favicon to `public/static/img/legacy/favicon.svg`.
  - Created `Components/Legacy/LegacyLogo.jsx` component for archival comparison and backwards compatibility.
- **Brand Nomenclature & Copy Cleanliness**:
  - Audited and updated creation studios and video tours to strictly adhere to refined brand nomenclature (replacing all "atelier" terminology with "Craft Studio", "Custom Workshop", and "Flagship Concept").
- **Automated Test Suite Expansion**:
  - Created `__tests__/brandSystem.test.jsx` verifying all 3 logo variants, light/dark themes, subtitle overrides, legacy logo rendering, BrandProvider reactive updates, and modal variant selection.
  - Expanded total test suite to **129 passed tests across 16 test suites** (100% passing).

---

## [0.9.0] - 2026-09-06

### Added
- **Character & Trusty Companion Creator (`Components/Studio/CharacterCreator.jsx`)**:
  - Interactive, dual-tab creator allowing parents and children to customize both the starring hero avatar and their trusty pet companion.
  - **Hero Customizer**: 6 skin tones, 7 procedural hairstyles (`crop`, `curls`, `waves`, `braids`, `ponytail`, `spiky`, `beanie`), 6 hair colors, accessories (`glasses`, `star_shades`, `superhero_mask`, `freckles`, `cape`), and 6 outfit colors.
  - **Companion Customizer**: 7 mascot archetypes (Leo The Story Lion, Princess Penny, Finley Fox, Luna Shepherd, Dexter Dino, Carty Courier, Sparky Hound), custom companion name input, 6 coat colors, collars/bandanas (`star_bandana`, `golden_bell`, `explorer_scarf`, `capelet`, `bowtie`), and 5 superpower badges.
  - **Live Character Proof Card**: Real-time vector SVG card reflecting avatar and pet attributes simultaneously.
  - Embedded seamlessly into Step 4 ("Avatar & Co-Star") and the Fullscreen Studio "Avatar" drawer of `StorybookStudio.jsx`.
  - Integrated into `CanvasEngine.jsx` to procedurally render all 7 hairstyles, accessories, and mascot companions across double-page story spreads.
- **Framed Wall Art Poster Studio — Full Editor Experience (`Components/Studio/PosterStudio.jsx`)**:
  - **Multi-Size Formats**: 12" × 18" ($29.99 Compact), 18" × 24" ($44.99 Classic Exhibition), and 24" × 36" ($59.99 Statement Archival Grand).
  - **Orientation Toggle**: Dynamic switching between Vertical Portrait (3:4) and Horizontal Landscape (4:3) with auto-adapting canvas dimensions and typography.
  - **Museum Framing**: Solid Natural Oak (+$25), Matte Gallery Black (+$20), Gallery Crisp White (+$20), Vintage Florentine Gold (+$30, metallic border and highlights), and Unframed Archival Print.
  - **Fine Art Papers**: 250gsm Archival Cotton Rag, Textured Stretched Canvas (+ $15), and Ultra Semi-Gloss Luster (+ $10).
  - **Color Palettes & Fonts**: Added Sage Botanical and Pacific Sunset palettes alongside Cosmic, Sunburst, Retro, and Minimal; added Modern Sans, Editorial Serif, Impact Display, and Artisan Script typography.
  - **Undo / Redo Layering Stack**: Complete history stack with `Cmd+Z` / `Ctrl+Z` and `Cmd+Shift+Z` / `Ctrl+Y` shortcuts, stamp centering, and sticker manipulation.
  - **Archival Gallery Proof Verification Modal**: Pre-purchase inspection dialog displaying print dimensions, orientation, paper stock, and frame before adding to cart.
- **Kids' Apparel & Kicks Studio — Full Editor Experience (`Components/Studio/ApparelStudio.jsx`)**:
  - **Garment Silhouettes**: Organic Kids' Hoodie ($48.00), Kids' Heavyweight Graphic Tee ($32.00), Kids' Varsity Bomber Jacket ($68.00 with contrast raglan sleeves & snap placket), and Custom Kids' Canvas High-Tops ($65.00 with vulcanized sole & memory foam).
  - **Youth Sizes**: Youth XS (4-5 Yrs), Youth S (6-7 Yrs), Youth M (8-9 Yrs), Youth L (10-12 Yrs), Youth XL (14-16 Yrs).
  - **Interactive Sizing Guide Modal**: Detailed fit chart with age brackets, chest & length measurements, and care instructions.
  - **7 Base Colorways**: Midnight Navy, Heather Slate, Vintage Cream, Forest Pine, Crimson Red, Goldenrod Ochre, Soft Lavender.
  - **Placement Zones**: Center Chest (crest embroidery), Left Pocket (signature insignia), and Hero Backprint (oversized graphic).
  - **Embroidery Typography**: Athletic Block, Heritage Serif, Varsity Bold, Script Signature.
  - **Undo / Redo Layering Stack**: Patch layering with undo/redo history and keyboard shortcuts.
- **Bespoke Scalable Vector SVG Library (`Components/Studio/StudioSVGs.jsx`)**:
  - 100% Zero Unicode Emojis across the entire studio platform.
  - 7 Cute Companions (Luna, Finley, Leo, Penny, Dexter, Carty, Sparky), 5 Story Badges, 6 Props & Wonders, 6 Classic Stamps, and 16 Studio Tool Icons.
- **UI Polish & Button Refinement**:
  - Added `white-space: nowrap` and `flex-shrink: 0` across all stepper buttons, sub-tabs, fullscreen controls, quick action buttons, size pills, color swatches, and orientation selectors in `StorybookStudio.module.css`, `PosterStudio.module.css`, and `ApparelStudio.module.css`.
  - Refined responsive grid layouts preventing overlapping or text truncation on mobile and tablet viewports.
- **Automated Test Suite Expansion**:
  - Added 3 new comprehensive test suites in `__tests__/studio.test.jsx`, expanding automated test coverage to 120 passing tests across 15 test suites (100% pass rate).

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
