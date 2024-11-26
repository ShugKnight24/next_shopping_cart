import Head from 'next/head';
import { useState } from 'react';
import { Products } from '../../Components/Products/Products';
// import { getCurrentItem } from '../../utils/getItem';
// import { formatCurrency } from '../../utils/cartUtils';

export default function ProductsPage() {
  // TODO: Implement the modal system, selectedProduct, and recommendedProduct properly
  // const { showModal, setShowModal, modalType, setModalType } = useContext(ModalContext);
  // const { state, dispatch } = useContext(CartContext)
  // const { inventory } = state;

  const [_, setSelectedProduct] = useState(null);
  const [_1, setRecommendedProduct] = useState(null);
  const [_2, _3] = useState(null);

  // useEffect(() => {
  // 	const currentItem = getCurrentItem(inventory, recommendedProduct);
  // 	setRecItem(currentItem ? currentItem : null);
  // }, [selectedProduct]);

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
