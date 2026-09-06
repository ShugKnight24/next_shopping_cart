# Cart Commerce — Premium Next.js E-Commerce Storefront

A high-performance, white-label e-commerce storefront built with **Next.js 15**, **React 19**, and **Node 24**. Engineered with an interactive **3D Product Studio**, context-driven state management with smart catalog hydration reconciliation, a 100% vector SVG icon system, client-side anti-bot telemetry, and Google Analytics 4 (GA4) Enhanced Ecommerce tracking.

---

## Highlights & Features

- **Interactive 3D Product Studio**: 360° orbital turntable with touch & drag gesture physics, preset camera angles, animated feature hotspot pins, and exploded anatomy view mode.
- **Modern Product Detail Experience**: 2-column sticky desktop layout, variant/colorway selectors with dynamic pricing modifiers, stock urgency indicators, 5-panel interactive tabs (Overview, Specs, Shipping, Reviews with rating breakdown bars, FAQs), and a sticky purchase bar.
- **Curated Multi-Vertical Catalog**: 40+ verified items spanning 6 product categories:
  - *Sneakers & Running* (Air Jordan, Nike Kobe, LeBron, Hoka, Altra)
  - *Collectibles & TCG* (Warhammer 40k, Magic: The Gathering)
  - *Musical Instruments* (Gibson, Fender Custom Shop, Martin, Nord, Yamaha)
  - *Strength & Fitness* (Rogue, Eleiko, Bowflex)
  - *Audio & Tech* (Sony, Sennheiser, Apple Vision Pro, Teenage Engineering)
- **Zero-Emoji Compliance**: Fully replaced Unicode emojis with a dedicated, accessible SVG icon library (`Components/Icons/`).
- **Smart Catalog Hydration Reconciler**: Eliminates stale browser cache overwrites by reconciling fresh product metadata on client load while safely preserving the shopper's active cart quantities, available stock deductions, and saved favorites.
- **Client-Side Anti-Bot Telemetry**: Passive browser environment checks (`navigator.webdriver`, headless globals, viewport anomalies), human behavioral heuristics (mouse curvature, scroll pauses, typing cadence), and invisible honeypot trap detection to classify traffic (`human` vs `suspected_bot`).
- **GA4 Enhanced Ecommerce & Core Web Vitals**: End-to-end ecommerce instrumentation (`view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `apply_promotion`, `search`) and native Next.js `reportWebVitals` telemetry (INP, LCP, CLS, FCP, TTFB).
- **Zero Sass / Modern Styling**: Refactored entirely to CSS Modules and a centralized design token system (`styles/tokens.css`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (`15.5.25`) with Pages Router & Static Site Generation (SSG) |
| **UI Library** | React 19 (`19.2.8`) & React DOM |
| **Runtime** | Node.js 24 (`24.x`) |
| **State Management** | React Context API (`CartContext`) + Reducer pattern (`CartReducer.js`) |
| **Styling** | Native CSS Modules + Design Tokens (`tokens.css`) |
| **Icons** | Custom Scalable Vector SVGs with zero emoji dependencies |
| **Analytics & Telemetry** | GA4 Enhanced Ecommerce (`gtag.js`), Next.js Web Vitals, Custom Bot Scorer |
| **Testing** | Vitest 5 + `@testing-library/react` + `@testing-library/jest-dom` (82 tests) |
| **Code Quality** | ESLint 9 (Flat Config) + Prettier |

---

## Getting Started

### Prerequisites

- **Node.js**: `24.x` (or `>=20.x`)
- **npm**: `>=10.x`

### Installation

```bash
# Clone the repository
git clone https://github.com/ShugKnight24/next_shopping_cart.git
cd next_shopping_cart

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Environment Variables

Copy `.example.env` to `.env.local`:

```bash
cp .example.env .env.local
```

Configure your environment variables:

```env
# Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX)
NEXT_PUBLIC_GOOGLE_ANALYTICS=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Optional: Custom Telemetry Beacon Ingestion Endpoint
NEXT_PUBLIC_TELEMETRY_ENDPOINT=
```

---

## Scripts & Commands

```bash
npm run dev        # Launch development server on localhost:3000
npm run build      # Create optimized production build (pre-renders 47 SSG routes)
npm run start      # Start Next.js production server
npm run lint       # Run ESLint across all codebase files (0 errors, 0 warnings)
npm test           # Run Vitest test suite once across all 9 test files (82 tests)
npm run test:watch # Run Vitest in interactive watch mode
```

---

## Architecture & Data Flow

```
Shopper Interactions
  │
  ├── Catalog / Home Page ───► Category Tabs & Search Filter
  │                              │
  │                              ├── ProductCard (QuickView, Add to Cart)
  │                              └── View Details ──► /products/[productid]
  │
  ├── Product Details ───────► 3D Product Studio (360° Turntable, Hotspots, Exploded View)
  │                              ├── Variant / Sizing Selector
  │                              ├── Sticky Buy Bar
  │                              └── 5-Panel Tab System (Overview, Specs, Reviews, FAQs)
  │
  ├── Cart & Bag ────────────► CartProvider & CartReducer
  │                              ├── Smart Catalog Reconciler (on hydration)
  │                              ├── LocalStorage Cache (Cart items, Promos, Favorites)
  │                              └── Slide-Over Cart Drawer
  │
  └── Analytics & Security ──► Telemetry Engine (Bot Scoring, Honeypot Trap)
                                 ├── GA4 Enhanced Ecommerce (gtag.js)
                                 └── Next.js reportWebVitals (INP, LCP, CLS, TTFB)
```

---

## Testing & Quality Assurance

All core systems are rigorously tested with Vitest:

- `__tests__/telemetry.test.jsx`: Bot confidence index, automation detection, honeypot traps, and session metrics.
- `__tests__/analytics.test.js`: GA4 event schemas, ecommerce tracking, and Core Web Vitals formatting.
- `__tests__/CartReducer.test.js`: Cart operations, inventory deduction, promo codes, and catalog reconciliation.
- `__tests__/ProductDetailAndCatalog.test.jsx`: 3D studio, tabs, and product detail rendering.
- `__tests__/ProductCardAndFilter.test.jsx`: Category tabs, card semantics, zero-emoji badges, and asset verification.
- `__tests__/contractResilience.test.js`: Defensive schema parsing and fallback resilience.

---

## Deployment (Vercel)

This repository is configured for automated deployments on Vercel:
- **Node.js Runtime**: Set to `24.x` in `package.json` (`engines.node`) and `.nvmrc`.
- **Image Optimization**: Remote image domains configured in `next.config.js`.
- **Production Build**: Zero build-step errors with all 47 static pages prerendered.

---

## Documentation

- [Changelog](./CHANGELOG.md) — Chronological history of all releases and enhancements.
- [Product Roadmap](./ROADMAP.md) — Long-term architecture roadmap and sprint plan.
