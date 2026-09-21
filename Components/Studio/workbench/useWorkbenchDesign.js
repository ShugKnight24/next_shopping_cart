import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { trackAddToCart } from '../../../analytics/google';
import { CartContext } from '../../../context/CartProvider';
import {
  createDesignDoc,
  createDesignId,
  designToCartItem,
} from '../core/designDoc';
import { useDesignPersistence } from '../core/useDesignPersistence';

/**
 * Bridges one workbench route to the things outside it: autosave, share links,
 * the saved-design shelf, and the cart.
 *
 * The route owns substrate `options`; the workbench owns `layers`. Together
 * they are the design document, which is what gets persisted, shared, and
 * attached to the cart line so an order can be reopened and reproduced.
 */
export const useWorkbenchDesign = ({
  product,
  options,
  setOptions,
  workbench,
  snapshot,
  summarize,
  transformIncoming = null,
}) => {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');

  const statusTimer = useRef(null);

  const doc = useMemo(
    () =>
      createDesignDoc({
        mode: product.mode,
        options,
        layers: workbench.layers,
        meta: { product: product.route },
      }),
    [product.mode, product.route, options, workbench.layers]
  );

  const persistence = useDesignPersistence({ mode: product.mode, doc });

  const announce = useCallback((message) => {
    setStatus(message);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(''), 4000);
  }, []);

  useEffect(() => () => clearTimeout(statusTimer.current), []);

  /** Put a stored or shared document back on screen. */
  const applyDoc = useCallback(
    (incoming) => {
      if (!incoming) return;

      // A preview handoff arrives as a template reference; the route knows how
      // to turn that back into layers.
      const doc = transformIncoming ? transformIncoming(incoming) : incoming;

      setOptions({ ...product.defaults, ...doc.options });
      workbench.resetLayers(doc.layers ?? []);
    },
    [product.defaults, setOptions, workbench, transformIncoming]
  );

  // A `?d=` link should open the design it points at, once.
  const hasAppliedShare = useRef(false);

  useEffect(() => {
    if (hasAppliedShare.current || !persistence.sharedDoc) return;
    hasAppliedShare.current = true;

    applyDoc(persistence.sharedDoc);
    persistence.acknowledgeShared();
    announce('Opened a shared design.');
  }, [persistence, applyDoc, announce]);

  const price = useMemo(
    () => product.price(options, workbench.layers.length, quantity),
    [product, options, workbench.layers.length, quantity]
  );

  const addToCart = useCallback(() => {
    const image = snapshot?.() ?? null;

    const item = designToCartItem({
      doc,
      itemid: createDesignId(product.idPrefix),
      productName: product.title,
      manufacturer: product.manufacturer,
      price: price.unit,
      image,
      quantity,
      customAttributes: summarize?.(options, workbench.layers) ?? {},
    });

    dispatch({ type: 'ADD_CUSTOM_ITEM', payload: { customItem: item } });
    trackAddToCart(item, quantity);
    setIsCartOpen(true);
    announce('Added to your bag.');

    return item;
  }, [
    doc,
    product,
    price.unit,
    quantity,
    snapshot,
    summarize,
    options,
    workbench.layers,
    dispatch,
    setIsCartOpen,
    announce,
  ]);

  return {
    doc,
    persistence,
    applyDoc,
    price,
    quantity,
    setQuantity,
    addToCart,
    status,
    announce,
  };
};
