import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

export const BRAND_VARIANTS = {
  geometric: {
    id: 'geometric',
    name: 'Favicon Badge',
    badge: 'Favicon Match',
    tagline: 'Sapphire Squircle & Starlight Cart',
    subtitle: 'SHOPPING MADE SIMPLE',
    description:
      'The exact deep sapphire squircle emblem from the favicon, with radiant gold shopping cart and starlight jewel.',
  },
  floating: {
    id: 'floating',
    name: 'Floating Minimal Cart',
    badge: 'Clean & Borderless',
    tagline: 'Open Canvas Cart & Starlight',
    subtitle: 'SHOPPING MADE SIMPLE',
    description:
      'The cart and radiant starlight jewel from the favicon, floating cleanly on the canvas without the badge box.',
  },
  soviet: {
    id: 'soviet',
    name: 'Soviet Constructivist',
    badge: 'Constructivist',
    tagline: 'Bold Geometric Poster Art',
    subtitle: 'COMMERCE & INDUSTRY',
    description:
      '1920s Constructivist poster aesthetic with bold 45° diagonal geometry, industrial gear wheels, and a red star accent.',
  },
  edgy: {
    id: 'edgy',
    name: 'Dark & Edgy',
    badge: 'Cyber Streetwear',
    tagline: 'Matte Obsidian & Acid Accent',
    subtitle: 'BLACK LABEL',
    description:
      'Aggressive razor-edge silhouette in matte obsidian black with toxic acid-lime accents and turbine hex wheels.',
  },
  lighthearted: {
    id: 'lighthearted',
    name: 'Lighthearted Pop',
    badge: 'Playful & Bubbly',
    tagline: 'Warm Bouncy Curves',
    subtitle: 'EVERYDAY FINDS',
    description:
      'Approachable bubbly rounded cart with a cheerful bounce tilt, warm sunset palette, and friendly curved geometry.',
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
