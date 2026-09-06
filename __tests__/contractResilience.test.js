import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRODUCT_IMAGE,
  normalizeProduct,
  validateCartState,
  validateProductContract,
} from '../utils/contractResilience';

describe('Contract Resilience & Schema Validation', () => {
  describe('normalizeProduct', () => {
    it('returns a safe fallback product when given null, undefined, or non-object', () => {
      const fallbackNull = normalizeProduct(null);
      expect(fallbackNull).toBeDefined();
      expect(fallbackNull.itemid).toBe('UNKNOWN-ITEM');
      expect(fallbackNull.productName).toBe('Unavailable Product');
      expect(fallbackNull.price).toBe(0);
      expect(fallbackNull.image).toBe(DEFAULT_PRODUCT_IMAGE);
      expect(fallbackNull.images).toEqual([DEFAULT_PRODUCT_IMAGE]);

      const fallbackNumber = normalizeProduct(42);
      expect(fallbackNumber.itemid).toBe('UNKNOWN-ITEM');

      const fallbackArray = normalizeProduct(['malicious', 'array']);
      expect(fallbackArray.itemid).toBe('UNKNOWN-ITEM');
    });

    it('safely parses string prices, symbols, and negative prices', () => {
      const itemWithCurrencyString = normalizeProduct({
        itemid: 'TEST-1',
        productName: 'Sample',
        price: '$199.95',
      });
      expect(itemWithCurrencyString.price).toBe(199.95);

      const itemWithNegativePrice = normalizeProduct({
        itemid: 'TEST-2',
        productName: 'Sample Negative',
        price: -50,
      });
      expect(itemWithNegativePrice.price).toBe(0);

      const itemWithGarbagePrice = normalizeProduct({
        itemid: 'TEST-3',
        productName: 'Garbage Price',
        price: 'not-a-price',
      });
      expect(itemWithGarbagePrice.price).toBe(0);
    });

    it('guarantees images is always an array with at least one valid image', () => {
      const itemNoImages = normalizeProduct({
        itemid: 'TEST-IMG',
        productName: 'No Images',
        image: 'https://example.com/single.jpg',
      });
      expect(itemNoImages.images).toEqual(['https://example.com/single.jpg']);

      const itemEmptyImages = normalizeProduct({
        itemid: 'TEST-EMPTY',
        productName: 'Empty Images',
        images: [],
      });
      expect(itemEmptyImages.images).toEqual([DEFAULT_PRODUCT_IMAGE]);
      expect(itemEmptyImages.image).toBe(DEFAULT_PRODUCT_IMAGE);
    });

    it('clamps rating average between 0 and 5 and defaults count', () => {
      const overRating = normalizeProduct({
        itemid: 'TEST-RATE',
        productName: 'High Rating',
        rating: { average: 9.8, count: 100 },
      });
      expect(overRating.rating.average).toBe(5);
      expect(overRating.rating.count).toBe(100);

      const negativeRating = normalizeProduct({
        itemid: 'TEST-NEG',
        productName: 'Low Rating',
        rating: { average: -2, count: -5 },
      });
      expect(negativeRating.rating.average).toBe(0);
      expect(negativeRating.rating.count).toBe(0);
    });

    it('ensures available stock is non-negative and integer', () => {
      const floatStock = normalizeProduct({
        itemid: 'TEST-STOCK',
        productName: 'Float Stock',
        available: 12.7,
      });
      expect(floatStock.available).toBe(12);

      const negativeStock = normalizeProduct({
        itemid: 'TEST-NEG-STOCK',
        productName: 'Negative Stock',
        available: -10,
      });
      expect(negativeStock.available).toBe(0);
    });

    it('defaults variants to an array and specifications to an object', () => {
      const corruptedStructures = normalizeProduct({
        itemid: 'TEST-STRUCT',
        productName: 'Corrupted Structures',
        variants: 'string-instead-of-array',
        specifications: null,
      });
      expect(Array.isArray(corruptedStructures.variants)).toBe(true);
      expect(corruptedStructures.variants).toEqual([]);
      expect(typeof corruptedStructures.specifications).toBe('object');
      expect(corruptedStructures.specifications).not.toBeNull();
    });
  });

  describe('validateProductContract', () => {
    it('passes a fully compliant product object', () => {
      const validProduct = {
        itemid: 'SM57',
        productName: 'Shure SM57',
        price: 99.0,
        available: 10,
        image: 'https://example.com/sm57.jpg',
        rating: {
          average: 4.9,
          count: 100,
        },
      };
      const result = validateProductContract(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when critical required contract fields are missing or mutated', () => {
      const brokenProduct = {
        itemid: '', // Empty
        productName: null, // Null
        price: 'cheap', // String instead of number
        available: -3, // Negative
      };
      const result = validateProductContract(brokenProduct);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCartState', () => {
    it('repairs corrupted localStorage payload gracefully', () => {
      const corruptPayload = {
        cart: [
          null,
          { itemid: 'ITEM-1', productName: 'Item 1', price: 50, quantity: -2 },
          { itemid: 'ITEM-2', productName: 'Item 2', price: 30, quantity: 150 },
        ],
        favorites: ['SM57', '', null, 'SGS17HCCH'],
        discountCode: 'save10',
        discountPercent: 120, // Over 100%
      };

      const repaired = validateCartState(corruptPayload);
      expect(repaired.cart).toHaveLength(2);
      expect(repaired.cart[0].quantity).toBe(1); // Repaired from -2 to min 1
      expect(repaired.cart[1].quantity).toBe(99); // Clamped to max 99
      expect(repaired.favorites).toEqual(['SM57', 'SGS17HCCH']); // Stripped null & empty
      expect(repaired.discountCode).toBe('SAVE10');
      expect(repaired.discountPercent).toBe(100); // Clamped to max 100
    });
  });
});
