import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkbench } from '../Components/Studio/workbench/useWorkbench';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import BookWorkbenchPage from '../pages/studio/book';

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/studio/book',
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

const renderBook = () =>
  render(
    <ToastProvider>
      <CartProvider>
        <BookWorkbenchPage />
      </CartProvider>
    </ToastProvider>
  );

const aside = () =>
  screen.getByRole('complementary', { name: 'Design properties' });

/**
 * The storybook's cast editor: people are made once in the Cast panel and
 * edited with picture tiles; each spread is its own page of layers.
 */
describe('storybook cast editor', () => {
  it('lists the cast and edits a look with try-on tiles', () => {
    renderBook();
    fireEvent.click(screen.getByRole('button', { name: 'Cast (3)' }));

    const roster = within(aside()).getByRole('list', { name: 'Cast members' });
    fireEvent.click(within(roster).getByRole('button', { name: /Maya/ }));

    expect(
      within(aside()).getByRole('heading', { name: 'Edit Maya' })
    ).toBeInTheDocument();
    const hair = within(aside()).getByRole('group', { name: 'Hairstyle' });
    const afro = within(hair).getByRole('button', { name: 'Afro' });
    expect(afro).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(afro);
    expect(within(hair).getByRole('button', { name: 'Afro' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('selects a character on the page and offers mood, pose and prop pictures', () => {
    renderBook();
    const onPage = within(aside())
      .getByRole('heading', { name: 'On this page' })
      .closest('section');
    fireEvent.click(
      within(onPage).getByRole('button', { name: 'Select Maya' })
    );

    for (const group of ['Mood', 'Pose', 'Holding']) {
      expect(
        within(aside()).getByRole('group', { name: group })
      ).toBeInTheDocument();
    }
    fireEvent.click(
      within(within(aside()).getByRole('group', { name: 'Holding' })).getByRole(
        'button',
        { name: 'Balloon' }
      )
    );
    expect(
      within(within(aside()).getByRole('group', { name: 'Holding' })).getByRole(
        'button',
        { name: 'Balloon' }
      )
    ).toHaveAttribute('aria-pressed', 'true');

    // Page settings are one click away from any selection.
    fireEvent.click(
      within(aside()).getByRole('button', { name: 'Page settings' })
    );
    expect(
      within(aside()).getByRole('heading', { name: 'Story moment' })
    ).toBeInTheDocument();
  });

  it('turns pages, each with its own layers, and adds new ones', () => {
    renderBook();
    const pages = screen.getByRole('navigation', { name: 'Pages' });
    const canvas = () =>
      screen.getByRole('img', { name: /design canvas, \d+ layers/ });

    fireEvent.click(within(pages).getByRole('button', { name: 'Cover' }));
    expect(canvas()).toHaveAccessibleName(/, 0 layers$/);

    fireEvent.click(within(pages).getByRole('button', { name: 'Add a page' }));
    expect(
      within(pages).getByRole('button', { name: 'Pages 7–8' })
    ).toHaveAttribute('aria-current', 'page');
    expect(canvas()).toHaveAccessibleName(/, 0 layers$/);
  });

  it('adds scenery from the Scenery panel', () => {
    renderBook();
    const before = Number(
      screen
        .getByRole('img', { name: /design canvas/ })
        .getAttribute('aria-label')
        .match(/(\d+) layers/)[1]
    );
    fireEvent.click(screen.getByRole('button', { name: 'Scenery (4)' }));
    fireEvent.click(within(aside()).getByRole('button', { name: 'Kite' }));
    expect(
      screen.getByRole('img', {
        name: `Personalized Storybook design canvas, ${before + 1} layers`,
      })
    ).toBeInTheDocument();
  });
});

describe('paged workbench', () => {
  it('edits only the current page while one history spans the book', () => {
    const artboard = { width: 600, height: 400 };
    const { result, rerender } = renderHook(
      ({ scope }) => useWorkbench({ artboard, scope }),
      {
        initialProps: { scope: { id: 'a', fallback: 'a' } },
      }
    );

    act(() => {
      result.current.addLayer('text');
    });
    rerender({ scope: { id: 'b', fallback: 'a' } });
    expect(result.current.layers).toHaveLength(0);

    act(() => {
      result.current.addLayer('shape');
      result.current.addLayer('shape');
    });
    expect(result.current.layers).toHaveLength(2);
    expect(result.current.allLayers).toHaveLength(3);
    expect(result.current.allLayers.filter((l) => l.page === 'b')).toHaveLength(
      2
    );

    rerender({ scope: { id: 'a', fallback: 'a' } });
    expect(result.current.layers).toHaveLength(1);
  });
});

describe('history across a book', () => {
  it('records a drag as one undo step', async () => {
    const { useDesignHistory } = await import('../Components/Studio/core/useDesignHistory');
    const { result } = renderHook(() => useDesignHistory(['a']));
    act(() => result.current.update(['b'], { commit: false }));
    act(() => result.current.update(['c'], { commit: false }));
    act(() => result.current.update((x) => x, { commit: true }));
    expect(result.current.present).toEqual(['c']);
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.present).toEqual(['a']);
  });

  it('brings back a deleted page and its art on undo', () => {
    renderBook();
    const pages = () => screen.getByRole('navigation', { name: 'Pages' });
    const count = () => within(pages()).getAllByRole('button').length;
    const before = count();

    fireEvent.click(within(aside()).getByRole('button', { name: 'Delete page' }));
    expect(count()).toBe(before - 1);

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(count()).toBe(before);
    fireEvent.click(within(pages()).getByRole('button', { name: 'Pages 1–2' }));
    expect(screen.getByRole('img', { name: /design canvas/ })).not.toHaveAccessibleName(/, 0 layers$/);
  });

  it("acts out a moment without deleting the shopper's own layers", () => {
    renderBook();
    const layers = () => Number(screen.getByRole('img', { name: /design canvas/ }).getAttribute('aria-label').match(/(\d+) layers/)[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Text (T)' }));
    const withMine = layers();
    fireEvent.click(within(aside()).getByRole('button', { name: 'Page settings' }));
    fireEvent.click(within(aside()).getByRole('button', { name: 'Rocket ride' }));
    // The rocket moment has one character, three pieces and its words, plus the shopper's text.
    expect(layers()).toBe(1 + 3 + 1 + 1);
    expect(withMine).toBeGreaterThan(1);
  });
});
