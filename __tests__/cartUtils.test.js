import { describe, expect, it } from 'vitest';
import {
  calculateDiscount,
  formatCurrency,
  totalPrice,
  totalQuantity,
} from '../utils/cartUtils';

describe('cartUtils', () => {
  describe('formatCurrency', () => {
    it('formats standard numbers into currency string with commas and 2 decimals', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99)).toBe('$99.00');
      expect(formatCurrency(1169.5)).toBe('$1,169.50');
      expect(formatCurrency(1250000.99)).toBe('$1,250,000.99');
    });

    it('gracefully handles string numbers and malformed inputs', () => {
      expect(formatCurrency('49.99')).toBe('$49.99');
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency('not-a-number')).toBe('$0.00');
    });
  });

  describe('totalPrice', () => {
    it('calculates total price accurately across cart items', () => {
      const items = [
        { price: 99.0, quantity: 2 }, // 198
        { price: 1000.0, quantity: 1 }, // 1000
      ];
      expect(totalPrice(items)).toBe(1198.0);
    });

    it('handles empty arrays, non-arrays, and malformed items', () => {
      expect(totalPrice([])).toBe(0);
      expect(totalPrice(null)).toBe(0);
      expect(totalPrice([null, { price: 'invalid', quantity: 3 }])).toBe(0);
    });
  });

  describe('totalQuantity', () => {
    it('sums total item quantities', () => {
      const items = [
        { itemid: '1', quantity: 2 },
        { itemid: '2', quantity: 5 },
      ];
      expect(totalQuantity(items)).toBe(7);
    });

    it('handles non-arrays and missing quantities gracefully', () => {
      expect(totalQuantity(null)).toBe(0);
      expect(totalQuantity([{}, { quantity: null }])).toBe(0);
    });
  });

  describe('calculateDiscount', () => {
    it('calculates percentage discount correctly', () => {
      expect(calculateDiscount(200, { discountPercent: 15 })).toBe(30);
      expect(calculateDiscount(100, { discountPercent: 20 })).toBe(20);
    });

    it('returns 0 when promo is null or invalid', () => {
      expect(calculateDiscount(100, null)).toBe(0);
      expect(calculateDiscount(100, {})).toBe(0);
    });
  });
});
