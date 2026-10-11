import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

/**
 * One mark, five grounds. Every variant is the same chrome-and-gold cart
 * glyph; only the badge, paint and wordmark treatment change.
 */
export const BRAND_VARIANTS = {
  primary: {
    id: 'primary',
    name: 'Primary Badge',
    badge: 'Default',
    tagline: 'Chrome cart on a navy squircle',
    subtitle: 'SHOPPING MADE SIMPLE',
    usage: 'Header, favicon, app icon, checkout',
    description:
      'The chrome wire cart with its gold grip and plate, set on the navy squircle. The default for every storefront surface.',
  },
  mono: {
    id: 'mono',
    name: 'Minimal Mono',
    badge: 'One colour',
    tagline: 'The glyph alone, in a single ink',
    subtitle: 'SHOPPING MADE SIMPLE',
    usage: 'Receipts, packaging, embossing, watermarks',
    description:
      'The same cart drawn in one ink with no badge. For surfaces that print, stamp or emboss, and anywhere colour would be noise.',
  },
  inverse: {
    id: 'inverse',
    name: 'Midnight Editorial',
    badge: 'Inverse',
    tagline: 'Gold-framed midnight tile, serif wordmark',
    subtitle: 'SHOPPING MADE SIMPLE',
    usage: 'Lookbooks, campaigns, dark editorial pages',
    description:
      'A sharp midnight tile with a gold frame and the serif voice of the homepage headlines. For editorial and campaign moments.',
  },
  studio: {
    id: 'studio',
    name: 'Creation Studio',
    badge: 'Playful',
    tagline: 'Round badge, holo plate, a cart full of ideas',
    subtitle: 'CUSTOM CREATION STUDIO',
    usage: 'Custom Creation Studio, kids’ storybooks, gifting',
    description:
      'The cart turns playful for the studio: a round badge with a holo rim, softened strokes, and a storybook, star and heart on board.',
  },
  crest: {
    id: 'crest',
    name: 'Gold Foil Crest',
    badge: 'Ceremonial',
    tagline: 'Foil-stamped cart on a navy shield',
    subtitle: 'CURATED LUXURY GOODS',
    usage: 'Gift cards, limited drops, certificates',
    description:
      'The cart stamped in gold foil on a navy shield. Reserved for gift cards, limited drops and anything that should feel ceremonial.',
  },
};

/** Ids used by earlier brand systems, mapped onto the current set. */
export const LEGACY_VARIANT_ALIASES = {
  geometric: 'primary',
  badge: 'primary',
  favicon: 'primary',
  sleek: 'primary',
  floating: 'mono',
  edgy: 'inverse',
  lighthearted: 'studio',
  soviet: 'crest',
};

export const DEFAULT_BRAND_VARIANT = 'primary';

/** Resolve any current or legacy variant id; unknown ids fall back to primary. */
export function resolveBrandVariant(id) {
  if (id && BRAND_VARIANTS[id]) return id;
  if (id && LEGACY_VARIANT_ALIASES[id]) return LEGACY_VARIANT_ALIASES[id];
  return DEFAULT_BRAND_VARIANT;
}

export const BrandContext = createContext({
  variant: DEFAULT_BRAND_VARIANT,
  setVariant: () => {},
  variants: BRAND_VARIANTS,
  currentInfo: BRAND_VARIANTS[DEFAULT_BRAND_VARIANT],
});

const STORAGE_KEY = 'cart_commerce_brand_variant';

export function BrandProvider({ children }) {
  const [variant, setVariantState] = useState(DEFAULT_BRAND_VARIANT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const resolved = resolveBrandVariant(saved);
      setVariantState(resolved);
      // Rewrite legacy ids so the stored preference stays current.
      if (resolved !== saved) localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
      // Ignore localStorage access issues in restricted modes
    }
  }, []);

  const setVariant = (newVariant) => {
    if (!BRAND_VARIANTS[newVariant] && !LEGACY_VARIANT_ALIASES[newVariant]) {
      return;
    }
    const resolved = resolveBrandVariant(newVariant);
    setVariantState(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
      // Ignore localStorage error
    }
  };

  const value = {
    variant,
    setVariant,
    variants: BRAND_VARIANTS,
    currentInfo: BRAND_VARIANTS[variant] || BRAND_VARIANTS.primary,
  };

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

BrandProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useBrand() {
  return useContext(BrandContext);
}
