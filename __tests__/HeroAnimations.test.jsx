import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Hero } from '../Components/Hero/Hero';
import { HeroAnimationSwitcher } from '../Components/Hero/HeroAnimationSwitcher';
import { Isometric3DHero } from '../Components/Hero/Isometric3DHero';
import { VaultAnimation } from '../Components/Hero/VaultAnimation';
import { WebGLCosmicHero } from '../Components/Hero/WebGLCosmicHero';

describe('Hero Animations & Interactive Switcher', () => {
  describe('HeroAnimationSwitcher', () => {
    it('renders all 4 animation tabs with proper ARIA attributes', () => {
      const onSelect = vi.fn();
      render(
        <HeroAnimationSwitcher activeMode="track" onSelectMode={onSelect} />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      expect(screen.getByText('Cart Track')).toBeInTheDocument();
      expect(screen.getByText('Private Vault')).toBeInTheDocument();
      expect(screen.getByText('Studio Gallery')).toBeInTheDocument();
      expect(screen.getByText('Gold Dust')).toBeInTheDocument();

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[0]).toHaveAttribute('aria-controls', 'hero-animation-track');

      // Click on the Studio Gallery
      fireEvent.click(screen.getByText('Studio Gallery'));
      expect(onSelect).toHaveBeenCalledWith('3d');
    });
  });

  describe('VaultAnimation', () => {
    it('reveals an authenticated curated piece and lets shoppers pick another', () => {
      render(<VaultAnimation />);
      expect(
        screen.getByRole('img', { name: /Private vault opening to reveal/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'The One Ring' })
      ).toBeInTheDocument();
      expect(screen.getByText(/Authenticated/i)).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: /Show Black Lotus/i })
      );
      expect(
        screen.getByRole('heading', { name: 'Black Lotus' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Show Black Lotus/i })
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Isometric3DHero', () => {
    it('shows curated pieces next to Studio creations and handles tilt', () => {
      render(<Isometric3DHero />);
      const region = screen.getByRole('region', { name: /Studio gallery/i });
      expect(region).toBeInTheDocument();

      expect(screen.getAllByText('Mia & the Moon Fox').length).toBeGreaterThan(
        0
      );
      expect(
        screen.getByText("Air Jordan 1 'Lost & Found'")
      ).toBeInTheDocument();
      expect(screen.getByText('Team Leo Hoodie')).toBeInTheDocument();

      // Choosing a card brings it to the front.
      fireEvent.click(screen.getByRole('button', { name: /Our Crew/i }));
      expect(screen.getByRole('button', { name: /Our Crew/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      // Pointer tilt runs without errors
      fireEvent.pointerMove(region, { clientX: 200, clientY: 150 });
      fireEvent.pointerLeave(region);
    });
  });

  describe('WebGLCosmicHero', () => {
    it('renders the gold dust stage or its static fallback', () => {
      render(<WebGLCosmicHero />);
      expect(
        screen.getByRole('img', { name: /Gold dust particles forming/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Gold Dust · WebGL/i)).toBeInTheDocument();
      expect(screen.getByText('Your cart')).toBeInTheDocument();
    });
  });

  describe('Hero Component Integration', () => {
    it('mounts full Hero section and allows switching modes dynamically', () => {
      render(<Hero />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /Shop Smarter/i
      );

      // Initially on the cart track
      expect(
        screen.getByRole('img', { name: /chrome Cart Commerce cart/i })
      ).toBeInTheDocument();
      expect(screen.getByText('CHECKOUT')).toBeInTheDocument();

      // Switch to the vault
      fireEvent.click(screen.getByText('Private Vault'));
      expect(
        screen.getByRole('heading', { name: 'The One Ring' })
      ).toBeInTheDocument();

      // Switch to the Studio gallery
      fireEvent.click(screen.getByText('Studio Gallery'));
      expect(
        screen.getByText("Air Jordan 1 'Lost & Found'")
      ).toBeInTheDocument();

      // Switch to gold dust
      fireEvent.click(screen.getByText('Gold Dust'));
      expect(screen.getByText(/Gold Dust · WebGL/i)).toBeInTheDocument();
    });
  });
});
