import PropTypes from 'prop-types';
import { useContext, useMemo, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useProductCatalog } from '../../hooks/useProductCatalog';
import { getCurrentItem } from '../../utils/getItem';
import {
  applyProductPipeline,
  calculateCategoryCounts,
} from '../../utils/productFilters';
import { AlertTriangleIcon, SearchIcon } from '../Icons';
import { InstantSearch } from '../InstantSearch/InstantSearch';
import { CatalogToolbar } from './CatalogToolbar';
import { CategoryFilterTabs } from './CategoryFilterTabs';
import { ProductCard } from './ProductCard';
import styles from './Products.module.css';

export function Products({
  setSelectedProduct,
  setRecommendedProduct,
  showToolbar = true,
  initialProducts = null,
  fetchFromApi = false,
  apiEndpoint = '/api/products',
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

  // Declarative catalog data management & error resilience
  const {
    products: catalogProducts,
    error: catalogError,
    isError,
    isEmpty: isCatalogEmpty,
    refetch,
  } = useProductCatalog({
    initialData: initialProducts || inventory,
    fetchFromApi,
    apiEndpoint,
  });

  // Declarative click-outside ref replacing imperative document.querySelector
  const searchContainerRef = useClickOutside(() => {
    setShowHitsClosed(false);
    setTimeout(() => {
      setShowHitsClosed(null);
    }, 500);
  });

  // Declarative category counts via pure function
  const categoryCounts = useMemo(
    () => calculateCategoryCounts(catalogProducts),
    [catalogProducts]
  );

  // Declarative functional filtering and sorting pipeline
  const processedProducts = useMemo(
    () =>
      applyProductPipeline(catalogProducts, {
        activeCategory,
        inStockOnly,
        onSaleOnly,
        priceRange,
        sortBy,
      }),
    [
      catalogProducts,
      activeCategory,
      inStockOnly,
      onSaleOnly,
      priceRange,
      sortBy,
    ]
  );

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
    >
      <div
        ref={searchContainerRef}
        className={`${styles.searchContainer} product-search-container`}
      >
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
            totalCount={catalogProducts.length}
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

      {/* Resilient Error & Empty States */}
      {isError ? (
        <div
          className={styles.errorContainer}
          data-testid="products-error-state"
        >
          <div className={styles.errorIcon}>
            <AlertTriangleIcon size={28} />
          </div>
          <h3 className={styles.errorTitle}>Catalog Service Unavailable</h3>
          <p className={styles.errorText}>
            {catalogError ||
              'We encountered an error loading the product catalog.'}
          </p>
          <button className={styles.retryBtn} onClick={refetch}>
            Retry Loading Catalog
          </button>
        </div>
      ) : isCatalogEmpty ? (
        <div
          className={styles.emptyState}
          data-testid="products-empty-catalog-state"
        >
          <div className={styles.emptyIcon}>
            <SearchIcon size={28} />
          </div>
          <h3 className={styles.emptyTitle}>No products currently available</h3>
          <p className={styles.emptyText}>
            Our catalog is currently being updated with new arrivals. Please
            check back shortly.
          </p>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className={styles.emptyState} data-testid="products-empty-state">
          <div className={styles.emptyIcon}>
            <SearchIcon size={28} />
          </div>
          <h3 className={styles.emptyTitle}>No matching products found</h3>
          <p className={styles.emptyText}>
            Try clearing active filters or selecting a different category to
            browse our collection.
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
  initialProducts: PropTypes.arrayOf(PropTypes.object),
  fetchFromApi: PropTypes.bool,
  apiEndpoint: PropTypes.string,
};
