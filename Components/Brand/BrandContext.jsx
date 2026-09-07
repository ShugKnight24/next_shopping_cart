import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export const BRAND_VARIANTS = {
  geometric: {
    id: 'geometric',
    name: 'Geometric Monogram',
    badge: 'Modern Luxury',
    tagline: 'Precision Dual-Arc Monogram',
    subtitle: 'SHOPPING MADE SIMPLE',
    description:
      'Precision dual-arc interlocking monogram forming an architectural cart emblem in champagne gold and midnight sapphire.',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimalist Line & Starlight',
    badge: 'Clean Modernist',
    tagline: 'Continuous Stroke & Radiant Jewel',
    subtitle: 'CURATED GOODS & KEEPSAKES',
    description:
      'Aerodynamic single-line continuous cart silhouette centered around a radiant 8-point starlight jewel.',
  },
  crest: {
    id: 'crest',
    name: 'Archival Heritage Crest',
    badge: 'Heritage Luxury',
    tagline: 'Hexagonal Prestige & Star Compass',
    subtitle: 'CURATED LUXURY STOREFRONT',
    description:
      'Hexagonal faceted prestige crest featuring gold filigree cart lattice and an archival navigational star compass.',
  },
};

export const BrandContext = createContext({
  variant: 'geometric',
  setVariant: () => {},
  variants: BRAND_VARIANTS,
  currentInfo: BRAND_VARIANTS.geometric,
});

const STORAGE_KEY = 'cart_commerce_brand_variant';

export function BrandProvider({ children }) {
  const [variant, setVariantState] = useState('geometric');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && BRAND_VARIANTS[saved]) {
        setVariantState(saved);
      }
    } catch {
      // Ignore localStorage access issues in restricted modes
    }
  }, []);

  const setVariant = (newVariant) => {
    if (BRAND_VARIANTS[newVariant]) {
      setVariantState(newVariant);
      try {
        localStorage.setItem(STORAGE_KEY, newVariant);
      } catch {
        // Ignore localStorage error
      }
    }
  };

  const value = {
    variant,
    setVariant,
    variants: BRAND_VARIANTS,
    currentInfo: BRAND_VARIANTS[variant] || BRAND_VARIANTS.geometric,
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
