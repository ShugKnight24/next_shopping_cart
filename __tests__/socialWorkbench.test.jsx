import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  featureProduct,
  formatHashtags,
  postText,
  retint,
} from '../Components/Studio/social/SocialPanel';
import { socialPalette } from '../Components/Studio/social/socialArt';
import { CATALOG } from '../Components/Studio/starters/catalog';
import { relayout } from '../Components/Studio/starters/starters';
import { refitLayer } from '../Components/Studio/workbench/layerModel';
import { PRODUCTS } from '../Components/Studio/workbench/products';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import products from '../data/products.json';
import SocialWorkbenchPage from '../pages/studio/social';

/**
 * The social post designer is the same workbench as the book, poster and
 * apparel: ideas acted out by the cast, picture tiles for every choice, and
 * a download instead of a bag.
 */

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/studio/social',
    query: {},
    isReady: true,
    replace: vi.fn(),
    push: vi.fn(),
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

vi.mock('../analytics/google', () => ({
  trackAddToCart: vi.fn(),
  trackPageView: vi.fn(),
  trackWebVitals: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

const renderSocial = () =>
  render(
    <ToastProvider>
      <CartProvider>
        <SocialWorkbenchPage />
      </CartProvider>
    </ToastProvider>
  );

const aside = () =>
  screen.getByRole('complementary', { name: 'Design properties' });

const canvas = () => screen.getByRole('img', { name: /design canvas/ });
const layerCount = () =>
  Number(
    canvas()
      .getAttribute('aria-label')
      .match(/(\d+) layers/)[1]
  );

describe('social post designer', () => {
  it('opens on a finished idea and offers a download, not a bag', () => {
    renderSocial();
    expect(layerCount()).toBeGreaterThan(0);
    const ideas = within(aside()).getByRole('group', { name: 'Ideas' });
    expect(
      within(ideas).getByRole('button', { name: 'New arrival' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(aside()).getByRole('button', { name: 'Download PNG' })
    ).toBeInTheDocument();
    expect(
      within(aside()).queryByRole('button', { name: 'Add to bag' })
    ).not.toBeInTheDocument();
  });

  it('swaps one idea for another, keeping what the shopper added', () => {
    renderSocial();
    fireEvent.click(screen.getByRole('button', { name: 'Text (T)' }));
    const mine = layerCount();
    fireEvent.click(screen.getByRole('button', { name: 'Design settings' }));
    const ideas = within(aside()).getByRole('group', { name: 'Ideas' });
    fireEvent.click(within(ideas).getByRole('button', { name: 'Flash sale' }));
    expect(
      within(ideas).getByRole('button', { name: 'Flash sale' })
    ).toHaveAttribute('aria-pressed', 'true');
    // The sale's own five layers replace the arrival's five; the shopper's
    // text stays.
    expect(layerCount()).toBe(mine);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      within(ideas).getByRole('button', { name: 'New arrival' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('changes format and undoes the format with the layout', () => {
    renderSocial();
    const format = within(aside()).getByRole('group', {
      name: "Where it's going",
    });
    fireEvent.click(within(format).getByRole('button', { name: /^Story/ }));
    expect(screen.getByText('Story · 1080 × 1920')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Square post · 1080 × 1080')).toBeInTheDocument();
  });

  it('swaps the featured product in place, as one undo step', () => {
    renderSocial();
    const before = layerCount();
    fireEvent.click(
      within(aside()).getAllByRole('button', { name: /^Feature / })[1]
    );
    // The opening idea already shows a product, so it is replaced, not stacked.
    expect(layerCount()).toBe(before);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
  });

  it('renames the product in the caption when another is featured', () => {
    renderSocial();
    const caption = () => within(aside()).getByLabelText('Post caption');
    expect(caption().value).toContain('Air Jordan 1');

    fireEvent.click(
      within(aside()).getByRole('button', { name: /^Feature SM58/ })
    );
    fireEvent.click(
      within(aside()).getByRole('button', { name: 'Design settings' })
    );

    expect(caption().value).toContain('SM58');
    expect(caption().value).not.toContain('Air Jordan 1');
  });

  it('copies the caption with its hashtags and announces it', async () => {
    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderSocial();

    fireEvent.change(within(aside()).getByLabelText('Hashtags'), {
      target: { value: 'summer, drops' },
    });
    fireEvent.click(
      within(aside()).getByRole('button', { name: 'Copy caption and hashtags' })
    );

    await screen.findByRole('button', { name: 'Copied' });
    expect(writeText.mock.calls[0][0]).toMatch(/#summer #drops$/);
    vi.unstubAllGlobals();
  });

  it('offers the text to copy by hand when the clipboard is blocked', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    renderSocial();

    fireEvent.click(
      within(aside()).getByRole('button', { name: 'Copy caption and hashtags' })
    );

    expect(
      await within(aside()).findByLabelText('Caption and hashtags to copy')
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe('featuring products', () => {
  const artboard = { width: 1080, height: 1080 };
  const pal = socialPalette('obsidian');
  const [first, second] = CATALOG;

  it('adds a photo, name and price to a post without one', () => {
    const { layers } = featureProduct([], first, { artboard, pal });
    expect(layers.map((l) => l.type)).toEqual(['image', 'text', 'text']);
  });

  it('swaps the photo, name and price of the product already shown', () => {
    const { layers: once } = featureProduct([], first, { artboard, pal });
    const { layers: twice } = featureProduct(once, second, { artboard, pal });

    expect(twice).toHaveLength(3);
    expect(twice[0].productId).toBe(second.itemid);
    expect(twice[1].text).toBe(second.productName);
    expect(twice[2].text).toContain(second.price.toLocaleString('en-US'));
  });

  it('can feature every product in the store', () => {
    expect(CATALOG.length).toBe(products.length);
  });

  it('formats hashtags and joins them under the caption', () => {
    expect(formatHashtags('summer, #drops  sale')).toBe('#summer #drops #sale');
    expect(postText('Hello', 'a b')).toBe('Hello\n\n#a #b');
    expect(postText('', 'a')).toBe('#a');
  });
});

describe('social layout helpers', () => {
  it('repaints theme-coloured words and leaves hand-coloured ones', () => {
    const from = socialPalette('obsidian');
    const to = socialPalette('mint');
    const [themed, mine] = retint(
      [
        { id: 'a', color: from.accent, colorRole: 'accent' },
        { id: 'b', color: '#123456', colorRole: 'accent' },
      ],
      'obsidian',
      'mint'
    );
    expect(themed.color).toBe(to.accent);
    expect(mine.color).toBe('#123456');
  });

  it('refits a layer onto a new artboard without distorting it', () => {
    const layer = {
      type: 'text',
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      fontSize: 20,
    };
    const next = refitLayer(
      layer,
      { width: 200, height: 200 },
      { width: 100, height: 400 }
    );
    expect(next).toMatchObject({
      x: 50,
      y: 200,
      width: 40,
      height: 20,
      fontSize: 10,
    });
  });

  it("lays an idea's own layers out again for a new format", () => {
    const square = PRODUCTS.social.artboard({ format: 'square' });
    const story = PRODUCTS.social.artboard({ format: 'story' });
    const options = {
      ...PRODUCTS.social.defaults,
      idea: 'sale',
      theme: 'crimson',
      cast: [],
    };
    const own = [
      { id: 'mine', type: 'shape', x: 10, y: 10, width: 10, height: 10 },
    ];
    const out = relayout(own, square, story, 'social', options);
    // Not the idea's: refitted proportionally.
    expect(out[0].y).toBeCloseTo(10 * (story.height / square.height));
  });
});
