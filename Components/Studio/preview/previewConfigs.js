import { spreadConfig } from '../book/bookPages';
import {
  drawApparelSubstrate,
  drawBookSubstrate,
  drawPosterSubstrate,
} from '../drawSubstrate';
import { GARMENT_COLORS, POSTER_FRAMES, PRODUCTS } from '../workbench/products';

/**
 * The three embedded previews on the studio page.
 *
 * Each one is the real editor's opening, small: a finished idea acted out by
 * a kid the visitor names and picks, drawn by the same renderers. Three or
 * four choices prove it is theirs to make; "Continue" opens exactly this in
 * the full designer, which rebuilds it from the idea and the kid
 * (`meta.idea`, `meta.hero`) rather than a long layer list.
 */

/** The book draws the open spread; the preview shows its first story page. */
const drawBook = (ctx, board) =>
  drawBookSubstrate(ctx, {
    ...board,
    config: spreadConfig(board.config ?? {}),
  });

export const PREVIEWS = [
  {
    id: 'book',
    product: PRODUCTS.book,
    templateMode: 'book',
    drawSubstrate: drawBook,
    ideas: ['adventure', 'birthday', 'seasons', 'together'],
    ideaLabel: 'Story',
    eyebrow: 'Kids Favorite',
    headline: "Children's Storybooks",
    blurb:
      'Hardcover storybooks starring your child, acting out every page with the people and pets they love.',
    swatch: null,
    upsell: {
      title: 'In the full designer',
      features: [
        'Make the whole family, from hair to sneakers',
        'Nine story moments and eight illustrated worlds',
        'Move every character, word and piece of scenery',
        'Add, reorder and proof every page',
      ],
    },
  },

  {
    id: 'poster',
    product: PRODUCTS.poster,
    templateMode: 'poster',
    drawSubstrate: drawPosterSubstrate,
    ideas: ['birthday', 'room', 'adventure', 'pals'],
    ideaLabel: 'Poster',
    eyebrow: 'Gallery Archival',
    headline: 'Framed Art Posters',
    blurb:
      'Museum-grade prints of your kid as the star, framed and ready to hang the day they arrive.',
    swatch: {
      key: 'frame',
      label: 'Frame',
      options: POSTER_FRAMES.filter((f) => f.color).map((f) => ({
        value: f.id,
        name: f.name,
        color: f.color,
      })),
    },
    upsell: {
      title: 'In the full designer',
      features: [
        'Six poster ideas, eight illustrated backdrops',
        'Sizes, mounts and paper stocks you can see',
        'Your whole cast, posed and moved anywhere',
        'A live 300 DPI proof in every frame',
      ],
    },
  },

  {
    id: 'apparel',
    product: PRODUCTS.apparel,
    templateMode: 'apparel',
    drawSubstrate: drawApparelSubstrate,
    ideas: ['star', 'space', 'pet', 'crew'],
    ideaLabel: 'Design',
    eyebrow: 'Craft Workshop',
    headline: "Kids' Apparel & Kicks",
    blurb:
      'Organic hoodies, tees and varsity jackets printed with their own character and name.',
    swatch: {
      key: 'color',
      label: 'Colourway',
      options: GARMENT_COLORS.map((c) => ({
        value: c.value,
        name: c.name,
        color: c.value,
      })),
    },
    upsell: {
      title: 'In the full designer',
      features: [
        'Hoodies, tees, varsity jackets and high-tops',
        'Pocket, chest or a hero backprint',
        'Screen print, satin, chain stitch or puff',
        'Your design on every garment at a glance',
      ],
    },
  },
];
