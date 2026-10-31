import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';
import { Highlight } from '../Search/Highlight';
import styles from './InstantSearch.module.css';

export function Hit({
  itemid,
  query = '',
  setSelectedProduct: _setSelectedProduct,
  setRecommendedProduct: _setRecommendedProduct,
}) {
  const { state, dispatch } = useContext(CartContext);
  const { inventory } = state;

  function handleButtonClick(event, productId) {
    event.preventDefault();
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId,
      },
    });
  }

  const item = getCurrentItem(inventory, itemid);
  if (!item) return null;

  const {
    available = 0,
    image = '',
    manufacturer = '',
    price = 0,
    productName = '',
  } = item;
  const disabledButton = available === 0;

  return (
    <li className={styles.hitContainer}>
      <Link href={`/products/${itemid.toString()}`}>
        <div className={styles.hitContent}>
          <img
            className={styles.hitImage}
            src={image}
            alt={`${productName} made by ${manufacturer}`}
          />
          <div className={styles.nameManufacturer}>
            <h2>
              <Highlight text={productName} query={query} />
            </h2>
            <h3>
              Made By: <Highlight text={manufacturer} query={query} />
            </h3>
            <p>Available: {available}</p>
            <p>{formatCurrency(price)}</p>
          </div>
          <button
            className={`${styles.addCartButton} ${disabledButton ? styles.disabled : ''}`.trim()}
            onClick={(event) => handleButtonClick(event, itemid)}
          >
            Add To Cart
          </button>
        </div>
      </Link>
    </li>
  );
}

// TODO:// Update object shape when rec system is implemented
Hit.propTypes = {
  itemid: PropTypes.string.isRequired,
  query: PropTypes.string,
  setSelectedProduct: PropTypes.func,
  setRecommendedProduct: PropTypes.func,
};
