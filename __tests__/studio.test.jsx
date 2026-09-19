import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeDesign } from '../Components/Studio/core/designCodec';
import { TEMPLATES_BY_MODE } from '../Components/Studio/workbench/templates';
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

/** The slot roles a handed-off template can fill, straight from the table. */
function slotRolesOf(mode, templateId) {
  const template = TEMPLATES_BY_MODE[mode].find((t) => t.id === templateId);
  return (template?.layers ?? []).map((layer) => layer.slotRole);
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

    // Each preview paints the real substrate, not a stock image.
    expect(
      within(previews).getByRole('img', {
        name: 'Framed Art Poster preview',
      })
    ).toBeInTheDocument();
  });

  it('lets a visitor actually change a preview', () => {
    renderStudio();

    const apparel = screen.getByRole('region', {
      name: "Kids' Apparel & Kicks",
    });

    const monogram = within(apparel).getByLabelText('Monogram');
    fireEvent.change(monogram, { target: { value: 'MAYA' } });
    expect(monogram).toHaveValue('MAYA');

    const garment = within(apparel).getByLabelText('Garment');
    fireEvent.change(garment, { target: { value: 'jacket' } });
    expect(garment).toHaveValue('jacket');
  });

  it('hands the preview off to the full designer with the typed words intact', () => {
    renderStudio();

    const poster = screen.getByRole('region', { name: 'Framed Art Posters' });

    fireEvent.change(within(poster).getByLabelText('Headline'), {
      target: { value: 'MAYA THE BRAVE' },
    });

    const { route, doc } = decodeContinueLink(
      within(poster).getByRole('link', {
        name: /Continue in the full designer/i,
      })
    );

    expect(route).toBe('/studio/poster');
    expect(doc).not.toBeNull();
    expect(doc.mode).toBe('poster');

    // The link carries a template reference plus the typed slot text rather
    // than every seeded layer, so the reference has to actually resolve.
    expect(slotRolesOf('poster', doc.meta.template)).toContain('title');
    expect(doc.meta.slots.title).toBe('MAYA THE BRAVE');
  });

  it('carries a storybook preview into the book designer under its own mode', () => {
    renderStudio();

    const book = screen.getByRole('region', { name: "Children's Storybooks" });

    fireEvent.change(within(book).getByLabelText('Story title'), {
      target: { value: "Noah's Deep Sea Dive" },
    });

    const { route, doc } = decodeContinueLink(
      within(book).getByRole('link', {
        name: /Continue in the full designer/i,
      })
    );

    expect(route).toBe('/studio/book');
    expect(doc.mode).toBe('storybook');
    expect(slotRolesOf('book', doc.meta.template)).toContain('title');
    expect(doc.meta.slots.title).toBe("Noah's Deep Sea Dive");
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
