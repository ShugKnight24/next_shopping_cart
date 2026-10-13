import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BrandProvider,
  LEGACY_VARIANT_ALIASES,
  resolveBrandVariant,
  useBrand,
} from '../Components/Brand/BrandContext';
import { BrandMark } from '../Components/Brand/BrandMark';
import {
  BrandQuickSwitcherPill,
  BrandVariantPickerModal,
} from '../Components/Brand/BrandVariantPicker';
import { LegacyLogo } from '../Components/Legacy/LegacyLogo';
import { Logo } from '../Components/Logo';
import { ToastProvider } from '../Components/UI/Toast';

// Helper component to test useBrand hook
function BrandConsumer() {
  const { variant, setVariant, currentInfo } = useBrand();
  return (
    <div>
      <span data-testid="current-variant">{variant}</span>
      <span data-testid="current-name">{currentInfo.name}</span>
      <button onClick={() => setVariant('crest')}>Set Crest</button>
      <button onClick={() => setVariant('edgy')}>Set Legacy Edgy</button>
      <button onClick={() => setVariant('studio')}>Set Studio</button>
      <Logo />
    </div>
  );
}

describe('Brand System & Logo Variants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Primary Badge by default with an accessible label', () => {
    render(
      <BrandProvider>
        <Logo />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: /Cart Commerce - Primary Badge/i })
    ).toBeInTheDocument();
    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
    expect(screen.getByText('SHOPPING MADE SIMPLE')).toBeInTheDocument();
  });

  it.each([
    ['primary', 'Primary Badge', 'SHOPPING MADE SIMPLE'],
    ['mono', 'Minimal Mono', 'SHOPPING MADE SIMPLE'],
    ['inverse', 'Midnight Editorial', 'SHOPPING MADE SIMPLE'],
    ['studio', 'Creation Studio', 'CUSTOM CREATION STUDIO'],
    ['crest', 'Gold Foil Crest', 'CURATED LUXURY GOODS'],
  ])('renders the %s variant', (id, name, subtitle) => {
    render(
      <BrandProvider>
        <Logo variant={id} />
      </BrandProvider>
    );

    expect(
      screen.getByRole('img', { name: `Cart Commerce - ${name}` })
    ).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('maps legacy variant ids onto the current set', () => {
    expect(LEGACY_VARIANT_ALIASES).toEqual({
      geometric: 'primary',
      badge: 'primary',
      favicon: 'primary',
      sleek: 'primary',
      floating: 'mono',
      edgy: 'inverse',
      lighthearted: 'studio',
      soviet: 'crest',
    });
    expect(resolveBrandVariant('soviet')).toBe('crest');
    expect(resolveBrandVariant('studio')).toBe('studio');
    expect(resolveBrandVariant('nope')).toBe('primary');
    expect(resolveBrandVariant(undefined)).toBe('primary');

    render(
      <BrandProvider>
        <Logo variant="lighthearted" />
      </BrandProvider>
    );
    expect(
      screen.getByRole('img', { name: /Cart Commerce - Creation Studio/i })
    ).toBeInTheDocument();
  });

  it('restores a stored legacy preference and rewrites it', async () => {
    localStorage.setItem('cart_commerce_brand_variant', 'edgy');
    render(
      <BrandProvider>
        <BrandConsumer />
      </BrandProvider>
    );

    expect(
      await screen.findByText('inverse', { selector: '[data-testid]' })
    ).toBeInTheDocument();
    expect(localStorage.getItem('cart_commerce_brand_variant')).toBe('inverse');
  });

  it('gives every rendered logo its own gradient ids', () => {
    const { container } = render(
      <BrandProvider>
        <Logo variant="primary" />
        <Logo variant="primary" />
        <BrandMark variant="primary" size={16} />
      </BrandProvider>
    );

    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    container.querySelectorAll('[fill^="url(#"]').forEach((el) => {
      const ref = el.getAttribute('fill').slice(5, -1);
      expect(ids).toContain(ref);
    });
  });

  it('uses the micro glyph at favicon sizes', () => {
    const { container } = render(<BrandMark size={16} />);
    // The micro glyph has no wire layer: only rim, basket, posts and grip.
    expect(container.querySelectorAll('path').length).toBeLessThan(8);
    expect(container.querySelector('svg')).toHaveAttribute('width', '16');
  });

  it('supports dark theme rendering without invert filter hacks', () => {
    const { container } = render(
      <BrandProvider>
        <Logo variant="primary" theme="dark" />
      </BrandProvider>
    );

    const titleText = container.querySelector('text');
    expect(titleText).toHaveAttribute('fill', '#ffffff');
  });

  it('allows hiding subtitle with showSubtitle={false}', () => {
    render(
      <BrandProvider>
        <Logo variant="primary" showSubtitle={false} />
      </BrandProvider>
    );

    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
    expect(screen.queryByText('SHOPPING MADE SIMPLE')).not.toBeInTheDocument();
  });

  it('allows customizing the subtitle prop', () => {
    render(
      <BrandProvider>
        <Logo variant="primary" subtitle="STORE & STUDIOS" />
      </BrandProvider>
    );

    expect(screen.getByText('STORE & STUDIOS')).toBeInTheDocument();
  });

  it('renders the mark-only and stacked layouts', () => {
    const { container, rerender } = render(<Logo layout="mark" />);
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      '0 0 64 64'
    );
    expect(screen.queryByText('CART COMMERCE')).not.toBeInTheDocument();

    rerender(<Logo layout="stacked" />);
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      '0 0 208 120'
    );
    expect(screen.getByText('CART COMMERCE')).toBeInTheDocument();
  });

  it('merges custom style prop onto svg element', () => {
    const { container } = render(
      <BrandProvider>
        <Logo variant="primary" style={{ maxWidth: '240px', opacity: 0.9 }} />
      </BrandProvider>
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({
      overflow: 'visible',
      maxWidth: '240px',
      opacity: '0.9',
    });
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

    expect(screen.getByTestId('current-variant').textContent).toBe('primary');
    expect(screen.getByTestId('current-name').textContent).toBe(
      'Primary Badge'
    );

    fireEvent.click(screen.getByText('Set Crest'));
    expect(screen.getByTestId('current-variant').textContent).toBe('crest');
    expect(screen.getByTestId('current-name').textContent).toBe(
      'Gold Foil Crest'
    );

    // Legacy ids still work through setVariant.
    fireEvent.click(screen.getByText('Set Legacy Edgy'));
    expect(screen.getByTestId('current-variant').textContent).toBe('inverse');

    fireEvent.click(screen.getByText('Set Studio'));
    expect(screen.getByTestId('current-name').textContent).toBe(
      'Creation Studio'
    );
    expect(localStorage.getItem('cart_commerce_brand_variant')).toBe('studio');
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

    expect(screen.getAllByText('Primary Badge').length).toBeGreaterThan(0);
    expect(screen.getByText('Minimal Mono')).toBeInTheDocument();
    expect(screen.getByText('Midnight Editorial')).toBeInTheDocument();
    expect(screen.getByText('Creation Studio')).toBeInTheDocument();
    expect(screen.getByText('Gold Foil Crest')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Dark Theme/i }));

    const setButtons = screen.getAllByRole('button', {
      name: /Set as Active Brand/i,
    });
    expect(setButtons).toHaveLength(4);
    fireEvent.click(setButtons[0]);

    // First inactive option is Minimal Mono; it becomes the active brand.
    expect(screen.getAllByText('Minimal Mono').length).toBeGreaterThan(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps focus inside the brand dialog and returns it on close', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open brand
          </button>
          <BrandVariantPickerModal
            isOpen={open}
            onClose={() => setOpen(false)}
          />
        </>
      );
    };
    render(
      <BrandProvider>
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </BrandProvider>
    );
    const opener = screen.getByRole('button', { name: 'Open brand' });
    opener.focus();
    fireEvent.click(opener);

    const close = screen.getByRole('button', { name: 'Close brand modal' });
    expect(close).toHaveFocus();

    // Shift+Tab from the first control wraps to the last, not the page.
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement);
    expect(document.activeElement).not.toBe(close);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(opener).toHaveFocus();
  });

  it('names the brand pill by what it shows', () => {
    render(
      <BrandProvider>
        <BrandQuickSwitcherPill onOpen={() => {}} />
      </BrandProvider>
    );

    expect(
      screen.getByRole('button', { name: /Brand Style:/ })
    ).toBeInTheDocument();
  });
});
