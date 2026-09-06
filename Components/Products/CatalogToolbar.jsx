import PropTypes from 'prop-types';
import {
  GridIcon,
  ListIcon,
  CheckCircleIcon,
  TagIcon,
  TimesCircleIcon,
} from '../Icons';
import styles from './CatalogToolbar.module.css';

export function CatalogToolbar({
  totalCount = 0,
  filteredCount = 0,
  sortBy = 'featured',
  onSortChange,
  inStockOnly = false,
  onToggleInStock,
  onSaleOnly = false,
  onToggleOnSale,
  priceRange = 'all',
  onPriceRangeChange,
  viewMode = 'grid',
  onViewModeChange,
  onResetFilters,
}) {
  const hasActiveFilters = inStockOnly || onSaleOnly || priceRange !== 'all';

  return (
    <div className={styles.toolbarContainer} data-testid="catalog-toolbar">
      <div className={styles.mainRow}>
        <div className={styles.leftGroup}>
          <span className={styles.resultCount}>
            Showing <strong>{filteredCount}</strong> of {totalCount} products
          </span>

          <div className={styles.filterToggles}>
            <button
              className={`${styles.toggleBtn} ${inStockOnly ? styles.activeToggle : ''}`}
              onClick={onToggleInStock}
              aria-pressed={inStockOnly}
            >
              <CheckCircleIcon size={14} />
              <span>In Stock Only</span>
            </button>

            <button
              className={`${styles.toggleBtn} ${onSaleOnly ? styles.activeToggle : ''}`}
              onClick={onToggleOnSale}
              aria-pressed={onSaleOnly}
            >
              <TagIcon size={14} />
              <span>On Sale</span>
            </button>

            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              className={styles.sortSelect}
              aria-label="Filter by price range"
            >
              <option value="all">All Prices</option>
              <option value="under100">Under $100</option>
              <option value="100to500">$100 - $500</option>
              <option value="500to1000">$500 - $1,000</option>
              <option value="over1000">Over $1,000</option>
            </select>
          </div>
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.sortSelectWrapper}>
            <label htmlFor="catalog-sort" className={styles.sortLabel}>
              Sort by:
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <div className={styles.viewSwitchers} role="group" aria-label="Layout view">
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid layout view"
              title="Grid View"
            >
              <GridIcon size={16} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-label="List layout view"
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.chipsRow}>
          <span className={styles.chipLabel}>Active Filters:</span>
          {inStockOnly && (
            <span className={styles.chip}>
              In Stock Only
              <button
                className={styles.chipRemove}
                onClick={onToggleInStock}
                aria-label="Remove in stock filter"
              >
                <TimesCircleIcon size={12} />
              </button>
            </span>
          )}
          {onSaleOnly && (
            <span className={styles.chip}>
              On Sale
              <button
                className={styles.chipRemove}
                onClick={onToggleOnSale}
                aria-label="Remove on sale filter"
              >
                <TimesCircleIcon size={12} />
              </button>
            </span>
          )}
          {priceRange !== 'all' && (
            <span className={styles.chip}>
              Price:{' '}
              {priceRange === 'under100'
                ? '< $100'
                : priceRange === '100to500'
                ? '$100 - $500'
                : priceRange === '500to1000'
                ? '$500 - $1,000'
                : '> $1,000'}
              <button
                className={styles.chipRemove}
                onClick={() => onPriceRangeChange('all')}
                aria-label="Remove price filter"
              >
                <TimesCircleIcon size={12} />
              </button>
            </span>
          )}
          <button
            className={styles.clearAllBtn}
            onClick={onResetFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

CatalogToolbar.propTypes = {
  totalCount: PropTypes.number,
  filteredCount: PropTypes.number,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  inStockOnly: PropTypes.bool,
  onToggleInStock: PropTypes.func.isRequired,
  onSaleOnly: PropTypes.bool,
  onToggleOnSale: PropTypes.func.isRequired,
  priceRange: PropTypes.string,
  onPriceRangeChange: PropTypes.func.isRequired,
  viewMode: PropTypes.string,
  onViewModeChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
