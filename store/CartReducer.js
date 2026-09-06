import { getAllProducts } from '../utils/productCatalog';
import { getCurrentItem } from '../utils/getItem';

const buildInitialInventory = () => getAllProducts();

export const initialState = {
  inventory: buildInitialInventory(),
  cart: [],
  promo: null,
};

export const reducer = (state, action) => {
  const { inventory, cart } = state;

  switch (action.type) {
    case 'SET_CART': {
      if (!action.payload) return state;
      const loadedCart = action.payload.cart || [];
      const loadedPromo = action.payload.promo || null;

      const savedFavorites = new Set([
        ...(action.payload.favorites || []),
        ...(action.payload.inventory?.filter((si) => si.favorite).map((si) => si.itemid) || []),
      ]);

      const freshCatalog = buildInitialInventory();
      const baseInventory = freshCatalog.length > 0 ? freshCatalog : (action.payload.inventory || inventory);

      const inventoryToUse = baseInventory.map((freshItem) => {
        const cartItem = loadedCart.find((ci) => ci.itemid === freshItem.itemid);
        const inCartQty = cartItem ? cartItem.quantity : 0;
        const isFav = savedFavorites.has(freshItem.itemid)
          ? true
          : (action.payload.inventory?.find((si) => si.itemid === freshItem.itemid)?.favorite ?? Boolean(freshItem.favorite));

        return {
          ...freshItem,
          favorite: Boolean(isFav),
          quantity: inCartQty || freshItem.quantity,
          available: Math.max(0, freshItem.available - inCartQty),
        };
      });

      return {
        ...state,
        inventory: inventoryToUse,
        cart: loadedCart,
        promo: loadedPromo,
      };
    }

    case 'ADD_ITEM': {
      const { productId, quantity = 1, variant, selectedVariant } = action.payload;
      const addQty = parseInt(quantity, 10) || 1;
      const currentItem = getCurrentItem(inventory, productId);

      if (!currentItem || currentItem.available <= 0) return state;

      const clampedQty = Math.min(addQty, currentItem.available);
      if (clampedQty <= 0) return state;

      const activeVariant = variant || selectedVariant;
      const existingCartItem = cart.find((item) => item.itemid === productId);

      const updatedCart = existingCartItem
        ? cart.map((item) =>
            item.itemid === productId
              ? {
                  ...item,
                  quantity: item.quantity + clampedQty,
                  ...(activeVariant ? { selectedVariant: activeVariant } : {}),
                }
              : item
          )
        : [
            ...cart,
            {
              ...currentItem,
              quantity: clampedQty,
              ...(activeVariant ? { selectedVariant: activeVariant } : {}),
            },
          ];

      const updatedInventory = inventory.map((item) =>
        item.itemid === productId
          ? { ...item, available: item.available - clampedQty }
          : item
      );

      return {
        ...state,
        cart: updatedCart,
        inventory: updatedInventory,
      };
    }

    case 'ADD_CUSTOM_ITEM': {
      const { customItem } = action.payload || {};
      if (!customItem || !customItem.itemid) return state;

      const itemQty = parseInt(customItem.quantity, 10) || 1;
      const normalizedItem = {
        available: 99,
        quantity: itemQty,
        favorite: false,
        ...customItem,
      };

      const existingCartItem = cart.find((item) => item.itemid === customItem.itemid);
      const updatedCart = existingCartItem
        ? cart.map((item) =>
            item.itemid === customItem.itemid
              ? { ...item, quantity: item.quantity + itemQty }
              : item
          )
        : [...cart, normalizedItem];

      const existingInv = inventory.find((item) => item.itemid === customItem.itemid);
      const updatedInventory = existingInv
        ? inventory
        : [...inventory, normalizedItem];

      return {
        ...state,
        cart: updatedCart,
        inventory: updatedInventory,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const targetQty = Math.max(0, parseInt(quantity, 10) || 0);
      const cartItem = cart.find((item) => item.itemid === productId);
      const inventoryItem = getCurrentItem(inventory, productId);

      if (!cartItem || !inventoryItem) return state;

      if (targetQty === 0) {
        return {
          ...state,
          cart: cart.filter((item) => item.itemid !== productId),
          inventory: inventory.map((item) =>
            item.itemid === productId
              ? { ...item, available: item.available + cartItem.quantity }
              : item
          ),
        };
      }

      const delta = targetQty - cartItem.quantity;
      const clampedDelta =
        delta > 0 ? Math.min(delta, inventoryItem.available) : delta;

      if (clampedDelta === 0) return state;

      const newCartQty = cartItem.quantity + clampedDelta;

      return {
        ...state,
        cart: cart.map((item) =>
          item.itemid === productId ? { ...item, quantity: newCartQty } : item
        ),
        inventory: inventory.map((item) =>
          item.itemid === productId
            ? { ...item, available: item.available - clampedDelta }
            : item
        ),
      };
    }

    case 'DECREASE_QUANTITY': {
      const { productId } = action.payload;
      const cartItem = cart.find((item) => item.itemid === productId);

      if (!cartItem || cartItem.quantity <= 1) return state;

      return {
        ...state,
        cart: cart.map((item) =>
          item.itemid === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
        inventory: inventory.map((item) =>
          item.itemid === productId
            ? { ...item, available: item.available + 1 }
            : item
        ),
      };
    }

    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      const cartItem = cart.find((item) => item.itemid === productId);

      if (!cartItem) return state;

      return {
        ...state,
        cart: cart.filter((item) => item.itemid !== productId),
        inventory: inventory.map((item) =>
          item.itemid === productId
            ? { ...item, available: item.available + cartItem.quantity }
            : item
        ),
      };
    }

    case 'EMPTY_CART': {
      return {
        ...state,
        cart: [],
        promo: null,
        inventory: buildInitialInventory().map((initItem) => {
          const currentInv = inventory.find((i) => i.itemid === initItem.itemid);
          return {
            ...initItem,
            favorite: currentInv ? currentInv.favorite : initItem.favorite,
          };
        }),
      };
    }

    case 'ADD_FAVORITE': {
      const { productId } = action.payload;
      return {
        ...state,
        inventory: inventory.map((item) =>
          item.itemid === productId ? { ...item, favorite: true } : item
        ),
      };
    }

    case 'REMOVE_FAVORITE': {
      const { productId } = action.payload;
      return {
        ...state,
        inventory: inventory.map((item) =>
          item.itemid === productId ? { ...item, favorite: false } : item
        ),
      };
    }

    case 'APPLY_PROMO': {
      const { code, discountPercent } = action.payload;
      return {
        ...state,
        promo: {
          code: code.toUpperCase(),
          discountPercent,
        },
      };
    }

    case 'REMOVE_PROMO': {
      return {
        ...state,
        promo: null,
      };
    }

    default:
      throw new Error(`No recognized action was run: ${action.type}`);
  }
};
