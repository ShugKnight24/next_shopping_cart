import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Products } from '../../Components/Products/Products';
import { RecentlyViewed } from '../../Components/Products/RecentlyViewed';
import {
  ChevronRight,
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  TagIcon,
} from '../../Components/Icons';
import styles from '../../styles/pages/Products.module.css';

export default function ProductsPage() {
  const [, setSelectedProduct] = useState(null);
  const [, setRecommendedProduct] = useState(null);

  return (
    <>
      <Head>
        <title>All Products | Premium Catalog</title>
        <meta
          name="description"
          content="Explore our complete collection of authentic sneakers, running shoes, MTG trading cards, Warhammer 40k miniatures, musical instruments, and precision weights."
        />
      </Head>

      <div className={`${styles.productsPage} products-page`}>
        {/* Breadcrumb Navigation */}
        <nav
          className="product-breadcrumbs"
          style={{
            padding: '1rem 2rem',
            background: '#fff',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
          }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={12} style={{ color: '#94a3b8' }} />
          <span style={{ color: '#64748b' }} aria-current="page">
            All Products
          </span>
        </nav>

        {/* E-Commerce Catalog Hero Header */}
        <header className={styles.catalogHero}>
          <div className={styles.catalogHeroContent}>
            <span className={styles.catalogEyebrow}>
              <SparklesIcon size={14} />
              <span>Complete Verified Collection</span>
            </span>

            <h1 className={styles.catalogTitle}>
              Curated Excellence for Discerning Collectors &amp; Athletes
            </h1>

            <p className={styles.catalogSubtitle}>
              Explore our full range of 100% verified authentic footwear, rare trading cards, tabletop miniatures, musical instruments, tech, and weights.
            </p>

            <div className={styles.catalogStats}>
              <div className={styles.statPill}>
                <ShieldCheckIcon size={16} />
                <span>100% Verified Authenticity</span>
              </div>
              <div className={styles.statPill}>
                <TruckIcon size={16} />
                <span>Free Express Shipping $50+</span>
              </div>
              <div className={styles.statPill}>
                <TagIcon size={16} />
                <span>Price Match &amp; 30-Day Returns</span>
              </div>
            </div>
          </div>
        </header>

        {/* Interactive Products Catalog with Search, Filters, and Toolbar */}
        <Products
          setSelectedProduct={setSelectedProduct}
          setRecommendedProduct={setRecommendedProduct}
          showToolbar={true}
        />

        {/* Browsing History */}
        <RecentlyViewed />
      </div>
    </>
  );
}
