/**
 * Runtime Contract Resilience & Schema Validation
 *
 * Protects against API contract drift, missing payload fields, type mutations,
 * and corrupted client/server storage.
 */

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

/**
 * Resiliently normalizes any raw product input into a guaranteed 100% type-safe
 * product object adhering to the commerce contract.
 *
 * @param {unknown} rawItem - Any raw input from API, cache, or external provider
 * @returns {object} Guaranteed safe product object
 */
export function normalizeProduct(rawItem) {
  if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
    return {
      itemid: 'UNKNOWN-ITEM',
      productName: 'Unavailable Product',
      manufacturer: 'Curated Collection',
      category: 'General > Premium',
      tags: ['curated'],
      price: 0,
      originalPrice: null,
      available: 0,
      quantity: 1,
      description: 'Product details currently unavailable.',
      shortDescription: 'Product unavailable',
      image: DEFAULT_PRODUCT_IMAGE,
      images: [DEFAULT_PRODUCT_IMAGE],
      url: '/products',
      badges: [],
      rating: { average: 5.0, count: 0 },
      variants: [],
      specifications: {},
      shipping: { free: true, estimate: 'Standard shipping' },
      reviews: [],
      relatedProducts: [],
    };
  }

  // Safe itemid
  const itemid =
    typeof rawItem.itemid === 'string' && rawItem.itemid.trim().length > 0
      ? rawItem.itemid.trim()
      : typeof rawItem.id === 'string' || typeof rawItem.id === 'number'
        ? String(rawItem.id).trim()
        : `ITEM-${Math.abs(hashString(JSON.stringify(rawItem))).toString(16)}`;

  // Safe productName
  const productName =
    typeof rawItem.productName === 'string' &&
    rawItem.productName.trim().length > 0
      ? rawItem.productName.trim()
      : typeof rawItem.name === 'string' && rawItem.name.trim().length > 0
        ? rawItem.name.trim()
        : typeof rawItem.title === 'string' && rawItem.title.trim().length > 0
          ? rawItem.title.trim()
          : 'Premium Product';

  // Safe manufacturer
  const manufacturer =
    typeof rawItem.manufacturer === 'string' &&
    rawItem.manufacturer.trim().length > 0
      ? rawItem.manufacturer.trim()
      : typeof rawItem.brand === 'string' && rawItem.brand.trim().length > 0
        ? rawItem.brand.trim()
        : 'Curated Brand';

  // Safe price (handles string numbers "$129.99", NaN, negative, rawItem.cost)
  const candidatePrice =
    rawItem.price !== undefined ? rawItem.price : rawItem.cost;
  let price = 0;
  if (typeof candidatePrice === 'number' && !Number.isNaN(candidatePrice)) {
    price = Math.max(0, Math.round(candidatePrice * 100) / 100);
  } else if (typeof candidatePrice === 'string') {
    const cleaned = candidatePrice.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    price = !Number.isNaN(parsed)
      ? Math.max(0, Math.round(parsed * 100) / 100)
      : 0;
  }

  // Safe originalPrice
  let originalPrice = null;
  if (
    typeof rawItem.originalPrice === 'number' &&
    !Number.isNaN(rawItem.originalPrice)
  ) {
    originalPrice = Math.max(0, Math.round(rawItem.originalPrice * 100) / 100);
  }

  // Safe available inventory
  let available = 0;
  if (
    typeof rawItem.available === 'number' &&
    !Number.isNaN(rawItem.available)
  ) {
    available = Math.max(0, Math.floor(rawItem.available));
  } else if (typeof rawItem.stock === 'number') {
    available = Math.max(0, Math.floor(rawItem.stock));
  } else if (typeof rawItem.quantity === 'number') {
    available = Math.max(0, Math.floor(rawItem.quantity));
  }

  // Safe image & images array
  let image = DEFAULT_PRODUCT_IMAGE;
  if (typeof rawItem.image === 'string' && rawItem.image.trim().length > 0) {
    image = rawItem.image.trim();
  } else if (
    Array.isArray(rawItem.images) &&
    rawItem.images.length > 0 &&
    typeof rawItem.images[0] === 'string'
  ) {
    image = rawItem.images[0].trim();
  }

  let images = [image];
  if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
    const validImages = rawItem.images.filter(
      (img) => typeof img === 'string' && img.trim().length > 0
    );
    if (validImages.length > 0) {
      images = validImages;
    }
  }

  // Safe rating
  let rating = { average: 4.8, count: 12 };
  if (rawItem.rating && typeof rawItem.rating === 'object') {
    const avg = parseFloat(rawItem.rating.average);
    const count = parseInt(rawItem.rating.count, 10);
    rating = {
      average: !Number.isNaN(avg) ? Math.min(5, Math.max(0, avg)) : 4.8,
      count: !Number.isNaN(count) ? Math.max(0, count) : 12,
    };
  } else if (typeof rawItem.rating === 'number') {
    rating = {
      average: Math.min(5, Math.max(0, rawItem.rating)),
      count: 10,
    };
  }

  // Safe description
  const description =
    typeof rawItem.description === 'string' &&
    rawItem.description.trim().length > 0
      ? rawItem.description.trim()
      : 'Premium quality product crafted with superior materials and design.';

  const shortDescription =
    typeof rawItem.shortDescription === 'string' &&
    rawItem.shortDescription.trim().length > 0
      ? rawItem.shortDescription.trim()
      : description.slice(0, 100);

  // Safe category
  const category =
    typeof rawItem.category === 'string' && rawItem.category.trim().length > 0
      ? rawItem.category.trim()
      : 'General > Premium';

  // Safe tags
  const tags = Array.isArray(rawItem.tags)
    ? rawItem.tags.filter((t) => typeof t === 'string')
    : ['curated'];

  // Safe badges
  const badges = Array.isArray(rawItem.badges)
    ? rawItem.badges.filter((b) => typeof b === 'string')
    : rawItem.badge && typeof rawItem.badge === 'string'
      ? [rawItem.badge]
      : [];

  // Safe variants
  const variants = Array.isArray(rawItem.variants)
    ? rawItem.variants.filter((v) => typeof v === 'string')
    : [];

  // Safe specifications
  const specifications =
    rawItem.specifications &&
    typeof rawItem.specifications === 'object' &&
    !Array.isArray(rawItem.specifications)
      ? { ...rawItem.specifications }
      : {};

  // Safe shipping
  const shipping = {
    free: rawItem.shipping?.free !== false,
    estimate:
      typeof rawItem.shipping?.estimate === 'string'
        ? rawItem.shipping.estimate
        : '2-4 business days',
  };

  // Safe reviews
  const reviews = Array.isArray(rawItem.reviews)
    ? rawItem.reviews.map((r, i) => ({
        id: r.id || `rev-${i}`,
        author: r.author || 'Verified Customer',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        date: r.date || 'Recently',
        title: r.title || 'Great product',
        content: r.content || 'Very happy with the quality and purchase.',
        verified: r.verified !== false,
        helpful: typeof r.helpful === 'number' ? r.helpful : 0,
      }))
    : [];

  // Safe related products
  const relatedProducts = Array.isArray(rawItem.relatedProducts)
    ? rawItem.relatedProducts.filter((p) => typeof p === 'string')
    : [];

  return {
    itemid,
    productName,
    manufacturer,
    category,
    tags,
    price,
    originalPrice,
    available,
    quantity: 1,
    description,
    shortDescription,
    image,
    images,
    url: `/products/${itemid}`,
    badges,
    rating,
    variants,
    specifications,
    shipping,
    reviews,
    relatedProducts,
  };
}

/**
 * Validates whether a raw product strictly satisfies the API contract.
 *
 * @param {unknown} rawItem - Item to inspect
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProductContract(rawItem) {
  const errors = [];

  if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
    return {
      valid: false,
      errors: ['Item payload must be a non-null JSON object'],
    };
  }

  if (
    typeof rawItem.itemid !== 'string' ||
    rawItem.itemid.trim().length === 0
  ) {
    errors.push('Missing or invalid required string field: itemid');
  }

  if (
    typeof rawItem.productName !== 'string' ||
    rawItem.productName.trim().length === 0
  ) {
    errors.push('Missing or invalid required string field: productName');
  }

  if (
    typeof rawItem.price !== 'number' ||
    Number.isNaN(rawItem.price) ||
    rawItem.price < 0
  ) {
    errors.push('Field price must be a non-negative number');
  }

  if (
    typeof rawItem.available !== 'number' ||
    Number.isNaN(rawItem.available) ||
    rawItem.available < 0
  ) {
    errors.push('Field available must be a non-negative integer');
  }

  if (typeof rawItem.image !== 'string' || rawItem.image.trim().length === 0) {
    errors.push('Missing or invalid required string field: image');
  }

  if (rawItem.rating !== undefined) {
    if (typeof rawItem.rating !== 'object' || rawItem.rating === null) {
      errors.push('Field rating must be an object { average, count }');
    } else {
      if (
        typeof rawItem.rating.average !== 'number' ||
        rawItem.rating.average < 0 ||
        rawItem.rating.average > 5
      ) {
        errors.push('Field rating.average must be a number between 0 and 5');
      }
      if (
        typeof rawItem.rating.count !== 'number' ||
        rawItem.rating.count < 0
      ) {
        errors.push('Field rating.count must be a non-negative number');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates and repairs corrupted cart state (e.g. from localStorage or network).
 *
 * @param {unknown} state - Candidate cart state
 * @param {Array} inventory - Available inventory catalog
 * @returns {object} Safe sanitized state
 */
export function validateCartState(state, inventory = []) {
  const safeState = {
    cart: [],
    inventory: Array.isArray(inventory) ? inventory.map(normalizeProduct) : [],
    favorites: [],
    discountCode: null,
    discountPercent: 0,
    isDrawerOpen: false,
    shippingZip: '94105',
    shippingMethod: 'standard',
  };

  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return safeState;
  }

  // Repair cart items
  if (Array.isArray(state.cart)) {
    safeState.cart = state.cart
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const normalized = normalizeProduct(item);
        const qty =
          typeof item.quantity === 'number' && !Number.isNaN(item.quantity)
            ? Math.max(1, Math.min(99, Math.floor(item.quantity)))
            : 1;
        return {
          ...normalized,
          quantity: qty,
        };
      });
  }

  // Repair favorites
  if (Array.isArray(state.favorites)) {
    safeState.favorites = state.favorites.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );
  }

  // Repair discount
  if (typeof state.discountCode === 'string') {
    safeState.discountCode = state.discountCode.toUpperCase().trim();
  }
  if (
    typeof state.discountPercent === 'number' &&
    !Number.isNaN(state.discountPercent)
  ) {
    safeState.discountPercent = Math.max(
      0,
      Math.min(100, state.discountPercent)
    );
  }

  if (typeof state.isDrawerOpen === 'boolean') {
    safeState.isDrawerOpen = state.isDrawerOpen;
  }

  return safeState;
}

// Simple deterministic string hash for fallback IDs
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
