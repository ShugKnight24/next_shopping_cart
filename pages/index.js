import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandStory } from '../Components/BrandStory/BrandStory';
import { FullscreenCarousel } from '../Components/Carousel/FullscreenCarousel';
import { FeaturedCategories } from '../Components/FeaturedCategories/FeaturedCategories';
import { Hero } from '../Components/Hero/Hero';
import { HowItWorks } from '../Components/HowItWorks';
import { Products } from '../Components/Products/Products';
import { Reasons } from '../Components/Reasons/Reasons';
import { EcommerceSizzleReel } from '../Components/Video/EcommerceSizzleReel';
import styles from '../styles/pages/Home.module.css';

const CarouselLoading = () => (
  <div className={styles.carouselLoading}>
    <div className={styles.loadingSpinner} />
    <span>Loading featured products...</span>
  </div>
);

const DynamicCarousel = dynamic(
  () => import('../Components/Carousel/Carousel').then((mod) => mod.Carousel),
  {
    ssr: false,
    loading: () => <CarouselLoading />,
  }
);

export default function Home() {
  const [, setSelectedProduct] = useState(null);
  const [, setRecommendedProduct] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cart Commerce',
    url: 'https://cart-commerce.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target:
        'https://cart-commerce.vercel.app/products?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Cart Commerce',
    url: 'https://cart-commerce.vercel.app',
    description:
      'Curated destination for authentic sneakers, high-fidelity audio, collectible cards, and premium fitness gear.',
    priceRange: '$$$',
    paymentAccepted: 'Credit Card, Stripe, Apple Pay, Google Pay',
    currenciesAccepted: 'USD',
  };

  return (
    <>
      <Head>
        <title>Cart Commerce | Curated Luxury Storefront</title>
        <meta
          name="description"
          content="Discover our curated collection of premium products. Award-winning quality, free express shipping, and 100% verified authenticity."
        />
        <meta property="og:title" content="Cart Commerce | Curated Luxury Storefront" />
        <meta
          property="og:description"
          content="Discover our curated collection of premium products. Award-winning quality, free express shipping, and 100% verified authenticity."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/static/img/og-preview.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/static/img/og-preview.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </Head>

      <div className={`${styles.homeContainer} ${styles.premium}`}>
        <Hero />
        {/* Curated Featured Categories */}
        <FeaturedCategories />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Featured Products Carousel */}
        {hasMounted ? (
          <DynamicCarousel autoPlayInterval={7000} variant="card" />
        ) : (
          <CarouselLoading />
        )}
        <FullscreenCarousel />
        {/* Editorial Brand Story & Trust Standards */}
        <BrandStory />
        {/* Cinematic Collection Sizzle Reel with Interactive Hotspots */}
        <EcommerceSizzleReel />
        {/* Value Propositions */}
        <Reasons />
        {/* Products Section */}
        <section className={styles.productsSection}>
          <div className={styles.sectionHeaderWrapper}>
            <span className={styles.sectionEyebrow}>Shop Now</span>
            <h2 className={styles.sectionTitle}>Premium Collection</h2>
            <p className={styles.sectionSubtitle}>
              Curated selection of our finest products, handpicked for quality
              and excellence.
            </p>
          </div>

          <Products
            setSelectedProduct={setSelectedProduct}
            setRecommendedProduct={setRecommendedProduct}
          />

          <div className={styles.productsCtaWrapper}>
            <Link className={styles.allProductsLink} href="/products">
              <span>Explore Full Collection</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
