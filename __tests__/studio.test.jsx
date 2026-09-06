import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '../context/CartProvider';
import { MascotProvider } from '../context/MascotProvider';
import { ToastProvider } from '../Components/UI/Toast';
import StudioPage from '../pages/studio/index';

// Mock Next.js useRouter
const mockReplace = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/studio',
    query: {},
    replace: mockReplace,
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

// Mock Google Analytics tracking
vi.mock('../analytics/google', () => ({
  trackAddToCart: vi.fn(),
  trackPageView: vi.fn(),
  trackWebVitals: vi.fn(),
}));

// Mock HTML5 Canvas 2D context for jsdom
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  }));
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

describe('Web-to-Print Studio Platform', () => {
  it('renders studio header, trust pillars, and 3 creation modes', () => {
    renderStudio();

    expect(screen.getByText('The Custom Creation Studio')).toBeInTheDocument();
    expect(screen.getByText('Handcrafted & Bound in the USA')).toBeInTheDocument();
    expect(screen.getByText('FSC-Certified Archival Papers')).toBeInTheDocument();

    // 3 Mode Tabs
    expect(
      screen.getByRole('button', { name: /Children's Storybooks/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Framed Art Posters/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kids' Apparel & Kicks/i })
    ).toBeInTheDocument();
  });

  it('allows personalizing child hero name and stepping through wizard', () => {
    renderStudio();

    // Step 1 input
    const nameInput = screen.getByLabelText(/Child’s First Name:/i);
    expect(nameInput).toHaveValue('Noah');

    fireEvent.change(nameInput, { target: { value: 'Maya' } });
    expect(nameInput).toHaveValue('Maya');

    // Go to Step 2
    const nextBtn = screen.getByRole('button', { name: /Continue to Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Choose an Adventure Theme')).toBeInTheDocument();

    // Select Sneakerhead Odyssey
    const sneakerTheme = screen.getByRole('button', { name: /Sneakerhead Odyssey/i });
    fireEvent.click(sneakerTheme);

    // Go to Step 3
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('Special Front Page Dedication')).toBeInTheDocument();

    // Click a preset dedication
    const presetBtn = screen.getByRole('button', {
      name: /"Stay curious and conquer the stars..."/i,
    });
    fireEvent.click(presetBtn);
    expect(screen.getByLabelText(/Dedication Note:/i).value).toContain('Maya');
  });

  it('allows page flipping and stamping decorative stickers in storybook mode', () => {
    renderStudio();

    // Check page indicator
    expect(screen.getByText('Hardcover Front')).toBeInTheDocument();

    // Flip to next page
    const nextSpreadBtn = screen.getByRole('button', { name: /Next book spread/i });
    fireEvent.click(nextSpreadBtn);
    expect(screen.getByText('Page 1 & Dedication')).toBeInTheDocument();

    // Select a sticker
    const starSticker = screen.getByRole('button', {
      name: /Select Golden Star sticker to stamp/i,
    });
    fireEvent.click(starSticker);
    expect(
      screen.getByText(/Tap anywhere on the illustration stage to stamp!/i)
    ).toBeInTheDocument();
  });

  it('allows adding customized storybook to cart in Step 5', () => {
    renderStudio();

    // Directly click step 5 tab
    const step5Tab = screen.getByRole('button', { name: /Print Binding/i });
    fireEvent.click(step5Tab);

    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
    const addToCartBtn = screen.getByRole('button', {
      name: /Add Personalized Storybook to Bag/i,
    });
    expect(addToCartBtn).toBeInTheDocument();

    fireEvent.click(addToCartBtn);

    // Local storage should reflect the updated cart
    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart).toBeDefined();
    expect(savedCartData.cart.length).toBeGreaterThan(0);
    expect(savedCartData.cart[0].isCustom).toBe(true);
    expect(savedCartData.cart[0].customAttributes.Hero).toBe('Noah');
  });

  it('allows switching to Framed Poster Studio and adding to cart', () => {
    renderStudio();

    const posterTab = screen.getByRole('button', { name: /Framed Art Posters/i });
    fireEvent.click(posterTab);

    expect(screen.getByText('Design Custom Wall Art Poster')).toBeInTheDocument();
    const headlineInput = screen.getByLabelText(/Poster Headline:/i);
    fireEvent.change(headlineInput, { target: { value: 'MAYA’S ROOM' } });

    const addPosterBtn = screen.getByRole('button', {
      name: /Add Framed Poster to Bag/i,
    });
    fireEvent.click(addPosterBtn);

    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart.some((i) => i.customMode === 'poster')).toBe(true);
  });

  it('allows switching to Kids Apparel Studio and adding to cart', () => {
    renderStudio();

    const apparelTab = screen.getByRole('button', { name: /Kids' Apparel & Kicks/i });
    fireEvent.click(apparelTab);

    expect(screen.getByText("Customize Kids' Apparel & Kicks")).toBeInTheDocument();
    const monogramInput = screen.getByLabelText(/Monogram or Child Name:/i);
    fireEvent.change(monogramInput, { target: { value: 'LEO' } });

    const addApparelBtn = screen.getByRole('button', {
      name: /Add Custom Apparel to Bag/i,
    });
    fireEvent.click(addApparelBtn);

    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart.some((i) => i.customMode === 'apparel')).toBe(true);
  });
});
