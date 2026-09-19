/**
 * What each workbench is editing.
 *
 * One entry per route: the artboard it draws on, the substrate options the
 * inspector exposes for the product itself, the print spec shown in the status
 * bar, and how the piece is priced. The workbench and its panels stay
 * product-agnostic by reading everything from here.
 */

import { computePrice, modifierFor } from '../core/pricing';

/* ------------------------------------------------------------- poster -- */

export const POSTER_SIZES = [
  {
    id: '12x18',
    name: '12" × 18"',
    sub: 'Compact',
    price: 29.99,
    ratio: 2 / 3,
    inches: [12, 18],
  },
  {
    id: '18x24',
    name: '18" × 24"',
    sub: 'Most popular',
    price: 44.99,
    ratio: 3 / 4,
    inches: [18, 24],
  },
  {
    id: '24x36',
    name: '24" × 36"',
    sub: 'Gallery grand',
    price: 59.99,
    ratio: 2 / 3,
    inches: [24, 36],
  },
];

export const POSTER_FRAMES = [
  { id: 'none', name: 'Unframed', priceModifier: 0, color: null },
  { id: 'oak', name: 'Solid Oak', priceModifier: 25, color: '#c8a26a' },
  { id: 'black', name: 'Gallery Black', priceModifier: 20, color: '#16181d' },
  { id: 'white', name: 'Gallery White', priceModifier: 20, color: '#f4f4f2' },
  { id: 'gold', name: 'Vintage Gold', priceModifier: 30, color: '#c9a227' },
];

export const POSTER_PAPERS = [
  { id: 'cotton', name: 'Cotton Rag', sub: 'Matte, warm', priceModifier: 0 },
  { id: 'luster', name: 'Pearl Luster', sub: 'Soft sheen', priceModifier: 10 },
  {
    id: 'canvas',
    name: 'Stretched Canvas',
    sub: 'Woven texture',
    priceModifier: 15,
  },
];

export const POSTER_MATS = [
  { id: 'none', name: 'No Mount', priceModifier: 0 },
  { id: 'white', name: 'White Mat', priceModifier: 12 },
  { id: 'offwhite', name: 'Off-White Mat', priceModifier: 12 },
  { id: 'black', name: 'Black Core', priceModifier: 16 },
];

/* ------------------------------------------------------------ apparel -- */

export const GARMENTS = [
  {
    id: 'hoodie',
    name: "Organic Kids' Hoodie",
    sub: 'Organic fleece',
    price: 48,
  },
  { id: 'tee', name: "Kids' Heavyweight Tee", sub: '240gsm cotton', price: 32 },
  {
    id: 'jacket',
    name: "Kids' Varsity Jacket",
    sub: 'Snap closure',
    price: 68,
  },
  {
    id: 'kicks',
    name: 'Custom Canvas High-Tops',
    sub: 'Cushioned insole',
    price: 65,
  },
];

export const YOUTH_SIZES = [
  { id: 'Youth XS', name: 'Youth XS', sub: '4-5 yrs', priceModifier: 0 },
  { id: 'Youth S', name: 'Youth S', sub: '6-7 yrs', priceModifier: 0 },
  { id: 'Youth M', name: 'Youth M', sub: '8-9 yrs', priceModifier: 0 },
  { id: 'Youth L', name: 'Youth L', sub: '10-12 yrs', priceModifier: 2.5 },
  { id: 'Youth XL', name: 'Youth XL', sub: '14-16 yrs', priceModifier: 4.5 },
];

export const GARMENT_COLORS = [
  { value: '#1e293b', name: 'Midnight Navy' },
  { value: '#475569', name: 'Heather Slate' },
  { value: '#f8fafc', name: 'Vintage Cream' },
  { value: '#064e3b', name: 'Forest Pine' },
  { value: '#991b1b', name: 'Crimson Red' },
  { value: '#b45309', name: 'Goldenrod Ochre' },
  { value: '#7c3aed', name: 'Soft Lavender' },
  { value: '#0f172a', name: 'Ink Black' },
];

export const PLACEMENTS = [
  { id: 'pocket', name: 'Left Pocket', sub: 'Subtle', priceModifier: 0 },
  { id: 'chest', name: 'Center Chest', sub: 'Full width', priceModifier: 4 },
  { id: 'back', name: 'Hero Backprint', sub: 'Oversized', priceModifier: 9 },
];

export const FINISHES = [
  { id: 'screen', name: 'Flat Screen Print', priceModifier: 0 },
  { id: 'satin', name: 'Satin Stitch', priceModifier: 5 },
  { id: 'chain', name: 'Chain Stitch', priceModifier: 7 },
  { id: 'puff', name: 'Puff Print', priceModifier: 9 },
];

/* --------------------------------------------------------------- book -- */

export const BOOK_FORMATS = [
  { id: 'square', name: '8" × 8" Square', price: 54, ratio: 1, inches: [8, 8] },
  {
    id: 'portrait',
    name: '8" × 10" Portrait',
    price: 59,
    ratio: 0.8,
    inches: [8, 10],
  },
  {
    id: 'landscape',
    name: '11" × 8.5" Landscape',
    price: 64,
    ratio: 11 / 8.5,
    inches: [11, 8.5],
  },
];

export const BOOK_COVERS = [
  { id: 'hardcover', name: 'Lay-Flat Hardcover', priceModifier: 0 },
  { id: 'linen', name: 'Linen Wrap', priceModifier: 14 },
  { id: 'foil', name: 'Foil-Stamped Linen', priceModifier: 22 },
];

export const BOOK_PAPERS = [
  { id: 'velvet', name: 'Velvet Touch 200gsm', priceModifier: 0 },
  { id: 'archival', name: 'Archival Matte 240gsm', priceModifier: 9 },
];

/* ------------------------------------------------------------ registry -- */

/** Artboard units are design pixels; the print spec converts to inches/DPI. */
const artboardFor = (ratio, longEdge = 620) =>
  ratio >= 1
    ? { width: Math.round(longEdge), height: Math.round(longEdge / ratio) }
    : { width: Math.round(longEdge * ratio), height: Math.round(longEdge) };

export const PRODUCTS = {
  poster: {
    mode: 'poster',
    route: '/studio/poster',
    title: 'Framed Art Poster',
    blurb: 'Museum-grade giclée prints, framed and ready to hang.',
    manufacturer: 'Cart Gallery Press',
    idPrefix: 'CUSTOM-POSTER',
    defaults: {
      size: '18x24',
      orientation: 'portrait',
      frame: 'oak',
      paper: 'cotton',
      mat: 'none',
      artStyle: 'cosmic',
    },
    artboard: (options) => {
      const size =
        POSTER_SIZES.find((s) => s.id === options.size) ?? POSTER_SIZES[1];
      const ratio =
        options.orientation === 'landscape' ? 1 / size.ratio : size.ratio;
      return artboardFor(ratio);
    },
    printSpec: (options) => {
      const size =
        POSTER_SIZES.find((s) => s.id === options.size) ?? POSTER_SIZES[1];
      const [w, h] =
        options.orientation === 'landscape'
          ? [size.inches[1], size.inches[0]]
          : size.inches;
      return `${w}" × ${h}" · 300 DPI`;
    },
    price: (options, layerCount, quantity) =>
      computePrice({
        base: (
          POSTER_SIZES.find((s) => s.id === options.size) ?? POSTER_SIZES[1]
        ).price,
        baseLabel: (
          POSTER_SIZES.find((s) => s.id === options.size) ?? POSTER_SIZES[1]
        ).name,
        modifiers: [
          modifierFor(
            POSTER_FRAMES.find((f) => f.id === options.frame),
            'Frame'
          ),
          modifierFor(
            POSTER_PAPERS.find((p) => p.id === options.paper),
            'Paper'
          ),
          modifierFor(
            POSTER_MATS.find((m) => m.id === options.mat),
            'Mount'
          ),
        ].filter(Boolean),
        layerCount,
        perLayer: 3.5,
        freeLayers: 6,
        quantity,
      }),
  },

  apparel: {
    mode: 'apparel',
    route: '/studio/apparel',
    title: "Kids' Custom Apparel",
    blurb: 'Organic hoodies, tees, varsity jackets and canvas kicks.',
    manufacturer: 'Cart Kids Craft Studio',
    idPrefix: 'CUSTOM-APPAREL',
    defaults: {
      garment: 'hoodie',
      size: 'Youth S',
      color: '#1e293b',
      accentColor: '#f8fafc',
      placement: 'chest',
      finish: 'satin',
    },
    // The garment art uses absolute coordinates tuned for the 520x420 canvas it
    // was drawn on. Any other artboard leaves the silhouette mis-proportioned,
    // so the editor adopts the art's own frame rather than re-tuning 300 lines
    // of vector work.
    artboard: () => ({ width: 520, height: 420 }),
    printSpec: (options) =>
      `${options.size} · ${
        (PLACEMENTS.find((p) => p.id === options.placement) ?? PLACEMENTS[1])
          .name
      }`,
    price: (options, layerCount, quantity) =>
      computePrice({
        base: (GARMENTS.find((g) => g.id === options.garment) ?? GARMENTS[0])
          .price,
        baseLabel: (
          GARMENTS.find((g) => g.id === options.garment) ?? GARMENTS[0]
        ).name,
        modifiers: [
          modifierFor(
            YOUTH_SIZES.find((s) => s.id === options.size),
            'Size'
          ),
          modifierFor(
            PLACEMENTS.find((p) => p.id === options.placement),
            'Placement'
          ),
          modifierFor(
            FINISHES.find((f) => f.id === options.finish),
            'Finish'
          ),
        ].filter(Boolean),
        layerCount,
        perLayer: 4.5,
        freeLayers: 3,
        quantity,
      }),
  },

  book: {
    mode: 'storybook',
    route: '/studio/book',
    title: 'Personalized Storybook',
    blurb: 'Hardcover heirloom books starring your child.',
    manufacturer: 'Cart Heirloom Bindery',
    idPrefix: 'CUSTOM-BOOK',
    defaults: {
      format: 'square',
      cover: 'hardcover',
      paper: 'velvet',
      theme: 'space',
      sceneId: null,
      timeOfDay: 'day',
      weatherEffect: 'none',
      activePage: 0,
    },
    artboard: (options) => {
      const format =
        BOOK_FORMATS.find((f) => f.id === options.format) ?? BOOK_FORMATS[0];
      return artboardFor(format.ratio, 620);
    },
    printSpec: (options) => {
      const format =
        BOOK_FORMATS.find((f) => f.id === options.format) ?? BOOK_FORMATS[0];
      return `${format.name} · Lay-flat · 300 DPI`;
    },
    price: (options, layerCount, quantity) =>
      computePrice({
        base: (
          BOOK_FORMATS.find((f) => f.id === options.format) ?? BOOK_FORMATS[0]
        ).price,
        baseLabel: (
          BOOK_FORMATS.find((f) => f.id === options.format) ?? BOOK_FORMATS[0]
        ).name,
        modifiers: [
          modifierFor(
            BOOK_COVERS.find((c) => c.id === options.cover),
            'Cover'
          ),
          modifierFor(
            BOOK_PAPERS.find((p) => p.id === options.paper),
            'Paper'
          ),
        ].filter(Boolean),
        layerCount,
        perLayer: 0,
        freeLayers: 999,
        quantity,
      }),
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export const productFor = (key) => PRODUCTS[key] ?? null;
