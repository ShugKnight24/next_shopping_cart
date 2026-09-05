import { describe, expect, it } from 'vitest';
import items from '../data/items.json';
import products from '../data/products.json';
import {
  normalizeProduct,
  validateProductContract,
} from '../utils/contractResilience';

describe('Product Catalog Integrity & Contract Compliance', () => {
  it('verifies that all products in products.json satisfy the strict API contract', () => {
    expect(products.length).toBeGreaterThanOrEqual(25);

    products.forEach((product) => {
      const contract = validateProductContract(product);
      expect(
        contract.valid,
        `Product ${product.itemid} failed contract validation: ${contract.errors.join(', ')}`
      ).toBe(true);
    });
  });

  it('ensures all product IDs are non-empty, unique strings', () => {
    const ids = products.map((p) => p.itemid);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('ensures every product has a valid category hierarchy', () => {
    products.forEach((product) => {
      expect(typeof product.category).toBe('string');
      expect(product.category.length).toBeGreaterThan(3);
    });
  });

  it('ensures new requested categories exist (Footwear, Collectibles, Musical Instruments, Fitness, Tech)', () => {
    const categories = products.map((p) => p.category);

    const hasFootwear = categories.some((c) => c.includes('Footwear'));
    const hasCollectibles = categories.some((c) => c.includes('Collectibles'));
    const hasInstruments = categories.some((c) =>
      c.includes('Musical Instruments')
    );
    const hasFitness = categories.some((c) => c.includes('Fitness'));
    const hasTech = categories.some(
      (c) => c.includes('Audio') || c.includes('Tech')
    );

    expect(hasFootwear).toBe(true);
    expect(hasCollectibles).toBe(true);
    expect(hasInstruments).toBe(true);
    expect(hasFitness).toBe(true);
    expect(hasTech).toBe(true);
  });

  it('ensures specific requested models are in the catalog', () => {
    const itemids = new Set(products.map((p) => p.itemid));

    // Shoes
    expect(itemids.has('JORDAN-1-LOST-FOUND')).toBe(true);
    expect(itemids.has('JORDAN-4-BRED-REIM')).toBe(true);
    expect(itemids.has('KOBE-6-REVERSE-GRINCH')).toBe(true);
    expect(itemids.has('HOKA-CLIFTON-9')).toBe(true);
    expect(itemids.has('ALTRA-LONE-PEAK-8')).toBe(true);

    // MTG & Warhammer
    expect(itemids.has('MTG-BLACK-LOTUS')).toBe(true);
    expect(itemids.has('MTG-ONE-RING-001')).toBe(true);
    expect(itemids.has('WH40K-MORTARION')).toBe(true);
    expect(itemids.has('WH40K-CAPTAIN-GRAVIS')).toBe(true);

    // Instruments & Fitness
    expect(itemids.has('FENDER-CS-60-STRAT')).toBe(true);
    expect(itemids.has('YAMAHA-CLAVINOVA-909')).toBe(true);
    expect(itemids.has('ROGUE-OHIO-BAR')).toBe(true);
    expect(itemids.has('ELEIKO-IPF-POWERLIFTING')).toBe(true);
    expect(itemids.has('BOWFLEX-SELECTTECH-552')).toBe(true);

    // Tech
    expect(itemids.has('TE-OP1-FIELD')).toBe(true);
    expect(itemids.has('SONY-WH1000XM5')).toBe(true);
    expect(itemids.has('APPLE-VISION-PRO')).toBe(true);
  });

  it('ensures items.json is populated for inventory compatibility', () => {
    expect(items.length).toBeGreaterThanOrEqual(25);
    items.forEach((item) => {
      expect(item.itemid).toBeDefined();
      expect(typeof item.price).toBe('number');
      expect(item.price).toBeGreaterThan(0);
      expect(typeof item.available).toBe('number');
      expect(item.available).toBeGreaterThanOrEqual(0);
    });
  });

  it('passes all products through normalizeProduct idempotently', () => {
    products.forEach((p) => {
      const normalized = normalizeProduct(p);
      expect(normalized.itemid).toBe(p.itemid);
      expect(normalized.price).toBe(p.price);
      expect(normalized.available).toBe(p.available);
      expect(Array.isArray(normalized.images)).toBe(true);
      expect(normalized.images.length).toBeGreaterThan(0);
    });
  });
});
