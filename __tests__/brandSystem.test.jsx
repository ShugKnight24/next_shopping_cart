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
      <button onClick={() => setVariant('soviet')}>Set Soviet</button>
      <button onClick={() => setVariant('edgy')}>Set Edgy</button>
      <button onClick={() => setVariant('lighthearted')}>Set Lighthearted</button>
      <button onClick={() => setVariant('geometric')}>Set Sleek</button>
      <Logo />
    </div>
  );
}

describe('Brand System & Logo Variants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Favicon Badge variant by default with accurate accessible label', () => {
    render(
      <BrandProvider>
        <Logo variant="geometric" />
      </BrandProvider>
    );

    expect(screen.getByRole('img', { name: /Cart Commerce - Favicon Badge/i })).toBeInTheDocument();
    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
    expect(screen.getByText('SHOPPING MADE SIMPLE')).toBeInTheDocument();
  });

  it('renders Floating Minimal Cart variant borderless with starlight jewel', () => {
    render(
      <BrandProvider>
        <Logo variant="floating" />
      </BrandProvider>
    );

    expect(screen.getByRole('img', { name: /Cart Commerce - Floating Minimal Cart/i })).toBeInTheDocument();
    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
  });

  it('renders Soviet Constructivist variant with dynamic constructivist styling', () => {
    render(
      <BrandProvider>
        <Logo variant="soviet" />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Soviet Constructivist/i })
    ).toBeInTheDocument();
    expect(screen.getByText('COMMERCE & INDUSTRY')).toBeInTheDocument();
  });

  it('renders Dark & Edgy variant with cyber-streetwear styling', () => {
    render(
      <BrandProvider>
        <Logo variant="edgy" />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Dark & Edgy/i })
    ).toBeInTheDocument();
    expect(screen.getByText('BLACK LABEL')).toBeInTheDocument();
  });

  it('renders Lighthearted Pop variant with cheerful rounded styling', () => {
    render(
      <BrandProvider>
        <Logo variant="lighthearted" />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Lighthearted Pop/i })
    ).toBeInTheDocument();
    expect(screen.getByText('EVERYDAY FINDS')).toBeInTheDocument();
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
        <Logo variant="geometric" subtitle="STORE & STUDIOS" />
      </BrandProvider>
    );

    expect(screen.getByText('STORE & STUDIOS')).toBeInTheDocument();
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
    expect(screen.getByTestId('current-name').textContent).toBe('Favicon Badge');

    // Switch to Soviet
    fireEvent.click(screen.getByText('Set Soviet'));
    expect(screen.getByTestId('current-variant').textContent).toBe('soviet');
    expect(screen.getByTestId('current-name').textContent).toBe('Soviet Constructivist');

    // Switch to Edgy
    fireEvent.click(screen.getByText('Set Edgy'));
    expect(screen.getByTestId('current-variant').textContent).toBe('edgy');
    expect(screen.getByTestId('current-name').textContent).toBe('Dark & Edgy');

    // Switch to Lighthearted
    fireEvent.click(screen.getByText('Set Lighthearted'));
    expect(screen.getByTestId('current-variant').textContent).toBe('lighthearted');
    expect(screen.getByTestId('current-name').textContent).toBe('Lighthearted Pop');
  });

  it('renders BrandVariantPickerModal and allows switching across all variants', () => {
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

    // Verify options are displayed
    expect(screen.getAllByText('Favicon Badge').length).toBeGreaterThan(0);
    expect(screen.getByText('Soviet Constructivist')).toBeInTheDocument();
    expect(screen.getByText('Dark & Edgy')).toBeInTheDocument();
    expect(screen.getByText('Lighthearted Pop')).toBeInTheDocument();

    // Toggle preview canvas theme
    const darkThemeBtn = screen.getByRole('button', { name: /Dark Theme/i });
    fireEvent.click(darkThemeBtn);

    // Click "Set as Active Brand" on Soviet option
    const setButtons = screen.getAllByRole('button', { name: /Set as Active Brand/i });
    expect(setButtons.length).toBeGreaterThan(0);
    fireEvent.click(setButtons[0]);

    // Verify active state updated
    expect(screen.getAllByText('Soviet Constructivist').length).toBeGreaterThan(0);
  });
});
