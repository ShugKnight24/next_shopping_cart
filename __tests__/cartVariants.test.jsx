import { fireEvent, render, screen, within } from '@testing-library/react';
import { useContext, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartDrawer } from '../Components/Cart/CartDrawer';
import { ToastProvider } from '../Components/UI/Toast';
import { CartContext, CartProvider } from '../context/CartProvider';
import { initialState, reducer } from '../store/CartReducer';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), pathname: '/cart', query: {} }),
}));

const KEY = 'shopping_cart.cart';

/** A bag holding the MacBook in two colours, saved as the provider saves. */
const seed = () => {
  const add = (state, variant) =>
    reducer(state, {
      type: 'ADD_ITEM',
      payload: {
        productId: 'MACBOOKM4',
        variant: variant.name,
        selectedVariant: variant,
      },
    });
  const state = add(
    add(initialState, { id: 'spaceblack', name: 'Space Black' }),
    { id: 'silver', name: 'Silver' }
  );
  localStorage.setItem(KEY, JSON.stringify({ cart: state.cart, promo: null }));
};

const OpenBag = () => {
  const { setIsCartOpen } = useContext(CartContext);
  useEffect(() => setIsCartOpen(true), [setIsCartOpen]);
  return null;
};

const renderCart = () =>
  render(
    <ToastProvider>
      <CartProvider>
        <OpenBag />
        <CartDrawer />
      </CartProvider>
    </ToastProvider>
  );

const lines = () =>
  screen
    .getAllByRole('link', { name: 'MacBook Pro M4' })
    .map((link) => link.closest('li'));

describe('bag with two variants of one product', () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it('lists each variant on its own line, named', () => {
    renderCart();
    expect(lines()).toHaveLength(2);
    expect(within(lines()[0]).getByText('Space Black')).toBeInTheDocument();
    expect(within(lines()[1]).getByText('Silver')).toBeInTheDocument();
  });

  it('removes one line without touching the other', () => {
    renderCart();
    fireEvent.click(
      within(lines()[1]).getByRole('button', {
        name: 'Remove MacBook Pro M4 from bag',
      })
    );

    expect(lines()).toHaveLength(1);
    expect(within(lines()[0]).getByText('Space Black')).toBeInTheDocument();
  });
});
