import { ScrollStory } from './ScrollStory';

/** The Studio's scroll story, above the classic studio hero. */
const CAPTIONS = [
  {
    at: [0, 0.1],
    kicker: 'The Custom Creation Studio',
    title: 'Make them the stars.',
    body: 'Design characters who look just like your kids, then put them in a storybook together, on a poster side by side and on tops of their own.',
  },
  {
    at: [0.13, 0.32],
    kicker: 'Make your cast',
    title: 'Every curl, every freckle.',
    body: 'Pick hair, outfits, glasses and hats for each of them from pictures of their own character. Siblings, cousins, best friends, grown-ups and pets too.',
  },
  {
    at: [0.37, 0.56],
    kicker: 'Star in a storybook',
    title: 'Their story, on every page.',
    body: 'Choose a moment and the whole cast acts it out together: picnics, rocket rides, bedtime. Then move, swap or rewrite anything.',
  },
  {
    at: [0.61, 0.77],
    kicker: 'Frame the moment',
    title: 'A poster worth hanging.',
    body: 'Sibling portraits, best-friend prints and bedroom-door signs, printed on cotton rag and framed in solid oak.',
  },
  {
    at: [0.81, 0.91],
    kicker: 'Wear it',
    title: 'A hoodie for Maya. A tee for Sam.',
    body: 'Organic kids hoodies and tees, one each, with their own character and name stitched right where they want it.',
  },
  {
    at: [0.94, 1.01],
    kicker: 'Start in one click',
    title: 'Pick an idea. Make it theirs.',
    body: 'Every editor opens with finished ideas made from your whole cast, so you are never staring at a blank page.',
    ctas: [
      { href: '/studio/book', label: 'Make a storybook', primary: true },
      { href: '/studio/poster', label: 'Design a poster' },
      { href: '/studio/apparel', label: 'Design a hoodie' },
    ],
  },
];

const loadScene = async (args) => {
  const { loadStudioScene } = await import('./studioScene');
  return loadStudioScene(args);
};

export const StudioStory = () => (
  <ScrollStory
    id="studio-story"
    label="How the Custom Creation Studio works"
    captions={CAPTIONS}
    loadScene={loadScene}
    height={700}
    mobileHeight={600}
    skipTo="#studio-hero"
  />
);
