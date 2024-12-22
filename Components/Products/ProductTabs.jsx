import PropTypes from 'prop-types';
import { useState } from 'react';

import styles from './ProductTabs.module.scss';

export const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'Details',
      content: (
        <div>
          <h3>Product Details</h3>
          <p>{product.description}</p>
          {/* TODO: Add additional product info - possibly a details property on the product data struct */}
        </div>
      ),
    },
    {
      label: 'Product Reviews',
      content: (
        <div>
          <h3>Product Reviews</h3>
          {/* TODO: Add full product reviews here */}
          <p>Reviews content goes here...</p>
        </div>
      ),
    },
    {
      label: 'Discussion',
      content: (
        <div>
          <h3>Discussion</h3>
          {/* TODO: Allow user discussion for products */}
          <p>Discussion content goes here...</p>
        </div>
      ),
    },
    {
      label: 'Shipping & Returns',
      content: (
        <div>
          <h3>Shipping & Returns</h3>
          {/* TODO: Add shipping and returns info */}
          <p>Shipping & Returns content goes here...</p>
        </div>
      ),
    },
    {
      label: 'FAQs',
      content: (
        <div>
          <h3>FAQs</h3>
          {/* TODO: Add product specific FAQs */}
          <p>FAQs content goes here...</p>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeaders}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabHeader} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeTab].content}</div>
    </div>
  );
};

ProductTabs.propTypes = {
  product: PropTypes.shape({
    description: PropTypes.string,
    image: PropTypes.string,
    favorite: PropTypes.bool,
    isInCart: PropTypes.bool,
    itemid: PropTypes.string,
    manufacturer: PropTypes.string,
    price: PropTypes.number,
    productName: PropTypes.string,
    additionalImages: PropTypes.arrayOf(PropTypes.string),
    reviews: PropTypes.shape({
      length: PropTypes.number,
      average: PropTypes.number,
    }),
    variants: PropTypes.arrayOf(PropTypes.string),
    sizes: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.string,
        available: PropTypes.bool,
      })
    ),
    sizeGuide: PropTypes.string,
  }),
};
