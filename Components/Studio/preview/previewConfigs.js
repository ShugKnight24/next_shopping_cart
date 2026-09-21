import {
  drawApparelSubstrate,
  drawBookSubstrate,
  drawPosterSubstrate,
} from '../drawSubstrate';
import { SCENE_ENVIRONMENTS } from '../sceneEnvironments';
import {
  BOOK_FORMATS,
  GARMENTS,
  GARMENT_COLORS,
  POSTER_FRAMES,
  POSTER_SIZES,
  PRODUCTS,
} from '../workbench/products';

/**
 * The three embedded previews.
 *
 * Each exposes three or four controls — enough to prove the product is really
 * customizable, few enough that the full designer is obviously the place to
 * finish. `slot_*` keys write into the starter template's matching slot role,
 * which is how a visitor's typed words survive the handoff.
 */

export const PREVIEWS = [
  {
    id: 'book',
    product: PRODUCTS.book,
    templateMode: 'book',
    drawSubstrate: drawBookSubstrate,
    starterTemplateId: 'book-classic-storybook',
    eyebrow: 'Kids Favorite',
    headline: "Children's Storybooks",
    blurb:
      'Personalized hardcover heirloom books starring your child, their companion, and the world you choose for them.',
    fields: [
      {
        key: 'slot_title',
        type: 'text',
        label: 'Story title',
        placeholder: "Maya's Cosmic Quest",
        maxLength: 28,
      },
      {
        key: 'sceneId',
        type: 'select',
        label: 'Scene',
        options: SCENE_ENVIRONMENTS.slice(0, 6),
      },
      {
        key: 'format',
        type: 'select',
        label: 'Format',
        options: BOOK_FORMATS,
      },
    ],
    upsell: {
      title: 'In the full designer',
      features: [
        'Design the hero and their companion, feature by feature',
        'Eight cover and spread templates, seven styles',
        'Layer artwork anywhere on the page',
        'Live 300 DPI proof and lay-flat binding preview',
      ],
    },
  },

  {
    id: 'poster',
    product: PRODUCTS.poster,
    templateMode: 'poster',
    drawSubstrate: drawPosterSubstrate,
    starterTemplateId: 'poster-type-slab',
    eyebrow: 'Gallery Archival',
    headline: 'Framed Art Posters',
    blurb:
      'Museum-grade giclée prints on archival stock, framed and ready to hang the day they arrive.',
    fields: [
      {
        key: 'slot_title',
        type: 'text',
        label: 'Headline',
        placeholder: 'The Bravest Explorer',
        maxLength: 28,
      },
      {
        key: 'size',
        type: 'select',
        label: 'Print size',
        options: POSTER_SIZES,
      },
      {
        key: 'frame',
        type: 'select',
        label: 'Frame',
        options: POSTER_FRAMES,
      },
    ],
    upsell: {
      title: 'In the full designer',
      features: [
        'Twelve layouts across six categories, seven styles',
        'Add text, shapes and artwork anywhere on the artboard',
        'Mats, paper stocks and custom ink colours',
        'Zoom, snap guides and a live 300 DPI proof',
      ],
    },
  },

  {
    id: 'apparel',
    product: PRODUCTS.apparel,
    templateMode: 'apparel',
    drawSubstrate: drawApparelSubstrate,
    starterTemplateId: 'apparel-monogram-stacked',
    eyebrow: 'Craft Workshop',
    headline: "Kids' Apparel & Kicks",
    blurb:
      'Organic cotton hoodies, tees, varsity jackets and canvas high-tops, embroidered to order.',
    fields: [
      {
        key: 'slot_title',
        type: 'text',
        label: 'Monogram',
        placeholder: 'NOAH',
        maxLength: 12,
      },
      {
        key: 'garment',
        type: 'select',
        label: 'Garment',
        options: GARMENTS,
      },
      {
        key: 'color',
        type: 'swatch',
        label: 'Colourway',
        options: GARMENT_COLORS,
      },
    ],
    upsell: {
      title: 'In the full designer',
      features: [
        'Ten layouts across six categories, seven styles',
        'Accent trim, placement zones and embroidery finishes',
        'Layer badges, artwork and lettering freely',
        'Stitch proof before anything goes to the machine',
      ],
    },
  },
];
