import { describe, expect, it } from 'vitest';
import catalog from '../data/products.json';
import {
  allowedTypos,
  buildSearchIndex,
  editDistance,
  getHighlightRanges,
  matchesQuery,
  normalizeText,
  searchProducts,
} from '../utils/productSearch';

const sampleProducts = [
  {
    itemid: 'MIC-58',
    productName: 'SM58',
    manufacturer: 'Shure',
    category: 'Audio > Microphones > Dynamic',
    tags: ['vocal', 'live'],
    description: 'Legendary cardioid vocal microphone.',
  },
  {
    itemid: 'PHONE-16',
    productName: 'iPhone 16 Pro',
    manufacturer: 'Apple',
    category: 'Electronics > Phones > Smartphones',
    tags: ['ios'],
    description: 'Titanium smartphone with a pro camera system.',
  },
  {
    itemid: 'LAPTOP-M4',
    productName: 'MacBook Pro M4',
    manufacturer: 'Apple',
    category: 'Electronics > Computers > Laptops',
    tags: ['macos'],
    description: 'Laptop that pairs with your iPhone.',
  },
  {
    itemid: 'SNEAKER-1',
    productName: "Air Jordan 1 Retro High OG 'Lost & Found'",
    manufacturer: 'Nike / Jordan',
    category: 'Footwear > Jordans',
    tags: ['sneakers', 'retro'],
    description: 'Vintage-inspired cracked leather collar.',
  },
  {
    itemid: 'CAFE-1',
    productName: 'Café Crème Espresso Machine',
    manufacturer: 'Brévi',
    category: 'Home > Kitchen',
    tags: [],
    description: '',
  },
];

const names = (results) => results.map((p) => p.itemid);

describe('productSearch', () => {
  describe('normalizeText', () => {
    it('lowercases, strips accents, and drops punctuation', () => {
      expect(normalizeText("Café Crème 'Lost & Found'")).toBe(
        'cafe creme lost found'
      );
      expect(normalizeText(null)).toBe('');
    });
  });

  describe('editDistance', () => {
    it('counts substitutions, insertions, deletions, and swaps', () => {
      expect(editDistance('iphone', 'iphone')).toBe(0);
      expect(editDistance('iphome', 'iphone')).toBe(1);
      expect(editDistance('ipohne', 'iphone')).toBe(1);
      expect(editDistance('iphon', 'iphone')).toBe(1);
      expect(editDistance('kitten', 'sitting')).toBe(3);
    });

    it('stops early past the max', () => {
      expect(editDistance('abc', 'xyzxyz', 1)).toBe(2);
    });
  });

  describe('allowedTypos', () => {
    it('follows length thresholds', () => {
      expect(allowedTypos(3)).toBe(0);
      expect(allowedTypos(4)).toBe(1);
      expect(allowedTypos(8)).toBe(2);
    });
  });

  describe('searchProducts', () => {
    it('returns nothing for an empty query', () => {
      expect(searchProducts(sampleProducts, '   ')).toEqual([]);
      expect(searchProducts(null, 'apple')).toEqual([]);
    });

    it('tolerates typos and swapped letters', () => {
      expect(names(searchProducts(sampleProducts, 'ipohne'))[0]).toBe(
        'PHONE-16'
      );
      expect(names(searchProducts(sampleProducts, 'macbok pro'))[0]).toBe(
        'LAPTOP-M4'
      );
      expect(names(searchProducts(sampleProducts, 'shrue'))).toEqual([
        'MIC-58',
      ]);
    });

    it('matches the last word as a prefix while typing', () => {
      expect(names(searchProducts(sampleProducts, 'air jor'))).toEqual([
        'SNEAKER-1',
      ]);
      expect(names(searchProducts(sampleProducts, 'micro'))).toEqual([
        'MIC-58',
      ]);
    });

    it('does not let short words match through typos', () => {
      expect(searchProducts(sampleProducts, 'smx')).toHaveLength(0);
      expect(searchProducts(sampleProducts, 'zzz')).toHaveLength(0);
    });

    it('requires every query word to match', () => {
      expect(names(searchProducts(sampleProducts, 'apple laptop'))).toEqual([
        'LAPTOP-M4',
      ]);
      expect(searchProducts(sampleProducts, 'apple sneakers')).toEqual([]);
    });

    it('ranks name hits above description hits', () => {
      expect(names(searchProducts(sampleProducts, 'iphone'))).toEqual([
        'PHONE-16',
        'LAPTOP-M4',
      ]);
    });

    it('ignores accents and spacing differences', () => {
      expect(names(searchProducts(sampleProducts, 'cafe creme'))).toEqual([
        'CAFE-1',
      ]);
      expect(names(searchProducts(sampleProducts, 'sm 58'))).toEqual([
        'MIC-58',
      ]);
      expect(names(searchProducts(sampleProducts, 'airjordan'))).toEqual([
        'SNEAKER-1',
      ]);
    });

    it('accepts a prebuilt index and honours the limit', () => {
      const index = buildSearchIndex(sampleProducts);
      expect(searchProducts(index, 'apple', { limit: 1 })).toHaveLength(1);
      expect(names(searchProducts(index, 'apple'))).toEqual([
        'PHONE-16',
        'LAPTOP-M4',
      ]);
    });

    it('finds real catalog products from misspelled queries', () => {
      const index = buildSearchIndex(catalog);
      expect(searchProducts(index, 'jorden')[0].manufacturer).toMatch(/Jordan/);
      expect(searchProducts(index, 'gibsn')[0].productName).toBe('SG Standard');
    });
  });
});

describe('matchesQuery', () => {
  it('applies the fuzzy rules to one product', () => {
    expect(matchesQuery(sampleProducts[0], 'shrue')).toBe(true);
    expect(matchesQuery(sampleProducts[0], 'apple')).toBe(false);
    expect(matchesQuery(sampleProducts[0], '  ')).toBe(true);
    expect(matchesQuery(null, 'shure')).toBe(false);
  });
});

describe('getHighlightRanges', () => {
  const mark = (text, query) => {
    let out = '';
    let cursor = 0;
    getHighlightRanges(text, query).forEach(({ start, end }) => {
      out += `${text.slice(cursor, start)}[${text.slice(start, end)}]`;
      cursor = end;
    });
    return out + text.slice(cursor);
  };

  it('marks whole words for exact and typo matches', () => {
    expect(mark('MacBook Pro M4', 'macbok pro')).toBe('[MacBook] [Pro] M4');
  });

  it('marks only the typed part of a prefix match', () => {
    expect(mark("Air Jordan 1 Retro 'Lost & Found'", 'jordan retr')).toBe(
      "Air [Jordan] 1 [Retr]o 'Lost & Found'"
    );
  });

  it('maps offsets through accents and apostrophes', () => {
    expect(mark('Café Crème', 'cafe cr')).toBe('[Café] [Cr]ème');
    expect(mark("Beyoncé's Mic", 'beyonc')).toBe("[Beyonc]é's Mic");
  });

  it('returns no ranges for an empty query or text', () => {
    expect(getHighlightRanges('iPhone', '')).toEqual([]);
    expect(getHighlightRanges('', 'iphone')).toEqual([]);
  });
});
