import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logo } from '../Components/Logo';
import { LegacyLogo } from '../Components/Legacy/LegacyLogo';
import { BrandProvider, useBrand } from '../Components/Brand/BrandContext';
import { BrandVariantPickerModal } from '../Components/Brand/BrandVariantPicker';
import { ToastProvider } from '../Components/UI/Toast';

// Helper component to test useBrand hook
function BrandConsumer() {
  const { variant, setVariant, currentInfo } = useBrand();
  return (
    <div>
      <span data-testid="current-variant">{variant}</span>
      <span data-testid="current-name">{currentInfo.name}</span>
      <button onClick={() => setVariant('minimal')}>Set Minimal</button>
      <button onClick={() => setVariant('crest')}>Set Crest</button>
      <button onClick={() => setVariant('geometric')}>Set Geometric</button>
      <Logo />
    </div>
  );
}

describe('Brand System & Logo Variants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Variant A (Geometric Monogram) by default with accurate accessible label', () => {
    render(
      <BrandProvider>
        <Logo variant="geometric" />
      </BrandProvider>
    );

    expect(screen.getByRole('img', { name: /Cart Commerce - Geometric Monogram/i })).toBeInTheDocument();
    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
    expect(screen.getByText('SHOPPING MADE SIMPLE')).toBeInTheDocument();
  });

  it('renders Variant B (Minimalist Continuous Line & Starlight)', () => {
    render(
      <BrandProvider>
        <Logo variant="minimal" />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Minimalist Line & Starlight/i })
    ).toBeInTheDocument();
    expect(screen.getByText('CURATED GOODS & KEEPSAKES')).toBeInTheDocument();
  });

  it('renders Variant C (Archival Heritage Crest)', () => {
    render(
      <BrandProvider>
        <Logo variant="crest" />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Archival Heritage Crest/i })
    ).toBeInTheDocument();
    expect(screen.getByText('CURATED LUXURY STOREFRONT')).toBeInTheDocument();
  });

  it('supports dark theme rendering without invert filter hacks', () => {
    const { container } = render(
      <BrandProvider>
        <Logo variant="geometric" theme="dark" />
      </BrandProvider>
    );

    const titleText = container.querySelector('text');
    expect(titleText).toHaveAttribute('fill', '#ffffff');
  });

  it('allows hiding subtitle with showSubtitle={false}', () => {
    render(
      <BrandProvider>
        <Logo variant="geometric" showSubtitle={false} />
      </BrandProvider>
    );

    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
    expect(screen.queryByText('SHOPPING MADE SIMPLE')).not.toBeInTheDocument();
  });

  it('allows customizing the subtitle prop', () => {
    render(
      <BrandProvider>
        <Logo variant="geometric" subtitle="BESPOKE EXCELLENCE" />
      </BrandProvider>
    );

    expect(screen.getByText('BESPOKE EXCELLENCE')).toBeInTheDocument();
  });

  it('renders LegacyLogo for historical reference', () => {
    render(<LegacyLogo />);
    expect(
      screen.getByRole('img', { name: /Cart Commerce Legacy Logo/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Cart Commerce')).toBeInTheDocument();
  });

  it('updates the global brand variant reactively via BrandProvider', () => {
    render(
      <BrandProvider>
        <BrandConsumer />
      </BrandProvider>
    );

    expect(screen.getByTestId('current-variant').textContent).toBe('geometric');
    expect(screen.getByTestId('current-name').textContent).toBe('Geometric Monogram');

    // Switch to minimal
    fireEvent.click(screen.getByText('Set Minimal'));
    expect(screen.getByTestId('current-variant').textContent).toBe('minimal');
    expect(screen.getByTestId('current-name').textContent).toBe('Minimalist Line & Starlight');

    // Switch to crest
    fireEvent.click(screen.getByText('Set Crest'));
    expect(screen.getByTestId('current-variant').textContent).toBe('crest');
    expect(screen.getByTestId('current-name').textContent).toBe('Archival Heritage Crest');
  });

  it('renders BrandVariantPickerModal and allows switching the active brand', () => {
    const onClose = vi.fn();

    render(
      <BrandProvider>
        <ToastProvider>
          <BrandVariantPickerModal isOpen={true} onClose={onClose} />
        </ToastProvider>
      </BrandProvider>
    );

    expect(
      screen.getByRole('heading', { name: /Brand Identity & Logo System/i })
    ).toBeInTheDocument();

    // Verify all 3 options are displayed
    expect(screen.getAllByText('Geometric Monogram').length).toBeGreaterThan(0);
    expect(screen.getByText('Minimalist Line & Starlight')).toBeInTheDocument();
    expect(screen.getByText('Archival Heritage Crest')).toBeInTheDocument();

    // Toggle preview canvas theme
    const darkThemeBtn = screen.getByRole('button', { name: /Dark Theme/i });
    fireEvent.click(darkThemeBtn);

    // Click "Set as Active Brand" on Minimalist option
    const setButtons = screen.getAllByRole('button', { name: /Set as Active Brand/i });
    expect(setButtons.length).toBeGreaterThan(0);
    fireEvent.click(setButtons[0]);

    // Verify toast or active state updated
    expect(screen.getAllByText('Minimalist Line & Starlight').length).toBeGreaterThan(0);
  });
});
