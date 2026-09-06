import PropTypes from 'prop-types';
import { useContext, useMemo, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { getCurrentItem } from '../../utils/getItem';
import { SearchIcon } from '../Icons';
import { InstantSearch } from '../InstantSearch/InstantSearch';
import { CatalogToolbar } from './CatalogToolbar';
import { CategoryFilterTabs, CATEGORY_DEFINITIONS } from './CategoryFilterTabs';
import { ProductCard } from './ProductCard';
import styles from './Products.module.css';

export function Products({
  setSelectedProduct,
  setRecommendedProduct,
  showToolbar = true,
}) {
  const { state } = useContext(CartContext);
  const { inventory, cart } = state;
  const [showHitsClosed, setShowHitsClosed] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Toolbar state
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  function closeInstantSearch(event) {
    const element = document.querySelector('.instant-search-container');
    if (event.target !== element && !element?.contains(event.target)) {
      setShowHitsClosed(false);
      setTimeout(() => {
        setShowHitsClosed(null);
      }, 500);
    }
  }

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    if (!inventory) return {};
    const counts = {};
    for (const catDef of CATEGORY_DEFINITIONS) {
      if (catDef.id === 'all') {
        counts.all = inventory.length;
      } else {
        counts[catDef.id] = inventory.filter((item) =>
          catDef.match(item.category)
        ).length;
      }
    }
    return counts;
  }, [inventory]);

  // Filter and sort products
  const processedProducts = useMemo(() => {
    if (!inventory) return [];

    // 1. Category Filter
    let list = inventory;
    const activeDef = CATEGORY_DEFINITIONS.find((c) => c.id === activeCategory);
    if (activeDef && activeDef.id !== 'all') {
      list = list.filter((item) => activeDef.match(item.category));
    }

    // 2. In-Stock Filter
    if (inStockOnly) {
      list = list.filter((item) => item.available > 0);
    }

    // 3. On-Sale Filter
    if (onSaleOnly) {
      list = list.filter(
        (item) =>
          item.badges?.includes('sale') ||
          item.badge === 'sale' ||
          (item.originalPrice && item.originalPrice > item.price)
      );
    }

    // 4. Price Range Filter
    if (priceRange === 'under100') {
      list = list.filter((item) => item.price < 100);
    } else if (priceRange === '100to500') {
      list = list.filter((item) => item.price >= 100 && item.price <= 500);
    } else if (priceRange === '500to1000') {
      list = list.filter((item) => item.price > 500 && item.price <= 1000);
    } else if (priceRange === 'over1000') {
      list = list.filter((item) => item.price > 1000);
    }

    // 5. Sorting
    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return sorted;
  }, [inventory, activeCategory, inStockOnly, onSaleOnly, priceRange, sortBy]);

  const handleResetFilters = () => {
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPriceRange('all');
    setSortBy('featured');
    setActiveCategory('all');
  };

  return (
    <div
      className={`${styles.productsWrapper} ${styles.productsContainer} products-container`}
      onClick={(event) => closeInstantSearch(event)}
    >
      <div className={`${styles.searchContainer} product-search-container`}>
        <InstantSearch
          showHitsClosed={showHitsClosed}
          setSelectedProduct={setSelectedProduct}
          setRecommendedProduct={setRecommendedProduct}
        />
      </div>

      {/* SVG Category Filter Tabs (Zero Emojis) */}
      <CategoryFilterTabs
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* Modern Catalog Toolbar */}
      {showToolbar && (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <CatalogToolbar
            totalCount={inventory?.length || 0}
            filteredCount={processedProducts.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            inStockOnly={inStockOnly}
            onToggleInStock={() => setInStockOnly(!inStockOnly)}
            onSaleOnly={onSaleOnly}
            onToggleOnSale={() => setOnSaleOnly(!onSaleOnly)}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
          />
        </div>
      )}

      {/* Empty State */}
      {processedProducts.length === 0 ? (
        <div className={styles.emptyState} data-testid="products-empty-state">
          <div className={styles.emptyIcon}>
            <SearchIcon size={28} />
          </div>
          <h3 className={styles.emptyTitle}>No matching products found</h3>
          <p className={styles.emptyText}>
            Try clearing active filters or selecting a different category to browse our collection.
          </p>
          <button className={styles.resetBtn} onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Responsive Product Grid / List */
        <div
          className={`${styles.productsGrid} ${viewMode === 'list' ? styles.listView : ''} products-grid`}
          id="products-grid"
          role="tabpanel"
          aria-label={`${activeCategory} products`}
        >
          {processedProducts.map((item) => {
            const cartItem = getCurrentItem(cart, item.itemid);
            const isInCart = Boolean(cartItem);
            const cartQuantity = cartItem ? cartItem.quantity : 0;

            return (
              <ProductCard
                key={item.itemid}
                available={item.available}
                description={item.description}
                image={item.image}
                favorite={item.favorite}
                isInCart={isInCart}
                itemid={item.itemid}
                manufacturer={item.manufacturer}
                price={item.price}
                productName={item.productName}
                badge={item.badge}
                badges={item.badges}
                rating={item.rating}
                originalPrice={item.originalPrice}
                cartQuantity={cartQuantity}
                variants={item.variants}
                specifications={item.specifications}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

Products.propTypes = {
  setSelectedProduct: PropTypes.func,
  setRecommendedProduct: PropTypes.func,
  showToolbar: PropTypes.bool,
};
