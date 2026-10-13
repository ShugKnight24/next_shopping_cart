import { act, render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../Components/UI/Toast';
import { CartContext, CartProvider } from '../context/CartProvider';

let cart;
const Probe = () => {
  cart = useContext(CartContext);
  return null;
};

const design = {
  itemid: 'CUSTOM-POSTER-1',
  productName: 'Custom poster',
  price: 40,
  quantity: 1,
  isCustom: true,
};

describe('saving the bag', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns once when the bag is too large to save', () => {
    const quota = Object.assign(new Error('full'), {
      name: 'QuotaExceededError',
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw quota;
    });

    render(
      <ToastProvider>
        <CartProvider>
          <Probe />
        </CartProvider>
      </ToastProvider>
    );

    act(() =>
      cart.dispatch({
        type: 'ADD_CUSTOM_ITEM',
        payload: { customItem: design },
      })
    );
    act(() =>
      cart.dispatch({
        type: 'ADD_CUSTOM_ITEM',
        payload: { customItem: { ...design, itemid: 'CUSTOM-POSTER-2' } },
      })
    );

    expect(screen.getAllByText(/too large to save/)).toHaveLength(1);
  });
});
