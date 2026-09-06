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

  it('renders Luna The Cosmic Shepherd by default with accessible SVG and dialogue', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    expect(screen.getByText('Luna The Cosmic Shepherd')).toBeInTheDocument();
    expect(screen.getByLabelText(/Luna The Cosmic Shepherd Mascot/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Welcome home!/i)
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
    expect(screen.queryByLabelText(/Luna The Cosmic Shepherd Mascot/i)).not.toBeInTheDocument();
    const enableBtn = screen.getByRole('button', { name: /Turn on Brand Companion/i });
    expect(enableBtn).toBeInTheDocument();
    expect(localStorage.getItem('shopping_cart.mascot_enabled')).toBe('false');

    // Clicking enable restores the companion
    fireEvent.click(enableBtn);
    expect(screen.getByLabelText(/Luna The Cosmic Shepherd Mascot/i)).toBeInTheDocument();
    expect(localStorage.getItem('shopping_cart.mascot_enabled')).toBe('true');
  });

  it('allows swapping companions within shop realm (Luna, Carty, and Sparky)', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    const switchBtn = screen.getByRole('button', {
      name: /Switch between companions/i,
    });
    expect(switchBtn).toHaveTextContent(/Switch to Carty/i);
    fireEvent.click(switchBtn);

    expect(screen.getByText('Carty The Courier')).toBeInTheDocument();
    expect(screen.getByLabelText(/Carty The Courier Mascot/i)).toBeInTheDocument();
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
      screen.queryByText(/Welcome home!/i)
    ).not.toBeInTheDocument();
    // But character is still present
    expect(screen.getByLabelText(/Luna The Cosmic Shepherd Mascot/i)).toBeInTheDocument();
  });

  it('provides interactive action chips that trigger speech and particle reactions', () => {
    render(
      <MascotProvider>
        <MascotCompanion />
      </MascotProvider>
    );

    const treatBtn = screen.getByRole('button', { name: /Give Astronaut Treat/i });
    expect(treatBtn).toBeInTheDocument();
    fireEvent.click(treatBtn);

    expect(
      screen.getByText(/Luna wags her tail happily and does a zero-gravity spin/i)
    ).toBeInTheDocument();
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
      if (m.interactiveActions) {
        m.interactiveActions.forEach((action) => {
          expect(emojiRegex.test(action.label)).toBe(false);
          expect(emojiRegex.test(action.reply)).toBe(false);
        });
      }
    });
  });

  it('registers Finley The Starlight Fox under kids realm with celestial quotes and actions', () => {
    expect(MASCOTS.finley).toBeDefined();
    expect(MASCOTS.finley.realm).toBe('kids');
    expect(MASCOTS.finley.name).toBe('Finley The Starlight Fox');
    expect(MASCOTS.finley.quotes.home).toContain('stars');
    expect(MASCOTS.finley.interactiveActions.some((a) => a.id === 'secret')).toBe(true);
  });
});
