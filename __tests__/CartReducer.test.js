import { describe, expect, it } from 'vitest';
import { initialState, reducer } from '../store/CartReducer';

describe('CartReducer', () => {
  const sampleProduct = {
    itemid: 'SM57',
    productName: 'SM57',
    price: 99.0,
    available: 5,
    quantity: 1,
    favorite: false,
  };

  const sampleState = {
    inventory: [sampleProduct],
    cart: [],
    promo: null,
  };

  it('provides a valid initial state with inventory and empty cart', () => {
    expect(initialState.inventory.length).toBeGreaterThan(0);
    expect(initialState.cart).toEqual([]);
    expect(initialState.promo).toBeNull();
  });

  it('adds an item to an empty cart and decrements available inventory', () => {
    const action = {
      type: 'ADD_ITEM',
      payload: { productId: 'SM57', quantity: 2 },
    };
    const newState = reducer(sampleState, action);

    expect(newState.cart).toHaveLength(1);
    expect(newState.cart[0].itemid).toBe('SM57');
    expect(newState.cart[0].quantity).toBe(2);
    expect(newState.inventory[0].available).toBe(3); // 5 - 2
  });

  it('increments quantity when adding an item already in the cart', () => {
    const existingState = {
      inventory: [{ ...sampleProduct, available: 3 }],
      cart: [{ ...sampleProduct, quantity: 2 }],
      promo: null,
    };

    const action = {
      type: 'ADD_ITEM',
      payload: { productId: 'SM57', quantity: 2 },
    };
    const newState = reducer(existingState, action);

    expect(newState.cart[0].quantity).toBe(4);
    expect(newState.inventory[0].available).toBe(1); // 3 - 2
  });

  it('prevents adding quantity exceeding available inventory', () => {
    const action = {
      type: 'ADD_ITEM',
      payload: { productId: 'SM57', quantity: 10 },
    };
    const newState = reducer(sampleState, action);

    expect(newState.cart[0].quantity).toBe(5); // Clamped to available: 5
    expect(newState.inventory[0].available).toBe(0);
  });

  it('removes an item from cart and restores inventory', () => {
    const cartState = {
      inventory: [{ ...sampleProduct, available: 3 }],
      cart: [{ ...sampleProduct, quantity: 2 }],
      promo: null,
    };

    const action = {
      type: 'REMOVE_ITEM',
      payload: { productId: 'SM57' },
    };
    const newState = reducer(cartState, action);

    expect(newState.cart).toHaveLength(0);
    expect(newState.inventory[0].available).toBe(5); // Restored 3 + 2
  });

  it('updates quantity and adjusts delta inventory accordingly', () => {
    const cartState = {
      inventory: [{ ...sampleProduct, available: 3 }],
      cart: [{ ...sampleProduct, quantity: 2 }],
      promo: null,
    };

    // Update to 4 (delta +2)
    const action = {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'SM57', quantity: 4 },
    };
    const newState = reducer(cartState, action);

    expect(newState.cart[0].quantity).toBe(4);
    expect(newState.inventory[0].available).toBe(1); // 3 - 2
  });

  it('decreases quantity by 1 when using DECREASE_QUANTITY', () => {
    const cartState = {
      inventory: [{ ...sampleProduct, available: 2 }],
      cart: [{ ...sampleProduct, quantity: 3 }],
      promo: null,
    };

    const action = {
      type: 'DECREASE_QUANTITY',
      payload: { productId: 'SM57' },
    };
    const newState = reducer(cartState, action);

    expect(newState.cart[0].quantity).toBe(2);
    expect(newState.inventory[0].available).toBe(3);
  });

  it('handles APPLY_PROMO and REMOVE_PROMO', () => {
    const promoAction = {
      type: 'APPLY_PROMO',
      payload: { code: 'vip20', discountPercent: 20 },
    };
    const promoState = reducer(sampleState, promoAction);

    expect(promoState.promo).toEqual({
      code: 'VIP20',
      discountPercent: 20,
    });

    const removeAction = { type: 'REMOVE_PROMO' };
    const clearedPromoState = reducer(promoState, removeAction);
    expect(clearedPromoState.promo).toBeNull();
  });

  it('toggles favorite status with ADD_FAVORITE and REMOVE_FAVORITE', () => {
    const addFav = {
      type: 'ADD_FAVORITE',
      payload: { productId: 'SM57' },
    };
    const stateFav = reducer(sampleState, addFav);
    expect(stateFav.inventory[0].favorite).toBe(true);

    const remFav = {
      type: 'REMOVE_FAVORITE',
      payload: { productId: 'SM57' },
    };
    const stateUnfav = reducer(stateFav, remFav);
    expect(stateUnfav.inventory[0].favorite).toBe(false);
  });

  it('reconciles catalog inventory on SET_CART while preserving cart and favorites', () => {
    const action = {
      type: 'SET_CART',
      payload: {
        cart: [{ itemid: 'JORDAN-4-BRED-REIM', quantity: 2 }],
        favorites: ['JORDAN-4-BRED-REIM'],
        promo: { code: 'VIP20', discountPercent: 20 },
      },
    };
    const newState = reducer(sampleState, action);

    expect(newState.cart).toHaveLength(1);
    expect(newState.cart[0].itemid).toBe('JORDAN-4-BRED-REIM');
    expect(newState.cart[0].quantity).toBe(2);
    expect(newState.promo).toEqual({ code: 'VIP20', discountPercent: 20 });

    const jordan = newState.inventory.find(
      (i) => i.itemid === 'JORDAN-4-BRED-REIM'
    );
    expect(jordan).toBeDefined();
    expect(jordan.favorite).toBe(true);
    expect(jordan.image).toBe('/images/products/jordan-4-bred-reimagined.jpg');
    // Available was 8 in catalog, minus 2 in cart => 6
    expect(jordan.available).toBe(6);
  });

  it('handles ADD_CUSTOM_ITEM for personalized Web-to-Print studio creations', () => {
    const customItem = {
      itemid: 'CUSTOM-BOOK-123',
      productName: "Custom Storybook: 'Noah's Cosmic Quest'",
      price: 34.99,
      image: 'data:image/png;base64,sample',
      isCustom: true,
      customAttributes: { Hero: 'Noah', Theme: 'Cosmic Galaxy Quest' },
      quantity: 1,
    };

    const addCustomAction = {
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem },
    };

    const stateWithCustom = reducer(sampleState, addCustomAction);
    expect(stateWithCustom.cart).toHaveLength(1);
    expect(stateWithCustom.cart[0].itemid).toBe('CUSTOM-BOOK-123');
    expect(stateWithCustom.cart[0].isCustom).toBe(true);
    expect(stateWithCustom.cart[0].quantity).toBe(1);
    expect(
      stateWithCustom.inventory.some((i) => i.itemid === 'CUSTOM-BOOK-123')
    ).toBe(true);
  });

  it('throws an error for unrecognized actions', () => {
    expect(() => {
      reducer(sampleState, { type: 'UNKNOWN_ACTION' });
    }).toThrow(/No recognized action was run: UNKNOWN_ACTION/);
  });
});
