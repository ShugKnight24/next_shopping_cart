import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '../context/CartProvider';
import { MascotProvider } from '../context/MascotProvider';
import { ToastProvider } from '../Components/UI/Toast';
import { CinematicVideoPlayer } from '../Components/Video/CinematicVideoPlayer';
import { EcommerceSizzleReel } from '../Components/Video/EcommerceSizzleReel';
import { KidsStudioVideoTour } from '../Components/Video/KidsStudioVideoTour';

// Mock Next.js useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    replace: vi.fn(),
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

// Mock Google Analytics tracking
vi.mock('../analytics/google', () => ({
  trackAddToCart: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  // Mock Canvas 2D
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
    roundRect: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  }));
});

describe('Cinematic Video Player & Brand Sizzle Suites', () => {
  it('renders CinematicVideoPlayer with chapters and controls', () => {
    const chapters = [
      { timestamp: 0, title: 'Intro Scene' },
      { timestamp: 30, title: 'Product Deep Dive' },
    ];

    render(
      <CinematicVideoPlayer
        title="Test Reel"
        chapters={chapters}
        duration={60}
      />
    );

    expect(screen.getByLabelText(/Cinematic motion reel stage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Play video reel/i)).toBeInTheDocument();
    expect(screen.getByText('Intro Scene')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('toggles play/pause state and cycles playback speed', () => {
    render(
      <CinematicVideoPlayer
        title="Test Reel"
        chapters={[{ timestamp: 0, title: 'Intro' }]}
        duration={60}
      />
    );

    // Initial center play button
    const centerPlayBtn = screen.getByLabelText(/Play video reel/i);
    fireEvent.click(centerPlayBtn);

    // Now pause button should be in control bar
    const pauseBtn = screen.getByLabelText(/Pause video/i);
    expect(pauseBtn).toBeInTheDocument();

    // Toggle pause
    fireEvent.click(pauseBtn);
    expect(screen.getByLabelText('Play video')).toBeInTheDocument();

    // Cycle speed button
    const speedBtn = screen.getByLabelText(/Playback speed 1x/i);
    fireEvent.click(speedBtn);
    expect(screen.getByText('1.25x')).toBeInTheDocument();
  });

  it('renders EcommerceSizzleReel with Shop The Scene hotspots and adds product to bag', () => {
    render(
      <ToastProvider>
        <CartProvider>
          <MascotProvider>
            <EcommerceSizzleReel />
          </MascotProvider>
        </CartProvider>
      </ToastProvider>
    );

    expect(
      screen.getByRole('heading', { name: /Experience The Collection/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('NYC Flagship Atelier Tour').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Air Pulse Sneaker Vault').length).toBeGreaterThan(0);

    // Jump to chapter 2 (Sneakers with hotspot)
    const chapter2Marker = screen.getByRole('button', {
      name: /Jump to Chapter 2: Air Pulse Sneaker Vault/i,
    });
    fireEvent.click(chapter2Marker);

    // Hotspot should now be visible
    expect(screen.getByText('Shop The Scene')).toBeInTheDocument();
    expect(screen.getByText('Air Pulse High Top')).toBeInTheDocument();
    expect(screen.getByText('$189')).toBeInTheDocument();

    // Click "Add to Bag" on the scene hotspot
    const addBtn = screen.getByRole('button', {
      name: /Shop Air Pulse High Top for \$189/i,
    });
    fireEvent.click(addBtn);

    // Verify cart in localStorage has item
    const saved = JSON.parse(localStorage.getItem('shopping_cart.cart') || '{}');
    expect(saved.cart).toBeDefined();
    expect(saved.cart.some((i) => i.productName === 'Air Pulse High Top')).toBe(true);
  });

  it('renders KidsStudioVideoTour with artisan craft chapters and mascot fact bubble', () => {
    render(
      <MascotProvider>
        <KidsStudioVideoTour />
      </MascotProvider>
    );

    expect(
      screen.getByRole('heading', { name: /The Making of a Keepsake Heirloom/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Behind The Print Atelier')).toBeInTheDocument();
    expect(screen.getByText('100% Archival Paper')).toBeInTheDocument();
    expect(screen.getByText('Reinforced Stitching')).toBeInTheDocument();
    expect(screen.getByText('Non-Toxic Inks')).toBeInTheDocument();

    // Mascot fact bubble
    expect(screen.getByText(/Studio Guide Fact:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Every book begins right here in our interactive studio/i)
    ).toBeInTheDocument();
  });
});
