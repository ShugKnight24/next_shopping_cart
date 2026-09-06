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
      expect(screen.getByText('Luxury Vault')).toBeInTheDocument();
      expect(screen.getByText('3D Stage')).toBeInTheDocument();
      expect(screen.getByText('WebGL Vortex')).toBeInTheDocument();

      // Click on 3D Stage
      fireEvent.click(screen.getByText('3D Stage'));
      expect(onSelect).toHaveBeenCalledWith('3d');
    });
  });

  describe('VaultAnimation', () => {
    it('renders the 2D vector vault showcase and levitating items', () => {
      render(<VaultAnimation />);
      expect(screen.getByLabelText(/Luxury vault showcase animation/i)).toBeInTheDocument();
      expect(screen.getByText(/AIR JORDAN 1/i)).toBeInTheDocument();
      expect(screen.getByText(/BLACK LOTUS/i)).toBeInTheDocument();
      expect(screen.getByText(/FENDER '60S STRAT/i)).toBeInTheDocument();
      expect(screen.getByText(/ROGUE OHIO BAR/i)).toBeInTheDocument();
    });
  });

  describe('Isometric3DHero', () => {
    it('renders 3D spatial product cards and handles mouse tilt interaction', () => {
      render(<Isometric3DHero />);
      expect(
        screen.getByLabelText(/Interactive 3D product showcase/i)
      ).toBeInTheDocument();

      expect(
        screen.getByText("Air Jordan 1 'Lost & Found'")
      ).toBeInTheDocument();
      expect(screen.getByText(/Black Lotus Alpha 9.5/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Rogue Ohio Cerakote Bar/i)
      ).toBeInTheDocument();

      // Mouse move triggers tilt without errors
      const viewport = screen.getByRole('region');
      fireEvent.mouseMove(viewport, { clientX: 200, clientY: 150 });
      fireEvent.mouseLeave(viewport);
    });
  });

  describe('WebGLCosmicHero', () => {
    it('renders WebGL canvas or graceful fallback with HUD telemetry', () => {
      render(<WebGLCosmicHero />);
      expect(screen.getByText('QUANTUM COSMOS')).toBeInTheDocument();
      expect(
        screen.getByText(/GPU ACCELERATED \/\/ 1200 PARTICLES/i)
      ).toBeInTheDocument();
    });
  });

  describe('Hero Component Integration', () => {
    it('mounts full Hero section and allows switching modes dynamically', () => {
      render(<Hero />);
      expect(
        screen.getByRole('heading', { level: 1 })
      ).toHaveTextContent(/Shop Smarter/i);

      // Initially on track
      expect(screen.getByText('CHECKOUT')).toBeInTheDocument();

      // Switch to Vault
      fireEvent.click(screen.getByText('Luxury Vault'));
      expect(screen.getByText(/AIR JORDAN 1/i)).toBeInTheDocument();

      // Switch to 3D
      fireEvent.click(screen.getByText('3D Stage'));
      expect(
        screen.getByText("Air Jordan 1 'Lost & Found'")
      ).toBeInTheDocument();

      // Switch to WebGL
      fireEvent.click(screen.getByText('WebGL Vortex'));
      expect(screen.getByText('QUANTUM COSMOS')).toBeInTheDocument();
    });
  });
});
