import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';

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
    <div className="clear-cart-modal">
      <div className="modal-content">
        <h2>Clear Your Cart?</h2>
        <p>Are you sure you want to remove all items from your cart?</p>
        <p>This action cannot be undone.</p>
      </div>
      <div className="actions clear-cart-actions">
        <button className="cancel-action" onClick={() => handleCancel()}>
          Keep Items
        </button>
        <button className="danger-action" onClick={() => handleClearCart()}>
          Clear Cart
        </button>
      </div>
    </div>
  );
}
