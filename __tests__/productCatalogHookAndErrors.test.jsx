import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hit } from '../Components/InstantSearch/Hit';
import { ProductCard } from '../Components/Products/ProductCard';
import { Products } from '../Components/Products/Products';
import { CartContext } from '../context/CartProvider';
import { useProductCatalog } from '../hooks/useProductCatalog';
import ProductID from '../pages/products/[productid]';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/products',
    query: {},
  }),
}));

const mockContextValue = {
  state: {
    inventory: [
      {
        itemid: 'PROD-1',
        productName: 'Air Max 90',
        manufacturer: 'Nike',
        price: 130,
        available: 5,
        category: 'Footwear > Sneakers',
        image: '/images/products/air-max-90.jpg',
        rating: { average: 4.8, count: 10 },
      },
    ],
    cart: [],
    promo: null,
  },
  dispatch: vi.fn(),
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
};

const renderWithContext = (ui, contextValue = mockContextValue) => {
  return render(
    <CartContext.Provider value={contextValue}>{ui}</CartContext.Provider>
  );
};

describe('useProductCatalog Hook', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('initializes with initialData without API call when fetchFromApi is false', () => {
    const initialData = [
      { itemid: 'INIT-1', productName: 'Initial Product', price: 99 },
    ];

    const { result } = renderHook(() =>
      useProductCatalog({ initialData, fetchFromApi: false })
    );

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].itemid).toBe('INIT-1');
    expect(result.current.status).toBe('success');
    expect(result.current.isError).toBe(false);
    expect(result.current.isEmpty).toBe(false);
  });

  it('fetches products successfully from API and normalizes contract', async () => {
    const mockApiResponse = {
      version: '2.0.0',
      data: [
        {
          id: 'API-1',
          name: 'API Product',
          cost: '$49.99',
          stock: 12,
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    const { result } = renderHook(() =>
      useProductCatalog({
        fetchFromApi: true,
        apiEndpoint: '/api/test-products',
      })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].itemid).toBe('API-1');
    expect(result.current.products[0].productName).toBe('API Product');
    expect(result.current.products[0].price).toBe(49.99);
  });

  it('handles API 500 error and sets isError to true with error message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() =>
      useProductCatalog({ fetchFromApi: true, apiEndpoint: '/api/error' })
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('HTTP 500');
  });

  it('handles empty product list from API and sets isEmpty to true', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { result } = renderHook(() =>
      useProductCatalog({ fetchFromApi: true, apiEndpoint: '/api/empty' })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });
});

describe('Product Catalog Resilience & Error States', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders resilient error state with retry button on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    renderWithContext(
      <Products fetchFromApi={true} apiEndpoint="/api/test-failing" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('products-error-state')).toBeInTheDocument();
    });

    expect(screen.getByText('Catalog Service Unavailable')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Retry Loading Catalog/i })
    ).toBeInTheDocument();

    // Verify retry button triggers refetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { itemid: 'REC-1', productName: 'Recovered Product', price: 99 },
        ],
      }),
    });

    const retryBtn = screen.getByRole('button', {
      name: /Retry Loading Catalog/i,
    });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Recovered Product')).toBeInTheDocument();
    });
  });

  it('renders dedicated empty catalog state when no products exist in catalog', () => {
    renderWithContext(<Products initialProducts={[]} fetchFromApi={false} />);

    expect(
      screen.getByTestId('products-empty-catalog-state')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No products currently available')
    ).toBeInTheDocument();
  });

  it('renders filter empty state with reset button when active filters eliminate all products', () => {
    renderWithContext(
      <Products
        initialProducts={[
          {
            itemid: 'SHOES-1',
            productName: 'Running Shoes',
            price: 50,
            available: 2,
            category: 'Footwear > Running',
          },
        ]}
      />
    );

    // Filter by Collectibles tab where our product does not match
    const collectiblesTab = screen.getByRole('tab', { name: /Collectibles/i });
    fireEvent.click(collectiblesTab);

    expect(screen.getByTestId('products-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No matching products found')).toBeInTheDocument();

    // Click Reset All Filters
    const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i });
    fireEvent.click(resetBtn);

    // Product should reappear
    expect(screen.getByText('Running Shoes')).toBeInTheDocument();
  });
});

describe('Defensive Component Resilience', () => {
  it('Hit component returns null without throwing TypeError when itemid does not exist in inventory', () => {
    const emptyContext = {
      state: { inventory: [], cart: [] },
      dispatch: vi.fn(),
    };

    const { container } = render(
      <CartContext.Provider value={emptyContext}>
        <Hit itemid="NON-EXISTENT-ID" />
      </CartContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('ProductCard gracefully falls back to placeholder on image error', () => {
    renderWithContext(
      <ProductCard
        itemid="BROKEN-IMG-1"
        productName="Broken Image Test"
        price={100}
        available={3}
        image="/images/does-not-exist.jpg"
      />
    );

    const img = screen.getByAltText(/Broken Image Test/i);
    expect(img).toBeInTheDocument();

    // Trigger image error
    fireEvent.error(img);

    expect(img.getAttribute('src')).toBe('/images/placeholder.svg');
  });

  it('ProductID PDP page renders accessible fallback when currentProduct is missing', () => {
    renderWithContext(<ProductID currentProduct={null} />);

    expect(screen.getByTestId('product-not-found')).toBeInTheDocument();
    expect(screen.getByText('Product Unavailable')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to All Products/i })
    ).toBeInTheDocument();
  });
});
