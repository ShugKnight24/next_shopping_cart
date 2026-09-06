import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  CATEGORY_DEFINITIONS,
  CategoryFilterTabs,
} from '../Components/Products/CategoryFilterTabs';
import { ProductCard } from '../Components/Products/ProductCard';
import { Badge } from '../Components/UI/Badge';
import { HeroAnimationSwitcher } from '../Components/Hero/HeroAnimationSwitcher';
import { CartContext } from '../context/CartProvider';
import products from '../data/products.json';

describe('Product Card & Category Tabs Tests', () => {
  const mockDispatch = vi.fn();

  const renderProductCard = (customProps = {}) => {
    const defaultProps = {
      available: 5,
      description: 'Dynamic studio microphone with exceptional precision.',
      image: 'https://media.sweetwater.com/images/items/750/SM57-large.jpg',
      favorite: false,
      isInCart: false,
      itemid: 'SM57',
      manufacturer: 'Shure',
      price: 99,
      productName: 'SM57',
      originalPrice: 129,
      badge: 'Bestseller',
      rating: { average: 4.9, count: 2847 },
      cartQuantity: 0,
      ...customProps,
    };

    return render(
      <CartContext.Provider
        value={{ state: { inventory: [], cart: [] }, dispatch: mockDispatch }}
      >
        <ProductCard {...defaultProps} />
      </CartContext.Provider>
    );
  };

  describe('CategoryFilterTabs', () => {
    it('renders all 6 category tabs with zero emojis and proper accessible roles', () => {
      const counts = {
        all: 31,
        sneakers: 9,
        collectibles: 6,
        music: 5,
        fitness: 3,
        tech: 8,
      };

      const handleSelect = vi.fn();
      render(
        <CategoryFilterTabs
          activeCategory="all"
          onSelectCategory={handleSelect}
          categoryCounts={counts}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(6);

      // Verify each tab has SVGs and NO emojis in their text content
      const emojiRegex =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

      tabs.forEach((tab) => {
        expect(tab.textContent).not.toMatch(emojiRegex);
        const svg = tab.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      // Verify category tabs labels
      expect(screen.getByText('All Products')).toBeInTheDocument();
      expect(screen.getByText('Sneakers & Running')).toBeInTheDocument();
      expect(screen.getByText('Collectibles & TCG')).toBeInTheDocument();
      expect(screen.getByText('Musical Instruments')).toBeInTheDocument();
      expect(screen.getByText('Strength & Fitness')).toBeInTheDocument();
      expect(screen.getByText('Audio & Tech')).toBeInTheDocument();
    });

    it('triggers onSelectCategory when clicking category tabs', () => {
      const handleSelect = vi.fn();
      render(
        <CategoryFilterTabs
          activeCategory="all"
          onSelectCategory={handleSelect}
          categoryCounts={{ all: 31, sneakers: 9 }}
        />
      );

      const sneakersTab = screen.getByRole('tab', {
        name: /Sneakers & Running/i,
      });
      fireEvent.click(sneakersTab);
      expect(handleSelect).toHaveBeenCalledWith('sneakers');
    });

    it('accurately partitions products in products.json into categories', () => {
      const sneakerDef = CATEGORY_DEFINITIONS.find((c) => c.id === 'sneakers');
      const collectiblesDef = CATEGORY_DEFINITIONS.find(
        (c) => c.id === 'collectibles'
      );
      const musicDef = CATEGORY_DEFINITIONS.find((c) => c.id === 'music');
      const fitnessDef = CATEGORY_DEFINITIONS.find((c) => c.id === 'fitness');
      const techDef = CATEGORY_DEFINITIONS.find((c) => c.id === 'tech');

      const sneakers = products.filter((p) => sneakerDef.match(p.category));
      const collectibles = products.filter((p) =>
        collectiblesDef.match(p.category)
      );
      const music = products.filter((p) => musicDef.match(p.category));
      const fitness = products.filter((p) => fitnessDef.match(p.category));
      const tech = products.filter((p) => techDef.match(p.category));

      expect(sneakers.length).toBe(9);
      expect(collectibles.length).toBe(6);
      expect(music.length).toBe(5);
      expect(fitness.length).toBe(3);
      expect(tech.length).toBe(8);
      expect(
        sneakers.length +
          collectibles.length +
          music.length +
          fitness.length +
          tech.length
      ).toBe(products.length);
    });
  });

  describe('ProductCard UI & Structure', () => {
    it('renders valid semantic HTML without button inside link or link inside button', () => {
      const { container } = renderProductCard();

      // Ensure no buttons contain an <a> tag
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.querySelector('a')).toBeNull();
      });

      // Ensure no links contain a <button> tag
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.querySelector('button')).toBeNull();
      });

      // View details should be an anchor tag with the action-btn class
      const detailsLink = screen.getByRole('link', { name: /View Details/i });
      expect(detailsLink).toHaveAttribute('href', '/products/SM57');
    });

    it('renders rating stars, discount badge, and original price', () => {
      renderProductCard({
        price: 99,
        originalPrice: 129,
        rating: { average: 4.8, count: 150 },
      });

      expect(screen.getByText('4.8 (150)')).toBeInTheDocument();
      expect(screen.getByText('-23%')).toBeInTheDocument();
      expect(screen.getByText('$129.00')).toBeInTheDocument();
    });

    it('handles add to cart action click', () => {
      renderProductCard();

      const addBtn = screen.getByRole('button', { name: /Add to Cart/i });
      fireEvent.click(addBtn);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_ITEM',
        payload: {
          productId: 'SM57',
          quantity: 1,
        },
      });
    });
  });

  describe('Authentic Asset Verification', () => {
    it('verifies all 25 newly added products have authentic image URLs', () => {
      const authorizedDomains = [
        'cards.scryfall.io',
        'media.sweetwater.com',
        'images.stockx.com',
        'store.storeimages.cdn-apple.com',
        'assets.roguefitness.com',
        'eleiko.com',
        'images.bowflex.com',
        'www.warhammer.com',
      ];

      products.forEach((product) => {
        if (product.image.startsWith('/')) {
          expect(
            product.image.startsWith('/images/') || product.image.startsWith('/static/')
          ).toBe(true);
          const fs = require('fs');
          const path = require('path');
          const exists = fs.existsSync(
            path.join(process.cwd(), 'public', product.image.replace(/^\//, ''))
          );
          expect(
            exists,
            `Local product asset ${product.image} for ${product.itemid} must exist in public/`
          ).toBe(true);
        } else {
          const url = new URL(product.image);
          const isAuthorized = authorizedDomains.some((domain) =>
            url.hostname.includes(domain)
          );
          expect(
            isAuthorized,
            `Product ${product.itemid} has unauthorized or non-authentic image host: ${url.hostname}`
          ).toBe(true);
        }
      });
    });
  });

  describe('Zero Emojis Enforcement', () => {
    const emojiRegex = /\p{Extended_Pictographic}/u;

    it('verifies Badge component renders SVGs without any emojis across all badge types', () => {
      const badgeTypes = ['new', 'sale', 'bestseller', 'limited', 'lowstock'];

      badgeTypes.forEach((type) => {
        const { container } = render(<Badge type={type} showIcon={true} />);
        expect(container.textContent).not.toMatch(emojiRegex);
        const svg = container.querySelector('svg');
        expect(svg, `Badge ${type} is missing an SVG component icon`).toBeInTheDocument();
      });
    });

    it('verifies HeroAnimationSwitcher renders SVGs without emojis across all modes', () => {
      const { container } = render(
        <HeroAnimationSwitcher activeMode="track" onSelectMode={vi.fn()} />
      );

      expect(container.textContent).not.toMatch(emojiRegex);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(4);
    });
  });
});
