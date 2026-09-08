import { CATEGORY_DEFINITIONS } from '../Components/Products/CategoryFilterTabs';

/**
 * Functional & Declarative Product Filtering and Sorting Pipeline
 *
 * Implements pure functions, curried predicates, and composable pipelines
 * adhering to SOLID (Single Responsibility, Open/Closed) and DRY principles.
 */

/**
 * Curried predicate to filter products by category definition.
 *
 * @param {string} categoryId - Category identifier ('all', 'sneakers', etc.)
 * @returns {(product: object) => boolean}
 */
export const filterByCategory = (categoryId = 'all') => (product) => {
  if (!categoryId || categoryId === 'all') return true;
  if (!product) return false;
  const def = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  return def ? Boolean(def.match(product.category)) : true;
};

/**
 * Curried predicate to filter products by in-stock status.
 *
 * @param {boolean} inStockOnly
 * @returns {(product: object) => boolean}
 */
export const filterByStock = (inStockOnly = false) => (product) => {
  if (!inStockOnly) return true;
  return Boolean(product && typeof product.available === 'number' && product.available > 0);
};

/**
 * Curried predicate to filter products on sale or with active discount badges.
 *
 * @param {boolean} onSaleOnly
 * @returns {(product: object) => boolean}
 */
export const filterBySale = (onSaleOnly = false) => (product) => {
  if (!onSaleOnly) return true;
  if (!product) return false;

  const hasSaleBadge =
    (Array.isArray(product.badges) && product.badges.includes('sale')) ||
    product.badge === 'sale';

  const hasPriceDiscount =
    typeof product.originalPrice === 'number' &&
    typeof product.price === 'number' &&
    product.originalPrice > product.price;

  return Boolean(hasSaleBadge || hasPriceDiscount);
};

/**
 * Curried predicate to filter products by price bracket.
 *
 * @param {string} priceRange - 'all' | 'under100' | '100to500' | '500to1000' | 'over1000'
 * @returns {(product: object) => boolean}
 */
export const filterByPriceRange = (priceRange = 'all') => (product) => {
  if (!priceRange || priceRange === 'all') return true;
  if (!product || typeof product.price !== 'number') return false;

  const price = product.price;
  switch (priceRange) {
    case 'under100':
      return price < 100;
    case '100to500':
      return price >= 100 && price <= 500;
    case '500to1000':
      return price > 500 && price <= 1000;
    case 'over1000':
      return price > 1000;
    default:
      return true;
  }
};

/**
 * Pure search matching predicate to eliminate duplicated query matching logic across components.
 *
 * @param {object} product
 * @param {string} query
 * @returns {boolean}
 */
export const matchesProductQuery = (product, query) => {
  if (!query || typeof query !== 'string') return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (!product || typeof product !== 'object') return false;

  const name = (product.productName || '').toLowerCase();
  const brand = (product.manufacturer || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const id = (product.itemid || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const tags = Array.isArray(product.tags)
    ? product.tags.join(' ').toLowerCase()
    : '';

  return (
    name.includes(q) ||
    brand.includes(q) ||
    desc.includes(q) ||
    id.includes(q) ||
    category.includes(q) ||
    tags.includes(q)
  );
};

/**
 * Curried predicate for search queries.
 *
 * @param {string} searchQuery
 * @returns {(product: object) => boolean}
 */
export const filterBySearchQuery = (searchQuery = '') => (product) =>
  matchesProductQuery(product, searchQuery);

/**
 * Functional predicate combinator: AND conjunction.
 *
 * @param  {...Function} predicates
 * @returns {(item: any) => boolean}
 */
export const composePredicates = (...predicates) => (item) =>
  predicates.every((fn) => fn(item));

/**
 * Pure sorting function for products. Returns a new sorted array.
 *
 * @param {Array<object>} productList
 * @param {string} sortBy - 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name'
 * @returns {Array<object>}
 */
export const sortProducts = (productList = [], sortBy = 'featured') => {
  if (!Array.isArray(productList)) return [];
  const copy = [...productList];

  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'rating':
      return copy.sort(
        (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)
      );
    case 'name':
      return copy.sort((a, b) =>
        (a.productName || '').localeCompare(b.productName || '')
      );
    case 'featured':
    default:
      return copy;
  }
};

/**
 * Calculate product counts for each category definition.
 *
 * @param {Array<object>} inventory
 * @returns {Record<string, number>}
 */
export const calculateCategoryCounts = (inventory = []) => {
  if (!Array.isArray(inventory)) return {};
  const counts = {};

  for (const catDef of CATEGORY_DEFINITIONS) {
    if (catDef.id === 'all') {
      counts.all = inventory.length;
    } else {
      counts[catDef.id] = inventory.filter((item) =>
        catDef.match(item?.category)
      ).length;
    }
  }

  return counts;
};

/**
 * Complete declarative product pipeline.
 *
 * @param {Array<object>} inventory
 * @param {object} options
 * @param {string} [options.activeCategory='all']
 * @param {boolean} [options.inStockOnly=false]
 * @param {boolean} [options.onSaleOnly=false]
 * @param {string} [options.priceRange='all']
 * @param {string} [options.sortBy='featured']
 * @param {string} [options.searchQuery='']
 * @returns {Array<object>}
 */
export const applyProductPipeline = (
  inventory = [],
  {
    activeCategory = 'all',
    inStockOnly = false,
    onSaleOnly = false,
    priceRange = 'all',
    sortBy = 'featured',
    searchQuery = '',
  } = {}
) => {
  if (!Array.isArray(inventory)) return [];

  const combinedPredicate = composePredicates(
    filterByCategory(activeCategory),
    filterByStock(inStockOnly),
    filterBySale(onSaleOnly),
    filterByPriceRange(priceRange),
    filterBySearchQuery(searchQuery)
  );

  const filtered = inventory.filter(combinedPredicate);
  return sortProducts(filtered, sortBy);
};
