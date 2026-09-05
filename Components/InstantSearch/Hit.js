import PropTypes from 'prop-types';
import { useContext } from 'react';
import Link from 'next/link';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';
import styles from './InstantSearch.module.css';

export function Hit({ itemid, setSelectedProduct: _setSelectedProduct, setRecommendedProduct: _setRecommendedProduct }) {
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

  const { available, image, manufacturer, price, productName } = getCurrentItem(
    inventory,
    itemid
  );
  const disabledButton = available === 0 ? true : false;

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
            <h2>{productName}</h2>
            <h3>Made By: {manufacturer}</h3>
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
  setSelectedProduct: PropTypes.func,
  setRecommendedProduct: PropTypes.func,
};
