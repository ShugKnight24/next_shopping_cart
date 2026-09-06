import PropTypes from 'prop-types';
import {
  GridIcon,
  SneakerIcon,
  CardGameIcon,
  GuitarIcon,
  DumbbellIcon,
  ChipIcon,
} from '../Icons';
import styles from './CategoryFilterTabs.module.css';

export const CATEGORY_DEFINITIONS = [
  {
    id: 'all',
    label: 'All Products',
    Icon: GridIcon,
    match: () => true,
  },
  {
    id: 'sneakers',
    label: 'Sneakers & Running',
    Icon: SneakerIcon,
    match: (cat) => /footwear|jordans|running|basketball/i.test(cat || ''),
  },
  {
    id: 'collectibles',
    label: 'Collectibles & TCG',
    Icon: CardGameIcon,
    match: (cat) =>
      /collectibles|trading card|mtg|warhammer|miniatures/i.test(cat || ''),
  },
  {
    id: 'music',
    label: 'Musical Instruments',
    Icon: GuitarIcon,
    match: (cat) => /instruments|guitars|pianos/i.test(cat || ''),
  },
  {
    id: 'fitness',
    label: 'Strength & Fitness',
    Icon: DumbbellIcon,
    match: (cat) =>
      /fitness|strength|weights|barbells|plates|dumbbells/i.test(cat || ''),
  },
  {
    id: 'tech',
    label: 'Audio & Tech',
    Icon: ChipIcon,
    match: (cat) =>
      /audio|electronics|phones|computers|headphones|synthesizers|spatial/i.test(
        cat || ''
      ),
  },
];

export function CategoryFilterTabs({
  activeCategory = 'all',
  onSelectCategory,
  categoryCounts = {},
}) {
  return (
    <div className={styles.filterContainer}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Product categories"
      >
        {CATEGORY_DEFINITIONS.map(({ id, label, Icon }) => {
          const isActive = activeCategory === id;
          const count = categoryCounts[id] || 0;

          return (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={isActive}
              aria-controls="products-grid"
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
              onClick={() => onSelectCategory(id)}
              type="button"
            >
              <span className={styles.tabIcon}>
                <Icon size={18} strokeWidth={2} />
              </span>
              <span>{label}</span>
              {count > 0 && <span className={styles.countBadge}>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

CategoryFilterTabs.propTypes = {
  activeCategory: PropTypes.string.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  categoryCounts: PropTypes.object,
};
