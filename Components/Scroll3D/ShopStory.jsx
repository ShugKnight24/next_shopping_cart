import { ScrollStory } from './ScrollStory';

/**
 * The storefront's scroll story, above the classic hero. Captions are module
 * constants so the scene is built once, not on every render.
 */
const CAPTIONS = [
  {
    at: [0, 0.1],
    kicker: 'Cart Commerce',
    title: 'Shop smarter. Live better.',
    body: 'Authentic sneakers, studio-grade audio, collectible cards and premium fitness gear, curated in one place. Scroll for the tour.',
  },
  {
    at: [0.13, 0.34],
    kicker: 'Curated drops',
    title: 'Only the good stuff.',
    body: 'Every piece is hand-picked and verified authentic before it ever reaches the shelf.',
  },
  {
    at: [0.39, 0.62],
    kicker: 'One cart',
    title: 'Everything you love, in one checkout.',
    body: 'The sneakers, the headphones, the guitar and the rookie card you have been hunting for. One cart, one order.',
  },
  {
    at: [0.66, 0.86],
    kicker: 'Checkout in seconds',
    title: 'Pay your way. Ship it fast.',
    body: 'Apple Pay, Klarna and every major card, with free express shipping on qualifying orders.',
  },
  {
    at: [0.9, 1.01],
    kicker: 'Ready when you are',
    title: 'Find your next favourite.',
    body: 'Browse the full collection, or design something one of a kind in the Studio.',
    ctas: [
      { href: '/products', label: 'Shop the collection', primary: true },
      { href: '/studio', label: 'Design something custom' },
    ],
  },
];

const loadScene = async (args) => {
  const { loadShopScene } = await import('./shopScene');
  return loadShopScene(args);
};

export const ShopStory = () => (
  <ScrollStory
    id="shop-story"
    label="A quick tour of Cart Commerce"
    captions={CAPTIONS}
    loadScene={loadScene}
    height={620}
    mobileHeight={540}
    skipTo="#main-hero"
  />
);
