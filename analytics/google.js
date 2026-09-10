export const getTrackingId = () =>
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

export const GA_TRACKING_ID = getTrackingId();

// track page views by URL
// More info on PageViews: https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const handlePageView = (url, trackingId = getTrackingId()) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    trackingId
  ) {
    window.gtag('config', trackingId, {
      page_path: url,
    });
  }
};

// track specific events
// More info on Event Tracking: https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const handleEvent = ({ action, params } = {}) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    action
  ) {
    window.gtag('event', action, params);
  }
};

// Set user-level properties in GA4 (e.g. Bot vs. Human traffic classification)
export const setTrafficClassification = (classification) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      traffic_classification: classification,
      is_human: classification === 'human',
    });
  }
};

/**
 * Normalizes internal product structure to Google Analytics 4 Item format
 */
export const formatGA4Item = (
  item,
  quantity = 1,
  variant = null,
  index = undefined
) => {
  if (!item) return {};
  const activeVariant = variant || item.selectedVariant;
  const variantString =
    typeof activeVariant === 'object' && activeVariant !== null
      ? activeVariant.name || activeVariant.id
      : activeVariant;

  return {
    item_id: item.itemid || item.id || 'unknown',
    item_name: item.productName || item.name || 'Unknown Product',
    item_category: item.category || 'General',
    item_brand: item.manufacturer || item.brand || 'Cart Commerce',
    price:
      typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
    quantity: parseInt(quantity, 10) || 1,
    ...(variantString ? { item_variant: String(variantString) } : {}),
    ...(index !== undefined ? { index: Number(index) } : {}),
  };
};

/**
 * GA4 Enhanced Ecommerce: View Item List (Catalog / Categories)
 */
export const trackViewItemList = (
  items = [],
  listName = 'Product Catalog',
  listId = 'catalog'
) => {
  handleEvent({
    action: 'view_item_list',
    params: {
      item_list_id: listId,
      item_list_name: listName,
      items: items
        .slice(0, 30)
        .map((item, idx) => formatGA4Item(item, 1, null, idx + 1)),
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: Select Item from List
 */
export const trackSelectItem = (
  item,
  listName = 'Product Catalog',
  index = 1
) => {
  if (!item) return;
  handleEvent({
    action: 'select_item',
    params: {
      item_list_name: listName,
      items: [formatGA4Item(item, 1, null, index)],
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: View Item Details
 */
export const trackViewItem = (item, variant = null) => {
  if (!item) return;
  const price =
    typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  handleEvent({
    action: 'view_item',
    params: {
      currency: 'USD',
      value: price,
      items: [formatGA4Item(item, 1, variant)],
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: Add to Cart
 */
export const trackAddToCart = (item, quantity = 1, variant = null) => {
  if (!item) return;
  const qty = parseInt(quantity, 10) || 1;
  const price =
    typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  handleEvent({
    action: 'add_to_cart',
    params: {
      currency: 'USD',
      value: price * qty,
      items: [formatGA4Item(item, qty, variant)],
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: Remove from Cart
 */
export const trackRemoveFromCart = (item, quantity = 1) => {
  if (!item) return;
  const qty = parseInt(quantity, 10) || 1;
  const price =
    typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  handleEvent({
    action: 'remove_from_cart',
    params: {
      currency: 'USD',
      value: price * qty,
      items: [formatGA4Item(item, qty)],
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: View Cart
 */
export const trackViewCart = (cartItems = [], total = 0) => {
  handleEvent({
    action: 'view_cart',
    params: {
      currency: 'USD',
      value: typeof total === 'number' ? total : parseFloat(total) || 0,
      items: cartItems.map((item) =>
        formatGA4Item(item, item.quantity, item.selectedVariant)
      ),
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: Begin Checkout
 */
export const trackBeginCheckout = (
  cartItems = [],
  total = 0,
  coupon = null
) => {
  handleEvent({
    action: 'begin_checkout',
    params: {
      currency: 'USD',
      value: typeof total === 'number' ? total : parseFloat(total) || 0,
      ...(coupon ? { coupon } : {}),
      items: cartItems.map((item) =>
        formatGA4Item(item, item.quantity, item.selectedVariant)
      ),
    },
  });
};

/**
 * GA4 Enhanced Ecommerce: Apply Promotion Code
 */
export const trackApplyPromotion = (couponCode, discountPercent = 0) => {
  handleEvent({
    action: 'apply_promotion',
    params: {
      coupon: couponCode,
      discount_percent: discountPercent,
    },
  });
};

/**
 * GA4 Enhanced Search Tracking
 */
export const trackSearch = (searchTerm, resultCount = 0) => {
  if (!searchTerm) return;
  handleEvent({
    action: 'search',
    params: {
      search_term: searchTerm,
      result_count: resultCount,
    },
  });
};

/**
 * Custom Interaction Tracking: 3D Product Studio & Interactive Features
 */
export const trackStudioInteraction = (
  interactionAction,
  interactionLabel,
  metadata = {}
) => {
  handleEvent({
    action: 'studio_3d_interaction',
    params: {
      interaction_action: interactionAction,
      interaction_label: interactionLabel,
      ...metadata,
    },
  });
};

/**
 * Core Web Vitals & Performance Telemetry Tracking (Next.js reportWebVitals)
 */
export const trackWebVitals = (metric) => {
  if (!metric || !metric.name) return;
  handleEvent({
    action: metric.name,
    params: {
      event_category:
        metric.label === 'web-vital' ? 'Web Vitals' : 'Next.js Custom Metric',
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    },
  });
};
