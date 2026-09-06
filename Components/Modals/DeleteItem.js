import PropTypes from 'prop-types';
import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { getCurrentItem } from '../../utils/getItem';
import styles from '../Modal.module.css';

export function DeleteItem({ itemid }) {
  const { state, dispatch } = useContext(CartContext);
  const { inventory } = state;
  const currentItem = getCurrentItem(inventory, itemid);
  const { setShowModal, setModalType } = useContext(ModalContext);

  function closeAndClearModal() {
    setModalType(null);
    setShowModal(false);
  }

  function handleCancel() {
    closeAndClearModal();
  }

  function handleDeleteItem() {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId: itemid,
      },
    });
    closeAndClearModal();
  }

  return (
    <div className={styles.modalContent}>
      <h2>Remove Item?</h2>
      <p>
        You&apos;re about to remove <strong>{currentItem.productName}</strong>{' '}
        from your cart.
      </p>
      <p>Would you like to continue?</p>
      <div className={styles.actions}>
        <button className={styles.cancelAction} onClick={() => handleCancel()}>
          Keep Item
        </button>
        <button className={styles.dangerAction} onClick={() => handleDeleteItem()}>
          Remove
        </button>
      </div>
    </div>
  );
}

DeleteItem.propTypes = {
  itemid: PropTypes.string.isRequired,
};
