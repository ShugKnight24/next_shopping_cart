import { cartLineId } from '../utils/cartUtils';
import { getCurrentItem } from '../utils/getItem';
import { getAllProducts } from '../utils/productCatalog';

const buildInitialInventory = () => getAllProducts();

export const initialState = {
  inventory: buildInitialInventory(),
  cart: [],
  promo: null,
};

/**
 * The variant a shopper picked. Callers send its name as `variant` and the
 * object as `selectedVariant` (or only one of them); prefer the object, since
 * only it carries the id and price modifier.
 */
const pickedVariant = ({ variant, selectedVariant }) => {
  const obj = [selectedVariant, variant].find(
    (v) => v && typeof v === 'object'
  );
  const name =
    obj?.name ?? [variant, selectedVariant].find((v) => typeof v === 'string');
  if (!name && !obj) return null;
  return {
    id: obj?.id ?? name,
    name: name ?? obj.id,
    priceModifier: obj?.priceModifier || 0,
  };
};

/**
 * The cart lines an action means. Cart views send a line's id; product
 * cards and pages send the product's id, which means every line of it.
 */
const linesFor = (cart, id) => {
  const exact = cart.filter((line) => cartLineId(line) === id);
  return exact.length ? exact : cart.filter((line) => line.itemid === id);
};

/** Give stock back to the products whose lines left the cart. */
const restock = (inventory, lines) =>
  inventory.map((item) => {
    const back = lines
      .filter((line) => line.itemid === item.itemid)
      .reduce((sum, line) => sum + line.quantity, 0);
    return back ? { ...item, available: item.available + back } : item;
  });

export const reducer = (state, action) => {
  const { inventory, cart } = state;

  switch (action.type) {
    case 'SET_CART': {
      if (!action.payload) return state;
      const loadedCart = action.payload.cart || [];
      const loadedPromo = action.payload.promo || null;

      const savedFavorites = new Set([
        ...(action.payload.favorites || []),
        ...(action.payload.inventory
          ?.filter((si) => si.favorite)
          .map((si) => si.itemid) || []),
      ]);

      const freshCatalog = buildInitialInventory();
      const baseInventory =
        freshCatalog.length > 0
          ? freshCatalog
          : action.payload.inventory || inventory;

      const inventoryToUse = baseInventory.map((freshItem) => {
        // Every line of the product, one per variant.
        const inCartQty = loadedCart
          .filter((ci) => ci.itemid === freshItem.itemid)
          .reduce((sum, ci) => sum + (parseInt(ci.quantity, 10) || 0), 0);
        const isFav = savedFavorites.has(freshItem.itemid)
          ? true
          : (action.payload.inventory?.find(
              (si) => si.itemid === freshItem.itemid
            )?.favorite ?? Boolean(freshItem.favorite));

        return {
          ...freshItem,
          favorite: Boolean(isFav),
          quantity: inCartQty || freshItem.quantity,
          available: Math.max(0, freshItem.available - inCartQty),
        };
      });

      // Studio designs are not in the catalogue. Without an inventory entry
      // every quantity change on them would be a silent no-op.
      const customLines = loadedCart
        .filter(
          (line) => !inventoryToUse.some((item) => item.itemid === line.itemid)
        )
        .map((line) => ({ ...line, available: line.available ?? 99 }));

      return {
        ...state,
        inventory: [...inventoryToUse, ...customLines],
        cart: loadedCart,
        promo: loadedPromo,
      };
    }

    case 'ADD_ITEM': {
      const { productId, quantity = 1 } = action.payload;
      const addQty = parseInt(quantity, 10) || 1;
      const currentItem = getCurrentItem(inventory, productId);

      if (!currentItem || currentItem.available <= 0) return state;

      const clampedQty = Math.min(addQty, currentItem.available);
      if (clampedQty <= 0) return state;

      // Each variant is its own line at its own price: the product page
      // quotes base price plus the variant's modifier, so the line charges
      // the same, and a second variant never reprices the first.
      const picked = pickedVariant(action.payload);
      const lineId = picked ? `${productId}::${picked.id}` : productId;
      const existing = cart.find((line) => cartLineId(line) === lineId);

      const updatedCart = existing
        ? cart.map((line) =>
            line === existing
              ? { ...line, quantity: line.quantity + clampedQty }
              : line
          )
        : [
            ...cart,
            {
              ...currentItem,
              lineId,
              quantity: clampedQty,
              ...(picked
                ? {
                    price: currentItem.price + picked.priceModifier,
                    selectedVariant: picked,
                  }
                : {}),
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

      const existingCartItem = cart.find(
        (item) => item.itemid === customItem.itemid
      );
      const updatedCart = existingCartItem
        ? cart.map((item) =>
            item.itemid === customItem.itemid
              ? { ...item, quantity: item.quantity + itemQty }
              : item
          )
        : [...cart, normalizedItem];

      const existingInv = inventory.find(
        (item) => item.itemid === customItem.itemid
      );
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
      const [cartItem] = linesFor(cart, productId);
      const inventoryItem =
        cartItem && getCurrentItem(inventory, cartItem.itemid);

      if (!cartItem || !inventoryItem) return state;

      if (targetQty === 0) {
        return {
          ...state,
          cart: cart.filter((line) => line !== cartItem),
          inventory: restock(inventory, [cartItem]),
        };
      }

      const delta = targetQty - cartItem.quantity;
      const clampedDelta =
        delta > 0 ? Math.min(delta, inventoryItem.available) : delta;

      if (clampedDelta === 0) return state;

      return {
        ...state,
        cart: cart.map((line) =>
          line === cartItem
            ? { ...line, quantity: line.quantity + clampedDelta }
            : line
        ),
        inventory: inventory.map((item) =>
          item.itemid === cartItem.itemid
            ? { ...item, available: item.available - clampedDelta }
            : item
        ),
      };
    }

    case 'DECREASE_QUANTITY': {
      const { productId } = action.payload;
      const [cartItem] = linesFor(cart, productId);

      if (!cartItem || cartItem.quantity <= 1) return state;

      return {
        ...state,
        cart: cart.map((line) =>
          line === cartItem ? { ...line, quantity: line.quantity - 1 } : line
        ),
        inventory: inventory.map((item) =>
          item.itemid === cartItem.itemid
            ? { ...item, available: item.available + 1 }
            : item
        ),
      };
    }

    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      const removed = linesFor(cart, productId);

      if (!removed.length) return state;

      return {
        ...state,
        cart: cart.filter((line) => !removed.includes(line)),
        inventory: restock(inventory, removed),
      };
    }

    case 'EMPTY_CART': {
      return {
        ...state,
        cart: [],
        promo: null,
        inventory: buildInitialInventory().map((initItem) => {
          const currentInv = inventory.find(
            (i) => i.itemid === initItem.itemid
          );
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
