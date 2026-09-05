import PropTypes from 'prop-types';
import { useContext } from 'react';
import { CartContext } from '../../context/CartProvider';
import { ModalContext } from '../../context/ModalProvider';
import { getCurrentItem } from '../../utils/getItem';

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
    <div className="delete-item-modal">
      <div className="modal-content">
        <h2>Remove Item?</h2>
        <p>
          You&apos;re about to remove <strong>{currentItem.productName}</strong>{' '}
          from your cart.
        </p>
        <p>Would you like to continue?</p>
      </div>
      <div className="actions add-to-cart-actions">
        <button className="cancel-action" onClick={() => handleCancel()}>
          Keep Item
        </button>
        <button className="danger-action" onClick={() => handleDeleteItem()}>
          Remove
        </button>
      </div>
    </div>
  );
}

DeleteItem.propTypes = {
  itemid: PropTypes.string.isRequired,
};
