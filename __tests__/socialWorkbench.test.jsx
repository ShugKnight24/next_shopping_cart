import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { retint } from '../Components/Studio/social/SocialPanel';
import { socialPalette } from '../Components/Studio/social/socialArt';
import { relayout } from '../Components/Studio/starters/starters';
import { refitLayer } from '../Components/Studio/workbench/layerModel';
import { PRODUCTS } from '../Components/Studio/workbench/products';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
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

  it('features a store product as photo, name and price in one step', () => {
    renderSocial();
    const before = layerCount();
    fireEvent.click(
      within(aside()).getAllByRole('button', { name: /^Feature / })[0]
    );
    expect(layerCount()).toBe(before + 3);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(layerCount()).toBe(before);
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
