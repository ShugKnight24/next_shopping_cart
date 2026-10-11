/**
 * Store products a design can feature: only those whose photo is served from
 * this site, so a post that shows one can still be exported (a photo from
 * another origin would taint the canvas).
 */

import products from '../../../data/products.json';

export const CATALOG = products
  .filter((p) => typeof p.image === 'string' && /^\/(?!\/)/.test(p.image))
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
