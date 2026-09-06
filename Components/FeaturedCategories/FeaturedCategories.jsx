import Link from 'next/link';
import styles from './FeaturedCategories.module.css';

const categories = [
  {
    id: 'sneakers',
    title: 'Sneakers & Running',
    tagline: 'Deadstock Authenticated',
    itemCount: '12 Models',
    image: '/images/products/jordan-1-lost-and-found.jpg',
    query: 'sneakers',
    accent: '#ef4444',
  },
  {
    id: 'audio',
    title: 'High-Fidelity Audio',
    tagline: 'Audiophile Master Grade',
    itemCount: '8 Products',
    image: '/images/products/sony-wh1000xm5.jpg',
    query: 'audio',
    accent: '#3b82f6',
  },
  {
    id: 'collectibles',
    title: 'Collectibles & TCG',
    tagline: 'PSA Gem Mint Verified',
    itemCount: '6 Rarities',
    image: '/images/products/pokemon-charizard-1st-edition.jpg',
    query: 'collectibles',
    accent: '#f59e0b',
  },
  {
    id: 'instruments',
    title: 'Studio Instruments',
    tagline: 'Concert & Studio Grade',
    itemCount: '7 Instruments',
    image: '/images/products/gibson-les-paul-standard.jpg',
    query: 'instruments',
    accent: '#8b5cf6',
  },
  {
    id: 'fitness',
    title: 'Strength & Conditioning',
    tagline: 'Commercial Grade Steel',
    itemCount: '7 Equipments',
    image: '/images/products/bowflex-selecttech-552.jpg',
    query: 'fitness',
    accent: '#10b981',
  },
];

export function FeaturedCategories() {
  return (
    <section className={styles.section} aria-label="Featured Categories">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrow}>Curated Departments</span>
            <span className={styles.eyebrowLine} />
          </div>
          <h2 className={styles.title}>Explore By Category</h2>
          <p className={styles.subtitle}>
            Explore our specialty departments with 100% verified authenticity and
            insured express courier transit.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.query}`}
              className={styles.card}
              aria-label={`Browse ${cat.title}`}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className={styles.image}
                />
                <div className={styles.overlay} />
              </div>

              <div className={styles.content}>
                <div className={styles.topRow}>
                  <span className={styles.countBadge}>{cat.itemCount}</span>
                </div>
                <div className={styles.bottomContent}>
                  <span className={styles.tagline}>{cat.tagline}</span>
                  <h3 className={styles.categoryTitle}>{cat.title}</h3>
                  <div className={styles.exploreLink}>
                    <span>Shop Category</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
