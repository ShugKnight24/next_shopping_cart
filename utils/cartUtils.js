export function formatCurrency(num) {
  const number = parseFloat(num);
  if (isNaN(number)) return '$0.00';
  return '$' + number.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

// Standard delivery is free from this subtotal; express and overnight are
// always charged. Every claim on the site reads this one number.
export const FREE_SHIPPING_THRESHOLD = 150;

/**
 * A cart line's id: the product id, plus the variant for a product bought in
 * more than one (lines saved before variants had their own id use itemid).
 */
export const cartLineId = (line) => line?.lineId ?? line?.itemid;

/** The variant a line was bought in, for display (older lines stored a name). */
export const variantName = (line) =>
  line?.selectedVariant?.name ??
  (typeof line?.selectedVariant === 'string' ? line.selectedVariant : null);

export function totalPrice(array) {
  if (!Array.isArray(array)) return 0;
  return array.reduce((total, item) => {
    const price = parseFloat(item?.price) || 0;
    const qty = parseInt(item?.quantity, 10) || 0;
    return total + price * qty;
  }, 0);
}

export function totalQuantity(array) {
  if (!Array.isArray(array)) return 0;
  return array.reduce((total, item) => {
    return total + (parseInt(item?.quantity, 10) || 0);
  }, 0);
}

export function calculateDiscount(subtotal, promo) {
  if (!promo || typeof promo.discountPercent !== 'number') return 0;
  return (subtotal * promo.discountPercent) / 100;
}
