import Head from 'next/head';
import { useState } from 'react';
import { Products } from '../../Components/Products/Products';
// import { getCurrentItem } from '../../utils/getItem';
// import { formatCurrency } from '../../utils/cartUtils';

export default function ProductsPage() {
  const [, setSelectedProduct] = useState(null);
  const [, setRecommendedProduct] = useState(null);

  return (
    <>
      <Head>
        <title>Shopping Cart | All Products Page</title>
      </Head>
      <div className="products-page">
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
