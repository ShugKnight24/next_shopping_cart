import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { starterBook } from '../Components/Studio/book/bookPages';
import { starterCast } from '../Components/Studio/cast/castModel';
import { PREVIEWS } from '../Components/Studio/preview/previewConfigs';
import { StudioPreview } from '../Components/Studio/preview/StudioPreview';
import { buildStarter, STARTERS } from '../Components/Studio/starters/starters';
import {
  BOOK_FORMATS,
  FINISHES,
  GARMENTS,
  PLACEMENTS,
  POSTER_FRAMES,
  POSTER_SIZES,
  PRODUCTS,
} from '../Components/Studio/workbench/products';
import { TEMPLATES_BY_MODE } from '../Components/Studio/workbench/templates';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import ApparelWorkbenchPage from '../pages/studio/apparel';
import BookWorkbenchPage from '../pages/studio/book';
import PosterWorkbenchPage from '../pages/studio/poster';

/**
 * The three full-screen designers at `/studio/book`, `/studio/poster` and
 * `/studio/apparel`.
 *
 * All three are the same shell (`WorkbenchRoute`) over a different product
 * table, so the shell, rail and order behaviour are asserted once per route
 * from one table and only the product-specific inspector differs.
 */

const mockRouter = {
  pathname: '/studio/poster',
  query: {},
  isReady: true,
  replace: vi.fn(),
  push: vi.fn(),
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

/** A new book opens on its first story spread, already acted out by the starter cast. */
const bookOpening = (() => {
  const book = starterBook({
    cast: starterCast(),
    artboard: PRODUCTS.book.artboard(PRODUCTS.book.defaults),
  });
  return book.layers.filter((l) => l.page === book.activeSpread).length;
})();

/** A new poster or garment opens on its first idea, already acted out. */
const ideaOpening = (key) =>
  buildStarter(key, STARTERS[key][0], {
    artboard: PRODUCTS[key].artboard(PRODUCTS[key].defaults),
    options: PRODUCTS[key].defaults,
    cast: starterCast(),
  }).layers.length;

const priceOf = (table, id, key = 'price') =>
  table.find((entry) => entry.id === id)[key];

const ROUTES = [
  {
    label: 'book',
    Page: BookWorkbenchPage,
    product: PRODUCTS.book,
    templateMode: 'book',
    openingLayers: bookOpening,
    /** The product's own document options, not the layer inspector's. */
    optionField: { label: 'Format', value: 'square', option: /8" × 8" Square/ },
    // Square format, lay-flat hardcover and velvet paper carry no surcharge.
    expectedTotal: () => priceOf(BOOK_FORMATS, 'square'),
  },
  {
    label: 'poster',
    Page: PosterWorkbenchPage,
    product: PRODUCTS.poster,
    templateMode: 'poster',
    openingLayers: ideaOpening('poster'),
    /** Poster and apparel options are picture tiles, not selects. */
    optionTile: { group: 'Frame', name: 'Oak, +$25' },
    expectedTotal: () =>
      priceOf(POSTER_SIZES, '18x24') +
      priceOf(POSTER_FRAMES, 'oak', 'priceModifier'),
  },
  {
    label: 'apparel',
    Page: ApparelWorkbenchPage,
    product: PRODUCTS.apparel,
    templateMode: 'apparel',
    openingLayers: ideaOpening('apparel'),
    optionTile: { group: 'Style', name: 'Hoodie, $48' },
    expectedTotal: () =>
      priceOf(GARMENTS, 'hoodie') +
      priceOf(PLACEMENTS, 'chest', 'priceModifier') +
      priceOf(FINISHES, 'satin', 'priceModifier'),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

function renderWorkbench(Page) {
  return render(
    <ToastProvider>
      <CartProvider>
        <Page />
      </CartProvider>
    </ToastProvider>
  );
}

const inspectorPanel = () =>
  screen.getByRole('complementary', { name: 'Design properties' });

const canvasNamed = (product, layers) =>
  screen.getByRole('img', {
    name: `${product.title} design canvas, ${layers} layers`,
  });

describe.each(ROUTES)(
  '$label workbench',
  ({
    Page,
    product,
    templateMode,
    optionField,
    optionTile,
    expectedTotal,
    openingLayers = 0,
  }) => {
    it('renders the workbench shell with its title, exit and actions', () => {
      renderWorkbench(Page);

      expect(
        screen.getByRole('heading', { level: 1, name: product.title })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Studio' })).toHaveAttribute(
        'href',
        '/studio'
      );

      ['Undo', 'Redo', 'Save', 'Share link', 'Export PNG'].forEach((action) => {
        expect(
          screen.getByRole('button', { name: action })
        ).toBeInTheDocument();
      });

      // Nothing has been drawn yet, so history is empty.
      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    });

    it('offers the five drawing tools on the rail', () => {
      renderWorkbench(Page);

      const rail = screen.getByRole('group', { name: 'Drawing tools' });

      [
        'Select (V)',
        'Text (T)',
        'Shape (R)',
        'Artwork (A)',
        'Image (I)',
      ].forEach((tool) => {
        expect(
          within(rail).getByRole('button', { name: tool })
        ).toBeInTheDocument();
      });

      expect(
        within(rail).getByRole('button', { name: 'Select (V)' })
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('adds a layer to the artboard when a creation tool is picked', () => {
      renderWorkbench(Page);

      expect(canvasNamed(product, openingLayers)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Text (T)' }));

      expect(canvasNamed(product, openingLayers + 1)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
    });

    it("shows the product's own options in the inspector", () => {
      renderWorkbench(Page);

      if (optionTile) {
        const group = within(inspectorPanel()).getByRole('group', {
          name: optionTile.group,
        });
        expect(
          within(group).getByRole('button', { name: optionTile.name })
        ).toHaveAttribute('aria-pressed', 'true');
        return;
      }
      const field = within(inspectorPanel()).getByLabelText(optionField.label);
      expect(field).toHaveValue(optionField.value);
      expect(
        within(field).getByRole('option', { name: optionField.option })
      ).toBeInTheDocument();
    });

    it('itemises the order and totals the base price plus modifiers', () => {
      renderWorkbench(Page);

      const order = within(inspectorPanel())
        .getByRole('heading', { name: 'Order' })
        .closest('section');

      expect(
        within(order).getByRole('button', { name: 'Add to bag' })
      ).toBeInTheDocument();
      expect(within(order).getByText('Total').parentElement).toHaveTextContent(
        `$${expectedTotal().toFixed(2)}`
      );
    });

    it('lists the templates for its own mode', () => {
      renderWorkbench(Page);

      fireEvent.click(screen.getByRole('button', { name: 'Templates (1)' }));

      const panel = inspectorPanel();
      expect(
        within(panel).getByRole('heading', { name: 'Templates' })
      ).toBeInTheDocument();

      TEMPLATES_BY_MODE[templateMode].slice(0, 3).forEach((template) => {
        expect(
          within(panel).getByRole('button', {
            name: new RegExp(`^${template.name}`),
          })
        ).toBeInTheDocument();
      });
    });
  }
);

describe('preview handoff', () => {
  it('opens the idea and kid from a studio-page preview in the full designer', () => {
    // 1. Someone personalizes the poster preview on the studio page.
    const preview = PREVIEWS.find((entry) => entry.id === 'poster');
    render(<StudioPreview {...preview} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zara' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bedroom door' }));
    fireEvent.change(screen.getByLabelText("Your star's name"), {
      target: { value: 'Zuri' },
    });
    expect(
      screen.getByRole('img', { name: /starring Zuri: Bedroom door/ })
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /Continue in the full designer/i,
    });
    const href = link.getAttribute('href');
    fireEvent.click(link);

    cleanup();

    // 2. They follow the link into the designer, which reads `?d=` off the URL.
    window.history.replaceState({}, '', href);
    renderWorkbench(PosterWorkbenchPage);

    // 3. The same idea, starring the same kid, as real editable layers.
    const ideas = within(inspectorPanel()).getByRole('group', {
      name: 'Ideas',
    });
    expect(
      within(ideas).getByRole('button', { name: 'Bedroom door' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(inspectorPanel()).getByRole('button', { name: 'Select Zuri' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Layers (2)' }));
    expect(
      within(inspectorPanel()).getByRole('button', { name: /Zuri's Room/ })
    ).toBeInTheDocument();
  });
});
