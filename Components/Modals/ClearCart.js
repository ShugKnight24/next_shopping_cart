import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import styles from '../Modal.module.css';

export function ClearCart() {
  const { dispatch } = useContext(CartContext);
  const { setShowModal, setModalType } = useContext(ModalContext);

  function closeAndClearModal() {
    setModalType(null);
    setShowModal(false);
  }

  function handleCancel() {
    closeAndClearModal();
  }

  function handleClearCart() {
    dispatch({
      type: 'EMPTY_CART',
    });
    closeAndClearModal();
  }

  return (
    <div className={styles.modalContent}>
      <h2>Clear Your Cart?</h2>
      <p>Are you sure you want to remove all items from your cart?</p>
      <p>This action cannot be undone.</p>
      <div className={styles.actions}>
        <button className={styles.cancelAction} onClick={() => handleCancel()}>
          Keep Items
        </button>
        <button className={styles.dangerAction} onClick={() => handleClearCart()}>
          Clear Cart
        </button>
      </div>
    </div>
  );
}
