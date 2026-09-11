import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialStudio } from '../Components/Studio/SocialStudio';
import { ToastProvider } from '../Components/UI/Toast';
import { MascotProvider } from '../context/MascotProvider';

// Mock Next.js useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/studio/social',
    query: {},
    replace: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

// Mock Canvas 2D
beforeEach(() => {
  vi.clearAllMocks();
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

  // Mock clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  });
});

function renderSocialStudio() {
  return render(
    <ToastProvider>
      <MascotProvider>
        <SocialStudio />
      </MascotProvider>
    </ToastProvider>
  );
}

describe('Social Media Creation Studio', () => {
  it('renders studio title, platform options, and marketing templates', () => {
    renderSocialStudio();

    expect(
      screen.getByRole('heading', { name: /Social Media Creation Studio/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Store Owner & Creator Workshop')
    ).toBeInTheDocument();

    // 4 Platforms
    expect(screen.getAllByText('Instagram Square').length).toBeGreaterThan(0);
    expect(screen.getByText('Story & TikTok')).toBeInTheDocument();
    expect(screen.getByText('Twitter / X Banner')).toBeInTheDocument();
    expect(screen.getByText('Pinterest Pin')).toBeInTheDocument();

    // Templates
    expect(screen.getByText('Luxury Minimalist')).toBeInTheDocument();
    expect(screen.getByText('Hype Drop Streetwear')).toBeInTheDocument();
    expect(screen.getByText('Flash Sale & Promo')).toBeInTheDocument();
    expect(screen.getByText('Customer Spotlight')).toBeInTheDocument();
  });

  it('allows switching platform presets', () => {
    renderSocialStudio();

    const storyBtn = screen.getByRole('button', { name: /Story & TikTok/i });
    fireEvent.click(storyBtn);

    // Platform badge should update
    expect(screen.getByText('Vertical Reel (1080×1920)')).toBeInTheDocument();
  });

  it('imports catalog products into editable post fields', () => {
    renderSocialStudio();

    const select = screen.getByLabelText(/Choose Catalog Product:/i);
    expect(select).toBeInTheDocument();

    // Change product selection to another item in products.json (e.g. SM58 or second item)
    fireEvent.change(select, { target: { value: select.options[1].value } });

    // Headline should update
    const headlineInput = screen.getByLabelText(/Headline:/i);
    expect(headlineInput.value).toContain('ARCHIVE');
  });

  it('toggles smartphone mockup preview frame', () => {
    renderSocialStudio();

    const toggleBtn = screen.getByRole('button', {
      name: /Toggle smartphone mockup preview/i,
    });
    expect(screen.queryByText('9:41')).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText('9:41')).toBeInTheDocument();
    expect(screen.getByText('Hide Phone Frame')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByText('9:41')).not.toBeInTheDocument();
  });

  it('copies post caption and hashtags to clipboard', () => {
    renderSocialStudio();

    const copyBtn = screen.getByRole('button', {
      name: /Copy post caption to clipboard/i,
    });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('triggers post download when clicking download button', () => {
    renderSocialStudio();

    const downloadBtn = screen.getByRole('button', {
      name: /Download social post PNG/i,
    });
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);
  });
});
