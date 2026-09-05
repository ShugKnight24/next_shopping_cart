import Head from 'next/head';
import { useState } from 'react';
import { Products } from '../../Components/Products/Products';
import styles from '../../styles/pages/Products.module.css';

export default function ProductsPage() {
  const [, setSelectedProduct] = useState(null);
  const [, setRecommendedProduct] = useState(null);

  return (
    <>
      <Head>
        <title>Shopping Cart | All Products Page</title>
      </Head>
      <div className={`${styles.productsPage} products-page`}>
        <div className="page-header">
          <h1>All Products</h1>
        </div>
        <Products
          setSelectedProduct={setSelectedProduct}
          setRecommendedProduct={setRecommendedProduct}
        />
      </div>
    </>
  );
}
