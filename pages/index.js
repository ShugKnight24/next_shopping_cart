import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FullscreenCarousel } from '../Components/Carousel/FullscreenCarousel';
import { Hero } from '../Components/Hero/Hero';
import { HowItWorks } from '../Components/HowItWorks';
import { Products } from '../Components/Products/Products';
import { Reasons } from '../Components/Reasons/Reasons';

const CarouselLoading = () => (
  <div className="carousel-loading">
    <div className="loading-spinner" />
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

  return (
    <>
      <Head>
        <title>Cart Commerce | Home</title>
        <meta
          name="description"
          content="Discover our curated collection of premium products. Award-winning quality, free shipping, and exceptional customer service."
        />
      </Head>

      <div className="home-container premium">
        <Hero />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Featured Products Carousel */}
        {hasMounted ? (
          <DynamicCarousel autoPlayInterval={7000} variant="card" />
        ) : (
          <CarouselLoading />
        )}
        <FullscreenCarousel />
        {/* <PremiumCarousel /> */}
        {/* Value Propositions */}
        <Reasons />
        {/* Products Section */}
        <section className="products-section">
          <div className="section-header-wrapper">
            <span className="section-eyebrow">Shop Now</span>
            <h2 className="section-title">Premium Collection</h2>
            <p className="section-subtitle">
              Curated selection of our finest products, handpicked for quality
              and excellence.
            </p>
          </div>

          <Products
            setSelectedProduct={setSelectedProduct}
            setRecommendedProduct={setRecommendedProduct}
          />

          <div className="products-cta-wrapper">
            <Link className="all-products-link" href="/products">
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
