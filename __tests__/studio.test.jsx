import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeDesign } from '../Components/Studio/core/designCodec';
import { STARTERS } from '../Components/Studio/starters/starters';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import { MascotProvider } from '../context/MascotProvider';
import StudioPage from '../pages/studio/index';

/**
 * `/studio` is a launcher now, not an editor.
 *
 * The three heavyweight studios moved to their own full-screen routes
 * (`__tests__/studioWorkbench.test.jsx` covers those); what is left here is a
 * marketing page with three shallow, genuinely interactive previews. The load
 * bearing test in this file is the handoff: what a visitor types in a preview
 * has to survive into the `?d=` payload the full designer opens.
 */

const mockReplace = vi.fn();
const mockRouter = {
  pathname: '/studio',
  query: {},
  isReady: true,
  replace: mockReplace,
  events: { on: vi.fn(), off: vi.fn() },
};

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('../analytics/google', () => ({
  trackAddToCart: vi.fn(),
  trackPageView: vi.fn(),
  trackWebVitals: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockRouter.query = {};
});

function renderStudio() {
  return render(
    <ToastProvider>
      <CartProvider>
        <MascotProvider>
          <StudioPage />
        </MascotProvider>
      </CartProvider>
    </ToastProvider>
  );
}

/** The `?d=` payload the "Continue in the full designer" link carries. */
function decodeContinueLink(link) {
  const href = link.getAttribute('href');
  const [route, query] = href.split('?');
  return {
    route,
    doc: decodeDesign(new URLSearchParams(query).get('d')),
  };
}

describe('Studio launcher page', () => {
  it('renders the hero and the craftsmanship promises', () => {
    renderStudio();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'The Custom Creation Studio',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Handcrafted & Bound in the USA')
    ).toBeInTheDocument();
    expect(
      screen.getByText('FSC-Certified Archival Papers')
    ).toBeInTheDocument();

    const standards = screen.getByRole('region', {
      name: 'Craftsmanship Standards',
    });
    expect(
      within(standards).getByRole('heading', {
        name: 'Heirloom Quality in Every Print',
      })
    ).toBeInTheDocument();
    expect(
      within(standards).getByRole('heading', { name: /12-Color Giclée/i })
    ).toBeInTheDocument();
  });

  it('launches the three full-screen workbenches by route', () => {
    renderStudio();

    const launcher = screen.getByRole('region', { name: 'Design workbenches' });

    expect(
      within(launcher).getByRole('link', { name: /Storybook Designer/i })
    ).toHaveAttribute('href', '/studio/book');
    expect(
      within(launcher).getByRole('link', { name: /Poster Designer/i })
    ).toHaveAttribute('href', '/studio/poster');
    expect(
      within(launcher).getByRole('link', { name: /Apparel Designer/i })
    ).toHaveAttribute('href', '/studio/apparel');
  });

  it('renders a try-it preview for each of the three products', () => {
    renderStudio();

    const previews = screen.getByRole('region', { name: 'Try the studios' });

    expect(
      within(previews).getByRole('heading', { name: "Children's Storybooks" })
    ).toBeInTheDocument();
    expect(
      within(previews).getByRole('heading', { name: 'Framed Art Posters' })
    ).toBeInTheDocument();
    expect(
      within(previews).getByRole('heading', { name: "Kids' Apparel & Kicks" })
    ).toBeInTheDocument();

    // Each preview paints a real idea starring a kid, not a stock image.
    expect(
      within(previews).getByRole('img', {
        name: 'Framed Art Poster preview starring Maya: Birthday star',
      })
    ).toBeInTheDocument();
  });

  it('lets a visitor actually change a preview', () => {
    renderStudio();

    const apparel = screen.getByRole('region', {
      name: "Kids' Apparel & Kicks",
    });

    const name = within(apparel).getByLabelText("Your star's name");
    fireEvent.change(name, { target: { value: 'Noah' } });
    fireEvent.click(within(apparel).getByRole('button', { name: 'Kai' }));
    fireEvent.click(
      within(apparel).getByRole('button', { name: 'Space cadet' })
    );
    expect(
      within(apparel).getByRole('img', {
        name: "Kids' Custom Apparel preview starring Noah: Space cadet",
      })
    ).toBeInTheDocument();
    expect(
      within(apparel).getByRole('button', { name: 'Kai' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('hands the preview off to the full designer with the idea and kid intact', () => {
    renderStudio();

    const poster = screen.getByRole('region', { name: 'Framed Art Posters' });

    fireEvent.change(within(poster).getByLabelText("Your star's name"), {
      target: { value: 'Mira' },
    });
    fireEvent.click(within(poster).getByRole('button', { name: 'Zara' }));
    fireEvent.click(
      within(poster).getByRole('button', { name: 'Adventure awaits' })
    );

    const { route, doc } = decodeContinueLink(
      within(poster).getByRole('link', {
        name: /Continue in the full designer/i,
      })
    );

    expect(route).toBe('/studio/poster');
    expect(doc).not.toBeNull();
    expect(doc.mode).toBe('poster');

    // The link carries the idea and the kid rather than every seeded layer,
    // so the idea has to actually resolve.
    expect(STARTERS.poster.map((s) => s.id)).toContain(doc.meta.idea);
    expect(doc.meta.idea).toBe('adventure');
    expect(doc.meta.hero).toEqual({ look: 'zara', name: 'Mira' });
    expect(doc.layers).toEqual([]);
  });

  it('carries a storybook preview into the book designer under its own mode', () => {
    renderStudio();

    const book = screen.getByRole('region', { name: "Children's Storybooks" });

    fireEvent.click(
      within(book).getByRole('button', { name: 'All year round' })
    );

    const { route, doc } = decodeContinueLink(
      within(book).getByRole('link', {
        name: /Continue in the full designer/i,
      })
    );

    expect(route).toBe('/studio/book');
    expect(doc.mode).toBe('storybook');
    expect(doc.meta.idea).toBe('seasons');
    expect(STARTERS.book.find((s) => s.id === doc.meta.idea)?.book).toBe(true);
  });

  it('describes what the bespoke designer adds over the preview', () => {
    renderStudio();

    const bespoke = screen.getByRole('region', {
      name: 'The bespoke designer',
    });

    expect(
      within(bespoke).getByRole('heading', {
        name: 'Where a Keepsake Becomes Yours',
      })
    ).toBeInTheDocument();
    expect(
      within(bespoke).getByRole('heading', {
        name: 'Start from a layout, or a blank artboard',
      })
    ).toBeInTheDocument();
    expect(
      within(bespoke).getByRole('heading', {
        name: 'Move, resize and stack anything',
      })
    ).toBeInTheDocument();
    expect(
      within(bespoke).getByRole('heading', {
        name: 'Proof it like a printer would',
      })
    ).toBeInTheDocument();
  });

  it('forwards the legacy ?mode= deep link to its workbench route', () => {
    mockRouter.query = { mode: 'poster' };
    renderStudio();

    expect(mockReplace).toHaveBeenCalledWith('/studio/poster');
  });

  it('forwards the legacy character panel deep link to the book workbench', () => {
    mockRouter.query = { panel: 'character' };
    renderStudio();

    expect(mockReplace).toHaveBeenCalledWith('/studio/book');
  });
});
