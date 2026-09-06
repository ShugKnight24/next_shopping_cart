import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogToolbar } from '../Components/Products/CatalogToolbar';
import { Product3DStudio } from '../Components/Products/Product3DStudio';
import { ProductTabs } from '../Components/Products/ProductTabs';
import { StickyBuyBar } from '../Components/Products/StickyBuyBar';
import { TrustBadges } from '../Components/Products/TrustBadges';
import { ToastProvider } from '../Components/UI/Toast';
import { getAllProducts, getProductById, getRelatedProducts } from '../utils/productCatalog';

const mockProduct = {
  itemid: 'JORDAN-1-LOST-FOUND',
  productName: "Air Jordan 1 Retro High OG 'Lost & Found'",
  manufacturer: 'Jordan',
  price: 425,
  originalPrice: 480,
  available: 4,
  category: 'Footwear > Jordans',
  image: '/images/products/jordan-1-lost-found.jpg',
  images: ['/images/products/jordan-1-lost-found.jpg'],
  badges: ['bestseller', 'sale'],
  rating: { average: 4.9, count: 48 },
  variants: [
    { id: 'v1', name: 'US 9.0', priceModifier: 0, available: true, value: '#ef4444' },
    { id: 'v2', name: 'US 10.0', priceModifier: 25, available: true, value: '#1e3a5f' },
  ],
  specifications: {
    Colorway: 'Varsity Red / Black / Sail / Muslin',
    Release: '2022',
  },
  shipping: {
    free: true,
    estimate: '2-3 business days',
    cost: 0,
  },
  reviews: [
    {
      id: 'r1',
      author: 'Sneakerhead99',
      rating: 5,
      date: '2026-01-10',
      title: 'Grail sneaker',
      content: 'Incredible aging details and collar cracking. 10/10.',
      verified: true,
      helpful: 24,
    },
  ],
  faqs: [
    {
      question: 'How do Jordan 1s fit?',
      answer: 'Fits true to standard Nike sizing.',
    },
  ],
};

describe('Product Catalog Unification', () => {
  it('loads all products with unified properties', () => {
    const products = getAllProducts();
    expect(products.length).toBeGreaterThanOrEqual(30);

    // Verify key categories are present
    const ids = products.map((p) => p.itemid);
    expect(ids).toContain('JORDAN-1-LOST-FOUND');
    expect(ids).toContain('SM57');
    expect(ids).toContain('IPHONE16PRO');
    expect(ids).toContain('MACBOOKM4');
  });

  it('retrieves single product by ID', () => {
    const product = getProductById('JORDAN-1-LOST-FOUND');
    expect(product).toBeDefined();
    expect(product.manufacturer).toContain('Jordan');
  });

  it('retrieves related products for recommendations', () => {
    const related = getRelatedProducts(mockProduct, 3);
    expect(related.length).toBe(3);
    expect(related.find((r) => r.itemid === mockProduct.itemid)).toBeUndefined();
  });
});

describe('Product3DStudio', () => {
  it('renders 3D studio container, live indicator, and controls', () => {
    render(<Product3DStudio product={mockProduct} />);

    expect(screen.getByTestId('product-3d-studio')).toBeInTheDocument();
    expect(screen.getByText('3D Interactive Studio')).toBeInTheDocument();
    expect(screen.getByText('Side Profile')).toBeInTheDocument();
    expect(screen.getByText('Sole / Grip')).toBeInTheDocument();
  });

  it('switches camera angle presets when clicked', () => {
    render(<Product3DStudio product={mockProduct} />);

    const sideBtn = screen.getByText('Side Profile');
    fireEvent.click(sideBtn);
    expect(sideBtn.className).toContain('activePreset');
  });

  it('toggles exploded view mode', () => {
    render(<Product3DStudio product={mockProduct} />);

    const explodedBtn = screen.getByLabelText('Toggle exploded view');
    fireEvent.click(explodedBtn);

    expect(screen.getByText(/Layer 1: Performance Outer Shell/i)).toBeInTheDocument();
    expect(screen.getByText(/Layer 2: Responsive Cushioning Matrix/i)).toBeInTheDocument();
  });

  it('opens and closes tech hotspot callout card', () => {
    render(<Product3DStudio product={mockProduct} />);

    const hotspots = screen.getAllByLabelText(/Inspect /i);
    expect(hotspots.length).toBeGreaterThan(0);

    fireEvent.click(hotspots[0]);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close hotspot info');
    fireEvent.click(closeBtn);
    expect(screen.queryByLabelText('Close hotspot info')).not.toBeInTheDocument();
  });
});

describe('CatalogToolbar', () => {
  it('renders product count, sort select, and filter toggles', () => {
    const onSortChange = vi.fn();
    const onToggleInStock = vi.fn();
    const onToggleOnSale = vi.fn();
    const onPriceRangeChange = vi.fn();
    const onViewModeChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <CatalogToolbar
        totalCount={31}
        filteredCount={15}
        sortBy="featured"
        onSortChange={onSortChange}
        inStockOnly={false}
        onToggleInStock={onToggleInStock}
        onSaleOnly={false}
        onToggleOnSale={onToggleOnSale}
        priceRange="all"
        onPriceRangeChange={onPriceRangeChange}
        viewMode="grid"
        onViewModeChange={onViewModeChange}
        onResetFilters={onResetFilters}
      />
    );

    expect(screen.getByTestId('catalog-toolbar')).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 15 of 31 products');

    fireEvent.click(screen.getByText('In Stock Only'));
    expect(onToggleInStock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('On Sale'));
    expect(onToggleOnSale).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('List layout view'));
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });
});

describe('ProductTabs', () => {
  it('renders all 5 tabs and switches between them', () => {
    render(
      <ToastProvider>
        <ProductTabs
          product={mockProduct}
          specifications={mockProduct.specifications}
          shipping={mockProduct.shipping}
          reviews={mockProduct.reviews}
          faqs={mockProduct.faqs}
        />
      </ToastProvider>
    );

    expect(screen.getByTestId('product-tabs')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Overview & Highlights/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Specifications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Shipping & Guarantees/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /FAQs/i })).toBeInTheDocument();

    // Switch to Specs tab
    fireEvent.click(screen.getByRole('tab', { name: /Specifications/i }));
    expect(screen.getByText('Colorway')).toBeInTheDocument();
    expect(screen.getByText('Varsity Red / Black / Sail / Muslin')).toBeInTheDocument();

    // Switch to FAQs tab and toggle accordion
    fireEvent.click(screen.getByRole('tab', { name: /FAQs/i }));
    expect(screen.getByText('How do Jordan 1s fit?')).toBeInTheDocument();
    expect(screen.getByText('Fits true to standard Nike sizing.')).toBeInTheDocument();
  });
});

describe('TrustBadges and StickyBuyBar', () => {
  it('renders all 4 trust value proposition badges', () => {
    render(<TrustBadges />);

    expect(screen.getByTestId('trust-badges')).toBeInTheDocument();
    expect(screen.getByText('100% Guaranteed Authentic')).toBeInTheDocument();
    expect(screen.getByText('Fast Insured Courier')).toBeInTheDocument();
    expect(screen.getByText('30-Day Hassle-Free Returns')).toBeInTheDocument();
    expect(screen.getByText('256-Bit Encrypted Checkout')).toBeInTheDocument();
  });

  it('renders StickyBuyBar with calculated price and trigger handler', () => {
    const handleAdd = vi.fn();
    render(
      <StickyBuyBar
        product={mockProduct}
        selectedVariant={mockProduct.variants[1]}
        totalPrice={450}
        onAddToCart={handleAdd}
      />
    );

    expect(screen.getByTestId('sticky-buy-bar')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();

    const addBtn = screen.getByLabelText('Add product to cart');
    fireEvent.click(addBtn);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
