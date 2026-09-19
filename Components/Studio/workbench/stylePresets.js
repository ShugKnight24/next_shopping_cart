/**
 * The style library — the "styles" half of "templates and styles".
 *
 * A template decides where things sit. A preset decides what they look like:
 * palette, typeface pairing, ink, tracking. `apply(layers)` never touches
 * `x`, `y`, `width`, `height` or `rotation`, so the shopper can pick a layout
 * once and then flick through five looks of it without losing the composition.
 *
 * `apply` is pure: it returns a new array of new layer objects and never
 * mutates its input.
 *
 * How a layer is re-coloured
 * --------------------------
 * Rather than making every template carry styling hints, a preset reads the
 * relationship the template already encodes: the *relative luminance* of the
 * colour the template author chose.
 *
 *   - A shape filled dark is a surface that light text sits on  -> `surface`
 *   - A shape filled light or saturated is a block that dark text sits on
 *     -> `bright`
 *   - Text authored light is light in every preset  -> `ink` / `soft` / `muted`
 *   - Text authored dark was knocked out of a bright block, so it stays dark
 *     -> `deep` / `deepSoft`
 *
 * Concentric pairs (a ring and its field, a gilt plate edge and its paper)
 * alternate through `surface`/`surfaceAlt` and `bright`/`brightAlt` in stack
 * order, so a two-shape seal keeps its edge instead of flattening into a disc.
 * Hairlines and thin rules always take the accent.
 */

/* ------------------------------------------------------------ luminance -- */

const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, 0 (black) to 1 (white). */
const luminance = (hex) => {
  const clean = String(hex).replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  if (full.length < 6) return 1;

  return (
    0.2126 * channel(parseInt(full.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(full.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(full.slice(4, 6), 16))
  );
};

/** Below this, a fill is a surface for light type; above it, a block for dark. */
const DARK_THRESHOLD = 0.22;

const isDark = (hex) =>
  typeof hex === 'string' &&
  hex.startsWith('#') &&
  luminance(hex) < DARK_THRESHOLD;

/* ---------------------------------------------------------------- tones -- */

/** Which tone a text slot takes. Anything unrecognised reads as the headline. */
const TEXT_TONE = {
  title: 'ink',
  subtitle: 'soft',
  body: 'soft',
  eyebrow: 'accent',
  badge: 'accent',
  caption: 'muted',
  accent: 'accent',
};

/** Slots set in the display face; everything else takes the reading face. */
const HEADING_ROLES = ['title', 'badge'];

/** A dark-authored slot was knocked out of a bright block — keep it dark. */
const DARK_TONE = {
  ink: 'deep',
  soft: 'deep',
  accent: 'deep',
  muted: 'deepSoft',
};

/** A rule this thin is a hairline, not a panel. */
const HAIRLINE = 6;

/**
 * Build the `apply` function for a spec. Curried so each preset below stays a
 * single readable object rather than a function body.
 */
const restyle = (spec) => (layers) => {
  let brights = 0;
  let surfaces = 0;

  return (layers ?? []).map((layer) => {
    if (layer.type === 'text') {
      const heading = HEADING_ROLES.includes(layer.slotRole);
      const tone = TEXT_TONE[layer.slotRole] ?? 'ink';
      const key = isDark(layer.color) ? (DARK_TONE[tone] ?? 'deep') : tone;

      const next = {
        ...layer,
        color: spec[key] ?? spec.ink,
        fontFamily: heading ? spec.headingFont : spec.bodyFont,
      };

      // Only headings take the preset's tracking and case; the small print
      // keeps the spacing the template author set for it.
      if (heading) {
        if (spec.titleWeight != null) next.fontWeight = spec.titleWeight;
        if (spec.titleTracking != null) next.letterSpacing = spec.titleTracking;
        if (spec.titleTransform != null)
          next.textTransform = spec.titleTransform;
      }

      return next;
    }

    if (layer.type === 'shape') {
      if (Math.min(layer.width, layer.height) <= HAIRLINE) {
        return { ...layer, fill: spec.accent };
      }

      if (isDark(layer.fill)) {
        const fill = surfaces % 2 === 0 ? spec.surface : spec.surfaceAlt;
        surfaces += 1;
        return { ...layer, fill };
      }

      const fill = brights % 2 === 0 ? spec.bright : spec.brightAlt;
      brights += 1;
      return { ...layer, fill };
    }

    if (layer.type === 'art') {
      // A preset that does not declare a tint leaves the stamp's own colours
      // alone; the monochrome presets declare one and flatten everything.
      return { ...layer, tint: 'tint' in spec ? spec.tint : layer.tint };
    }

    return { ...layer };
  });
};

/** Turn a spec into the public preset shape the picker renders. */
const preset = (id, name, description, spec) => ({
  id,
  name,
  description,
  palette: [spec.surface, spec.surfaceAlt, spec.bright, spec.accent, spec.ink],
  fontFamily: spec.headingFont,
  ink: spec.ink,
  accent: spec.accent,
  apply: restyle(spec),
});

/* ========================================================== poster ======= */

const POSTER = [
  preset(
    'poster-gallery-ink',
    'Gallery Ink',
    'Near-black panels, bone-white serif type and one thread of warm gold.',
    {
      headingFont: 'serif',
      bodyFont: 'sans',
      ink: '#f8fafc',
      soft: '#e2e8f0',
      muted: '#94a3b8',
      accent: '#fcd34d',
      deep: '#0f172a',
      deepSoft: '#334155',
      surface: '#0f172a',
      surfaceAlt: '#1e293b',
      bright: '#fcd34d',
      brightAlt: '#fde68a',
    }
  ),
  preset(
    'poster-midnight-neon',
    'Midnight Neon',
    'Indigo and ink with an electric cyan accent, headlines set wide and uppercase.',
    {
      headingFont: 'display',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      titleTracking: 2,
      ink: '#f0f9ff',
      soft: '#bae6fd',
      muted: '#64748b',
      accent: '#22d3ee',
      deep: '#020617',
      deepSoft: '#0f172a',
      surface: '#0b1120',
      surfaceAlt: '#1e1b4b',
      bright: '#22d3ee',
      brightAlt: '#a5f3fc',
    }
  ),
  preset(
    'poster-sun-bleached',
    'Sun Bleached',
    'Burnt terracotta with sand-coloured type, like a poster left in a window.',
    {
      headingFont: 'sans',
      bodyFont: 'sans',
      ink: '#fff7ed',
      soft: '#fed7aa',
      muted: '#fdba74',
      accent: '#fb923c',
      deep: '#7c2d12',
      deepSoft: '#9a3412',
      surface: '#7c2d12',
      surfaceAlt: '#9a3412',
      bright: '#fb923c',
      brightAlt: '#fdba74',
    }
  ),
  preset(
    'poster-nordic-mono',
    'Nordic Mono',
    'Cool greys, no colour at all, headlines tracked out and set light.',
    {
      headingFont: 'sans',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      titleTracking: 6,
      titleWeight: 600,
      tint: '#e5e7eb',
      ink: '#f9fafb',
      soft: '#d1d5db',
      muted: '#6b7280',
      accent: '#9ca3af',
      deep: '#111827',
      deepSoft: '#374151',
      surface: '#1f2937',
      surfaceAlt: '#374151',
      bright: '#d1d5db',
      brightAlt: '#9ca3af',
    }
  ),
  preset(
    'poster-botanic-press',
    'Botanic Press',
    'Deep press-room green with pale leaf accents, set entirely in serif.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      ink: '#f0fdf4',
      soft: '#dcfce7',
      muted: '#86efac',
      accent: '#4ade80',
      deep: '#052e16',
      deepSoft: '#14532d',
      surface: '#14532d',
      surfaceAlt: '#166534',
      bright: '#86efac',
      brightAlt: '#4ade80',
    }
  ),
  preset(
    'poster-candy-pop',
    'Candy Pop',
    'Hot raspberry and butter yellow with big uppercase display headlines.',
    {
      headingFont: 'display',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      ink: '#fff1f2',
      soft: '#fbcfe8',
      muted: '#f9a8d4',
      accent: '#fde68a',
      deep: '#831843',
      deepSoft: '#9d174d',
      surface: '#9d174d',
      surfaceAlt: '#be185d',
      bright: '#fde68a',
      brightAlt: '#fbcfe8',
    }
  ),
  preset(
    'poster-paper-keepsake',
    'Paper Keepsake',
    'The light one: warm paper stock, cocoa ink and a hand-script headline.',
    {
      headingFont: 'cursive',
      bodyFont: 'serif',
      tint: '#b08968',
      ink: '#3f2d16',
      soft: '#5b4a33',
      muted: '#8a7a63',
      accent: '#b08968',
      deep: '#3f2d16',
      deepSoft: '#8a7a63',
      surface: '#e7d9c3',
      surfaceAlt: '#d8c6a8',
      bright: '#faf5ea',
      brightAlt: '#f0e4cd',
    }
  ),
];

/* ========================================================= apparel ======= */

const APPAREL = [
  preset(
    'apparel-varsity-gold',
    'Varsity Gold',
    'Navy field, goldenrod nameplates and heavy tracked-out varsity type.',
    {
      headingFont: 'display',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      titleTracking: 2,
      ink: '#e7e5e4',
      soft: '#e7e5e4',
      muted: '#94a3b8',
      accent: '#fcd34d',
      deep: '#111827',
      deepSoft: '#374151',
      surface: '#1e293b',
      surfaceAlt: '#0f172a',
      bright: '#d97706',
      brightAlt: '#fcd34d',
    }
  ),
  preset(
    'apparel-collegiate-cream',
    'Collegiate Cream',
    'Natural ecru with navy serif lettering and a single crimson accent.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      tint: '#1e293b',
      ink: '#1e293b',
      soft: '#334155',
      muted: '#64748b',
      accent: '#b91c1c',
      deep: '#1e293b',
      deepSoft: '#64748b',
      surface: '#e7e5e4',
      surfaceAlt: '#d6d3d1',
      bright: '#f8fafc',
      brightAlt: '#e7e5e4',
    }
  ),
  preset(
    'apparel-blacktop',
    'Blacktop',
    'Flat black, white stitching and a kelly-green flash, all in one weight.',
    {
      headingFont: 'display',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      titleTracking: 1,
      tint: '#f8fafc',
      ink: '#f8fafc',
      soft: '#d4d4d8',
      muted: '#71717a',
      accent: '#16a34a',
      deep: '#09090b',
      deepSoft: '#3f3f46',
      surface: '#111827',
      surfaceAlt: '#27272a',
      bright: '#16a34a',
      brightAlt: '#86efac',
    }
  ),
  preset(
    'apparel-pastel-play',
    'Pastel Play',
    'Soft violet with rose-quartz trim and friendly rounded sans throughout.',
    {
      headingFont: 'sans',
      bodyFont: 'sans',
      ink: '#faf5ff',
      soft: '#e9d5ff',
      muted: '#c4b5fd',
      accent: '#f9a8d4',
      deep: '#4c1d95',
      deepSoft: '#6d28d9',
      surface: '#5b21b6',
      surfaceAlt: '#7c3aed',
      bright: '#f9a8d4',
      brightAlt: '#fbcfe8',
    }
  ),
  preset(
    'apparel-heritage-rust',
    'Heritage Rust',
    'Washed charcoal and rust, serif lettering, spacing let out a little.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      titleTracking: 3,
      ink: '#f5f5f4',
      soft: '#e7e5e4',
      muted: '#a8a29e',
      accent: '#ea580c',
      deep: '#431407',
      deepSoft: '#7c2d12',
      surface: '#44403c',
      surfaceAlt: '#292524',
      bright: '#ea580c',
      brightAlt: '#fdba74',
    }
  ),
  preset(
    'apparel-neon-street',
    'Neon Street',
    'Ink base with an acid-green print, headlines tightened until they touch.',
    {
      headingFont: 'display',
      bodyFont: 'sans',
      titleTransform: 'uppercase',
      titleTracking: -1,
      tint: '#d9f99d',
      ink: '#f7fee7',
      soft: '#d9f99d',
      muted: '#65a30d',
      accent: '#a3e635',
      deep: '#1a2e05',
      deepSoft: '#365314',
      surface: '#111827',
      surfaceAlt: '#1c1917',
      bright: '#a3e635',
      brightAlt: '#d9f99d',
    }
  ),
  preset(
    'apparel-signature-script',
    'Signature Script',
    'Plum ground, rose thread and a chain-stitched script for every name.',
    {
      headingFont: 'cursive',
      bodyFont: 'sans',
      ink: '#fdf4ff',
      soft: '#f5d0fe',
      muted: '#d8b4fe',
      accent: '#f472b6',
      deep: '#4a044e',
      deepSoft: '#701a75',
      surface: '#3b0764',
      surfaceAlt: '#581c87',
      bright: '#f472b6',
      brightAlt: '#f9a8d4',
    }
  ),
];

/* ============================================================ book ======= */

const BOOK = [
  preset(
    'book-classic-keepsake',
    'Classic Keepsake',
    'Warm paper, cocoa ink and gilt rules — the hardcover on the shelf.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      tint: '#c9a227',
      ink: '#3f2d16',
      soft: '#5b4a33',
      muted: '#8a7a63',
      accent: '#c9a227',
      deep: '#3f2d16',
      deepSoft: '#8a7a63',
      surface: '#f1e6d0',
      surfaceAlt: '#e4d3b4',
      bright: '#faf5ea',
      brightAlt: '#c9a227',
    }
  ),
  preset(
    'book-midnight-voyage',
    'Midnight Voyage',
    'Night-sky navy with starlight type and a pale sky-blue accent.',
    {
      headingFont: 'sans',
      bodyFont: 'serif',
      ink: '#e2e8f0',
      soft: '#cbd5e1',
      muted: '#7c8ba1',
      accent: '#7dd3fc',
      deep: '#0b1120',
      deepSoft: '#1e293b',
      surface: '#0b1120',
      surfaceAlt: '#1e293b',
      bright: '#7dd3fc',
      brightAlt: '#bae6fd',
    }
  ),
  preset(
    'book-storybook-pastel',
    'Storybook Pastel',
    'Raspberry and blush with a looping script title over amber rules.',
    {
      headingFont: 'cursive',
      bodyFont: 'serif',
      ink: '#fff1f2',
      soft: '#fecdd3',
      muted: '#fda4af',
      accent: '#fbbf24',
      deep: '#4c0519',
      deepSoft: '#881337',
      surface: '#9f1239',
      surfaceAlt: '#be123c',
      bright: '#fbbf24',
      brightAlt: '#fecdd3',
    }
  ),
  preset(
    'book-forest-tale',
    'Forest Tale',
    'Deep pine pages, mint prose and an amber lantern of an accent.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      ink: '#f0fdf4',
      soft: '#d1fae5',
      muted: '#6ee7b7',
      accent: '#f59e0b',
      deep: '#022c22',
      deepSoft: '#064e3b',
      surface: '#064e3b',
      surfaceAlt: '#065f46',
      bright: '#f59e0b',
      brightAlt: '#fcd34d',
    }
  ),
  preset(
    'book-bright-modern',
    'Bright Modern',
    'Flat violet blocks, white sans headlines pulled tight, lemon highlights.',
    {
      headingFont: 'sans',
      bodyFont: 'sans',
      titleTracking: -1,
      ink: '#ffffff',
      soft: '#ede9fe',
      muted: '#a78bfa',
      accent: '#fcd34d',
      deep: '#2e1065',
      deepSoft: '#4c1d95',
      surface: '#5b21b6',
      surfaceAlt: '#7c3aed',
      bright: '#fcd34d',
      brightAlt: '#ede9fe',
    }
  ),
  preset(
    'book-sepia-archive',
    'Sepia Archive',
    'Aged paper and sepia ink, as if the book had already been read for years.',
    {
      headingFont: 'serif',
      bodyFont: 'serif',
      tint: '#a6703f',
      ink: '#44352a',
      soft: '#6b5a4a',
      muted: '#9c8b79',
      accent: '#a6703f',
      deep: '#44352a',
      deepSoft: '#9c8b79',
      surface: '#e8dcc8',
      surfaceAlt: '#d9c9ab',
      bright: '#f5ecd9',
      brightAlt: '#a6703f',
    }
  ),
  preset(
    'book-candlelight',
    'Candlelight',
    'Smoke-dark pages, warm ivory prose and an ember-orange accent.',
    {
      headingFont: 'serif',
      bodyFont: 'sans',
      ink: '#fdf6e3',
      soft: '#e7dcc4',
      muted: '#a89b80',
      accent: '#f0a848',
      deep: '#1c1917',
      deepSoft: '#292524',
      surface: '#1c1917',
      surfaceAlt: '#292524',
      bright: '#f0a848',
      brightAlt: '#fbbf24',
    }
  ),
];

/* ========================================================== exports ====== */

export const STYLE_PRESETS = {
  poster: POSTER,
  apparel: APPAREL,
  book: BOOK,
};

export const findStylePreset = (mode, id) =>
  (STYLE_PRESETS[mode] ?? []).find((style) => style.id === id) ?? null;

/** The look a fresh editor opens in. */
export const defaultStylePreset = (mode) =>
  (STYLE_PRESETS[mode] ?? [])[0] ?? null;
