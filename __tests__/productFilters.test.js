import { describe, expect, it } from 'vitest';
import {
  applyProductPipeline,
  calculateCategoryCounts,
  composePredicates,
  filterByCategory,
  filterByPriceRange,
  filterBySale,
  filterBySearchQuery,
  filterByStock,
  matchesProductQuery,
  sortProducts,
} from '../utils/productFilters';

const sampleProducts = [
  {
    itemid: 'SNEAKER-1',
    productName: 'Air Jordan 1 Lost & Found',
    manufacturer: 'Jordan',
    category: 'Footwear > Jordans',
    price: 425,
    originalPrice: 480,
    available: 4,
    badges: ['sale', 'bestseller'],
    rating: { average: 4.9, count: 50 },
    tags: ['sneakers', 'retro'],
  },
  {
    itemid: 'SNEAKER-2',
    productName: 'Pegasus 40 Running Shoes',
    manufacturer: 'Nike',
    category: 'Footwear > Running',
    price: 95,
    originalPrice: 130,
    available: 0, // out of stock
    badge: 'sale',
    rating: { average: 4.5, count: 20 },
    tags: ['running'],
  },
  {
    itemid: 'CARD-1',
    productName: 'Black Lotus Alpha Edition',
    manufacturer: 'Wizards of the Coast',
    category: 'Collectibles > Trading Cards > MTG',
    price: 25000,
    originalPrice: null,
    available: 1,
    badges: ['rare'],
    rating: { average: 5.0, count: 5 },
    tags: ['magic', 'vintage'],
  },
  {
    itemid: 'GUITAR-1',
    productName: 'Fender Stratocaster 1962',
    manufacturer: 'Fender',
    category: 'Musical Instruments > Guitars',
    price: 850,
    originalPrice: null,
    available: 3,
    badges: [],
    rating: { average: 4.8, count: 15 },
    tags: ['music', 'electric'],
  },
  {
    itemid: 'DUMBBELL-1',
    productName: 'Cast Iron Kettlebell 24kg',
    manufacturer: 'Rogue Fitness',
    category: 'Strength & Fitness > Weights',
    price: 75,
    originalPrice: 90,
    available: 10,
    badges: ['sale'],
    rating: { average: 4.7, count: 35 },
    tags: ['weights', 'kettlebell'],
  },
  {
    itemid: 'TECH-1',
    productName: 'Wireless Studio Headphones',
    manufacturer: 'Sony',
    category: 'Audio & Tech > Headphones',
    price: 349,
    originalPrice: 399,
    available: 8,
    badges: [],
    rating: { average: 4.6, count: 80 },
    tags: ['electronics', 'anc'],
  },
];

describe('Functional Product Filter Predicates', () => {
  describe('filterByCategory', () => {
    it('returns true for all category when set to "all"', () => {
      const pred = filterByCategory('all');
      expect(sampleProducts.every(pred)).toBe(true);
    });

    it('filters sneakers and footwear correctly', () => {
      const pred = filterByCategory('sneakers');
      const results = sampleProducts.filter(pred);
      expect(results.length).toBe(2);
      expect(results.map((r) => r.itemid)).toEqual(['SNEAKER-1', 'SNEAKER-2']);
    });

    it('filters collectibles and trading cards correctly', () => {
      const pred = filterByCategory('collectibles');
      const results = sampleProducts.filter(pred);
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('CARD-1');
    });

    it('filters music and guitars correctly', () => {
      const pred = filterByCategory('music');
      const results = sampleProducts.filter(pred);
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('GUITAR-1');
    });

    it('filters strength and fitness correctly', () => {
      const pred = filterByCategory('fitness');
      const results = sampleProducts.filter(pred);
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('DUMBBELL-1');
    });

    it('filters audio and tech correctly', () => {
      const pred = filterByCategory('tech');
      const results = sampleProducts.filter(pred);
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('TECH-1');
    });

    it('safely handles null or undefined products', () => {
      const pred = filterByCategory('sneakers');
      expect(pred(null)).toBe(false);
      expect(pred(undefined)).toBe(false);
    });
  });

  describe('filterByStock', () => {
    it('allows all products when inStockOnly is false', () => {
      const pred = filterByStock(false);
      expect(sampleProducts.every(pred)).toBe(true);
    });

    it('filters out products with available <= 0 when inStockOnly is true', () => {
      const pred = filterByStock(true);
      const inStock = sampleProducts.filter(pred);
      expect(inStock.length).toBe(5);
      expect(inStock.some((i) => i.itemid === 'SNEAKER-2')).toBe(false);
    });

    it('safely handles null product', () => {
      const pred = filterByStock(true);
      expect(pred(null)).toBe(false);
    });
  });

  describe('filterBySale', () => {
    it('allows all products when onSaleOnly is false', () => {
      const pred = filterBySale(false);
      expect(sampleProducts.every(pred)).toBe(true);
    });

    it('matches products with sale badge or discounted price', () => {
      const pred = filterBySale(true);
      const onSale = sampleProducts.filter(pred);
      expect(onSale.length).toBe(4); // SNEAKER-1, SNEAKER-2, DUMBBELL-1, TECH-1
      expect(onSale.map((i) => i.itemid)).toEqual([
        'SNEAKER-1',
        'SNEAKER-2',
        'DUMBBELL-1',
        'TECH-1',
      ]);
    });
  });

  describe('filterByPriceRange', () => {
    it('matches under100 bracket', () => {
      const pred = filterByPriceRange('under100');
      const results = sampleProducts.filter(pred);
      expect(results.map((i) => i.itemid)).toEqual(['SNEAKER-2', 'DUMBBELL-1']);
    });

    it('matches 100to500 bracket', () => {
      const pred = filterByPriceRange('100to500');
      const results = sampleProducts.filter(pred);
      expect(results.map((i) => i.itemid)).toEqual(['SNEAKER-1', 'TECH-1']);
    });

    it('matches 500to1000 bracket', () => {
      const pred = filterByPriceRange('500to1000');
      const results = sampleProducts.filter(pred);
      expect(results.map((i) => i.itemid)).toEqual(['GUITAR-1']);
    });

    it('matches over1000 bracket', () => {
      const pred = filterByPriceRange('over1000');
      const results = sampleProducts.filter(pred);
      expect(results.map((i) => i.itemid)).toEqual(['CARD-1']);
    });

    it('returns true for "all" bracket', () => {
      const pred = filterByPriceRange('all');
      expect(sampleProducts.every(pred)).toBe(true);
    });
  });

  describe('matchesProductQuery & filterBySearchQuery', () => {
    it('matches by product name substring', () => {
      expect(matchesProductQuery(sampleProducts[0], 'jordan')).toBe(true);
      expect(matchesProductQuery(sampleProducts[0], 'stratocaster')).toBe(
        false
      );
    });

    it('matches by manufacturer brand', () => {
      expect(matchesProductQuery(sampleProducts[4], 'rogue')).toBe(true);
    });

    it('matches by tag', () => {
      expect(matchesProductQuery(sampleProducts[2], 'vintage')).toBe(true);
    });

    it('handles case insensitivity and whitespace', () => {
      expect(matchesProductQuery(sampleProducts[5], '   SONY  ')).toBe(true);
    });

    it('returns true when search query is empty string', () => {
      const pred = filterBySearchQuery('');
      expect(sampleProducts.every(pred)).toBe(true);
    });
  });

  describe('composePredicates', () => {
    it('combines multiple predicates with AND logic', () => {
      const isSneaker = filterByCategory('sneakers');
      const isInStock = filterByStock(true);
      const isSale = filterBySale(true);

      const combined = composePredicates(isSneaker, isInStock, isSale);
      const results = sampleProducts.filter(combined);

      // Only SNEAKER-1 is a sneaker, in stock, and on sale
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('SNEAKER-1');
    });
  });

  describe('sortProducts', () => {
    it('sorts by price ascending', () => {
      const sorted = sortProducts(sampleProducts, 'price-asc');
      expect(sorted[0].price).toBe(75);
      expect(sorted[sorted.length - 1].price).toBe(25000);
    });

    it('sorts by price descending', () => {
      const sorted = sortProducts(sampleProducts, 'price-desc');
      expect(sorted[0].price).toBe(25000);
      expect(sorted[sorted.length - 1].price).toBe(75);
    });

    it('sorts by rating average descending', () => {
      const sorted = sortProducts(sampleProducts, 'rating');
      expect(sorted[0].rating.average).toBe(5.0);
    });

    it('sorts by name alphabetical', () => {
      const sorted = sortProducts(sampleProducts, 'name');
      expect(sorted[0].productName).toBe('Air Jordan 1 Lost & Found');
    });

    it('returns empty array when given non-array', () => {
      expect(sortProducts(null)).toEqual([]);
    });
  });

  describe('calculateCategoryCounts', () => {
    it('computes accurate counts across categories', () => {
      const counts = calculateCategoryCounts(sampleProducts);
      expect(counts.all).toBe(6);
      expect(counts.sneakers).toBe(2);
      expect(counts.collectibles).toBe(1);
      expect(counts.music).toBe(1);
      expect(counts.fitness).toBe(1);
      expect(counts.tech).toBe(1);
    });

    it('handles empty array', () => {
      expect(calculateCategoryCounts([])).toEqual({
        all: 0,
        sneakers: 0,
        collectibles: 0,
        music: 0,
        fitness: 0,
        tech: 0,
      });
    });
  });

  describe('applyProductPipeline', () => {
    it('executes complete pipeline with filtering and sorting', () => {
      const results = applyProductPipeline(sampleProducts, {
        activeCategory: 'all',
        inStockOnly: true,
        priceRange: 'under100',
        sortBy: 'name',
      });

      // Under 100 in stock: Cast Iron Kettlebell ($75)
      expect(results.length).toBe(1);
      expect(results[0].itemid).toBe('DUMBBELL-1');
    });

    it('safely handles empty inventory', () => {
      const results = applyProductPipeline([], {
        activeCategory: 'sneakers',
      });
      expect(results).toEqual([]);
    });
  });
});
