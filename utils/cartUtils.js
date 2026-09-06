export function formatCurrency(num) {
  const number = parseFloat(num);
  if (isNaN(number)) return '$0.00';
  return '$' + number.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

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

