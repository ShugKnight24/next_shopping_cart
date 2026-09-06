import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MascotProvider } from '../context/MascotProvider';
import { MascotCompanion } from '../Components/Mascot/MascotCompanion';
import { MASCOTS } from '../config/mascots';

// Mock Next.js useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

describe('Mascot Companion System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders Carty The Courier by default with accessible SVG and dialogue', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    expect(screen.getByText('Carty The Courier')).toBeInTheDocument();
    expect(screen.getByLabelText(/Carty The Courier Mascot/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Welcome to our flagship shop!/i)
    ).toBeInTheDocument();
  });

  it('allows toggling the companion OFF and persists in localStorage', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Turn off companion/i });
    fireEvent.click(toggleBtn);

    // After turning off, the full mascot and bubble disappear, replaced by the subtle enable pill
    expect(screen.queryByLabelText(/Carty The Courier Mascot/i)).not.toBeInTheDocument();
    const enableBtn = screen.getByRole('button', { name: /Turn on Brand Companion/i });
    expect(enableBtn).toBeInTheDocument();
    expect(localStorage.getItem('shopping_cart.mascot_enabled')).toBe('false');

    // Clicking enable restores the companion
    fireEvent.click(enableBtn);
    expect(screen.getByLabelText(/Carty The Courier Mascot/i)).toBeInTheDocument();
    expect(localStorage.getItem('shopping_cart.mascot_enabled')).toBe('true');
  });

  it('allows swapping companions within shop realm (Carty and Sparky)', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    const switchBtn = screen.getByRole('button', {
      name: /Switch between companions/i,
    });
    expect(switchBtn).toHaveTextContent(/Switch to Sparky/i);
    fireEvent.click(switchBtn);

    expect(screen.getByText('Sparky The Sneaker Hound')).toBeInTheDocument();
    expect(screen.getByLabelText(/Sparky The Sneaker Hound Mascot/i)).toBeInTheDocument();
  });

  it('dismisses the speech bubble without unmounting the mascot', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    const dismissBtn = screen.getByRole('button', { name: /Dismiss message/i });
    fireEvent.click(dismissBtn);

    // Speech text is gone
    expect(
      screen.queryByText(/Welcome to our flagship shop!/i)
    ).not.toBeInTheDocument();
    // But character is still present
    expect(screen.getByLabelText(/Carty The Courier Mascot/i)).toBeInTheDocument();
  });

  it('contains zero Unicode emojis in mascot configurations', () => {
    // Check all mascot configs for emojis (unicode range \u{1F300}-\u{1F9FF} etc)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    Object.values(MASCOTS).forEach((m) => {
      expect(emojiRegex.test(m.name)).toBe(false);
      expect(emojiRegex.test(m.title)).toBe(false);
      expect(emojiRegex.test(m.defaultMessage)).toBe(false);
      Object.values(m.quotes).forEach((quote) => {
        expect(emojiRegex.test(quote)).toBe(false);
      });
    });
  });
});
