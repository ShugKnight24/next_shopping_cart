/**
 * Store products a design can feature. Remote photos are requested with CORS
 * (see castRaster's imageForUrl): every catalogue host sends
 * `Access-Control-Allow-Origin`, so they draw without tainting the canvas,
 * and a host that stopped would fail to load rather than break export.
 */

import products from '../../../data/products.json';

export const CATALOG = products
  .filter((p) => typeof p.image === 'string' && p.image)
  .map((p) => ({
    itemid: p.itemid,
    productName: p.productName,
    manufacturer: p.manufacturer,
    price: p.price,
    image: p.image,
    category: p.category,
  }));

const FEATURED = 'JORDAN-1-LOST-FOUND';

export const featuredProduct = () =>
  CATALOG.find((p) => p.itemid === FEATURED) ?? CATALOG[0] ?? null;

export const productById = (id) => CATALOG.find((p) => p.itemid === id) ?? null;
