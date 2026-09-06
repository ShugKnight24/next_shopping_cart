import items from '../data/items.json';
import techItems from '../data/techItems.json';
import enhancedProducts from '../data/products.json';

// Global map of enhanced data
const enhancedMap = new Map(enhancedProducts.map((p) => [p.itemid, p]));

/**
 * Category-specific FAQs generator
 */
function getDefaultFAQs(product) {
  const cat = (product.category || '').toLowerCase();
  const name = product.productName || 'Product';

  if (cat.includes('footwear') || cat.includes('shoes') || cat.includes('jordan') || cat.includes('running')) {
    return [
      {
        question: 'How do these shoes fit (sizing guide)?',
        answer: `${name} fits true to standard athletic sizing. For wide feet, we recommend ordering half a size up for maximum comfort.`,
      },
      {
        question: 'Are these authentic and brand new in original box?',
        answer: 'Yes, 100% deadstock authentic guaranteed with original factory box, verification tags, and extra laces where applicable.',
      },
      {
        question: 'What is the return policy if the size does not fit?',
        answer: 'We offer hassle-free 30-day returns and free size exchanges on all unworn footwear in original packaging.',
      },
    ];
  }

  if (cat.includes('instrument') || cat.includes('guitar') || cat.includes('piano') || cat.includes('audio')) {
    return [
      {
        question: 'Does this come with manufacturer warranty and inspection?',
        answer: 'Yes, every instrument includes a multi-point inspection before dispatch and comes with full official manufacturer warranty coverage.',
      },
      {
        question: 'How is this packaged for safe shipping?',
        answer: 'Instruments are packed in heavy-duty reinforced double-walled boxes with climate cushioning to protect against transit shock and temperature changes.',
      },
      {
        question: 'What accessories are included in the box?',
        answer: 'Includes all factory accessories, user manual, calibration certificates, and protective case or gig bag where specified.',
      },
    ];
  }

  if (cat.includes('fitness') || cat.includes('weights') || cat.includes('barbell')) {
    return [
      {
        question: 'What is the maximum weight capacity and warranty?',
        answer: 'Commercial-grade steel construction rated for rigorous gym use with lifetime structural warranty.',
      },
      {
        question: 'Does freight delivery include inside delivery?',
        answer: 'Standard shipping includes curbside liftgate delivery. White-glove indoor placement is available at checkout.',
      },
    ];
  }

  if (cat.includes('collectible') || cat.includes('mtg') || cat.includes('warhammer')) {
    return [
      {
        question: 'How is authenticity and condition verified?',
        answer: 'Each collectible is authenticated by certified specialists, sleeved/cased in archival-grade protective holders, and insured for 100% of value.',
      },
      {
        question: 'Is signature required upon delivery?',
        answer: 'Yes, all rare collectibles and high-value orders require direct adult signature upon delivery.',
      },
    ];
  }

  // Default tech/general FAQs
  return [
    {
      question: 'What warranty is included with this device?',
      answer: 'Includes 1-year comprehensive manufacturer warranty with optional extended protection plans available at checkout.',
    },
    {
      question: 'How fast will my order ship?',
      answer: 'Orders placed before 2:00 PM EST ship same day via express insured courier.',
    },
    {
      question: 'What is your return policy?',
      answer: 'Enjoy a 30-day money-back guarantee with free return shipping on all eligible products.',
    },
  ];
}

/**
 * Returns a unified list of all products combining enhanced and legacy datasets
 */
export function getAllProducts() {
  const seen = new Set();
  const unified = [];

  // 1. First add enhanced products (rich metadata)
  for (const item of enhancedProducts) {
    if (!seen.has(item.itemid)) {
      seen.add(item.itemid);
      unified.push(normalizeProduct(item));
    }
  }

  // 2. Add legacy items and tech items if not already present
  for (const item of [...items, ...techItems]) {
    if (!seen.has(item.itemid)) {
      seen.add(item.itemid);
      unified.push(normalizeProduct(item));
    }
  }

  return unified;
}

/**
 * Normalizes a single product object ensuring all rich properties exist
 */
export function normalizeProduct(item) {
  const enhanced = enhancedMap.get(item.itemid) || {};
  const baseImage = item.image || enhanced.image || '/images/placeholder.svg';
  const additional = enhanced.images || item.images || [];
  const images = Array.from(new Set([baseImage, ...additional])).filter(Boolean);

  const price = typeof item.price === 'number' ? item.price : enhanced.price || 0;
  const originalPrice =
    item.originalPrice !== undefined
      ? item.originalPrice
      : enhanced.originalPrice || null;

  const rawShipping = enhanced.shipping || item.shipping || {};
  const shipping = {
    free: rawShipping.free !== undefined ? rawShipping.free : (rawShipping.freeShipping !== undefined ? rawShipping.freeShipping : price >= 50),
    estimate: rawShipping.estimate || rawShipping.estimatedDelivery || '2-3 business days',
    cost: rawShipping.cost !== undefined ? rawShipping.cost : (rawShipping.shippingCost || (price >= 50 ? 0 : 9.99)),
  };

  const specifications = {
    ...(enhanced.specifications || {}),
    ...(item.specifications || {}),
  };

  const reviews = enhanced.reviews || item.reviews || [
    {
      id: `rev-${item.itemid}-1`,
      author: 'Verified Customer',
      rating: 5,
      date: '2026-02-18',
      title: 'Exceeded my expectations!',
      content: `Incredible quality and craftsmanship. ${item.productName || 'This product'} arrived in flawless condition and performs exactly as described.`,
      verified: true,
      helpful: 19,
    },
    {
      id: `rev-${item.itemid}-2`,
      author: 'Alex M.',
      rating: 5,
      date: '2026-01-24',
      title: 'Top-tier purchase',
      content: 'Shipped faster than expected. Attention to detail is unmistakable. Highly recommended!',
      verified: true,
      helpful: 12,
    },
  ];

  const rating = enhanced.rating || item.rating || {
    average: 4.9,
    count: reviews.length || 18,
  };

  const badges = enhanced.badges || item.badges || (item.badge ? [item.badge] : []);
  if (originalPrice && originalPrice > price && !badges.includes('sale')) {
    badges.push('sale');
  }

  // Generate variants if missing
  let variants = enhanced.variants || item.variants || [];
  if (variants.length === 0) {
    const cat = (item.category || enhanced.category || '').toLowerCase();
    if (cat.includes('footwear') || cat.includes('shoes') || cat.includes('running') || cat.includes('jordan')) {
      variants = [
        { id: 'v-9', name: 'US 9.0', priceModifier: 0, available: true, value: '#1e3a5f' },
        { id: 'v-95', name: 'US 9.5', priceModifier: 0, available: true, value: '#1e3a5f' },
        { id: 'v-10', name: 'US 10.0', priceModifier: 0, available: true, value: '#1e3a5f' },
        { id: 'v-105', name: 'US 10.5', priceModifier: 15, available: true, value: '#1e3a5f' },
        { id: 'v-11', name: 'US 11.0', priceModifier: 20, available: true, value: '#1e3a5f' },
        { id: 'v-12', name: 'US 12.0', priceModifier: 25, available: true, value: '#1e3a5f' },
      ];
    } else if (cat.includes('guitar') || cat.includes('instrument')) {
      variants = [
        { id: 'v-finish-1', name: 'Standard Edition', priceModifier: 0, available: true, value: '#8b0000' },
        { id: 'v-finish-2', name: 'Custom Gloss Finish', priceModifier: 150, available: true, value: '#111827' },
      ];
    } else if (cat.includes('weights') || cat.includes('fitness')) {
      variants = [
        { id: 'v-wt-standard', name: 'Standard Pair', priceModifier: 0, available: true, value: '#374151' },
        { id: 'v-wt-stand', name: 'With Heavy-Duty Stand', priceModifier: 120, available: true, value: '#1e3a5f' },
      ];
    }
  }

  const merged = {
    itemid: item.itemid,
    productName: item.productName || enhanced.productName || 'Product',
    manufacturer: item.manufacturer || enhanced.manufacturer || 'Premium Brand',
    category: item.category || enhanced.category || 'General',
    tags: enhanced.tags || item.tags || [],
    price,
    originalPrice,
    available: typeof item.available === 'number' ? item.available : (typeof enhanced.available === 'number' ? enhanced.available : 10),
    quantity: item.quantity || enhanced.quantity || 1,
    description: item.description || enhanced.description || '',
    shortDescription: enhanced.shortDescription || item.description || '',
    image: baseImage,
    images: images.length > 0 ? images : [baseImage],
    url: item.url || enhanced.url || `/products/${item.itemid}`,
    badges,
    badge: badges[0] || null,
    rating,
    variants,
    specifications,
    shipping,
    reviews,
    faqs: enhanced.faqs || getDefaultFAQs({ ...item, ...enhanced }),
    relatedProducts: enhanced.relatedProducts || [],
    favorite: Boolean(item.favorite),
  };

  return merged;
}

/**
 * Get product by ID
 */
export function getProductById(productId) {
  const all = getAllProducts();
  return all.find((p) => String(p.itemid).toLowerCase() === String(productId).toLowerCase()) || null;
}

/**
 * Get related products for a product
 */
export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const all = getAllProducts();

  // 1. Check explicit related IDs
  if (product.relatedProducts && product.relatedProducts.length > 0) {
    const explicit = product.relatedProducts
      .map((id) => all.find((p) => p.itemid === id))
      .filter(Boolean);
    if (explicit.length >= limit) return explicit.slice(0, limit);
  }

  // 2. Filter by same category
  const sameCategory = all.filter(
    (p) => p.itemid !== product.itemid && p.category === product.category
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // 3. Fallback to general high-rated products
  const others = all.filter((p) => p.itemid !== product.itemid && !sameCategory.includes(p));
  return [...sameCategory, ...others].slice(0, limit);
}
