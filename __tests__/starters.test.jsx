import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShopStory } from '../Components/Scroll3D/ShopStory';
import { StudioStory } from '../Components/Scroll3D/StudioStory';
import { starterCast } from '../Components/Studio/cast/castModel';
import {
  buildStarter,
  randomStarter,
  STARTERS,
} from '../Components/Studio/starters/starters';
import { PRODUCTS } from '../Components/Studio/workbench/products';

/**
 * Starter ideas: every one builds against the product it belongs to, uses
 * only cast members who exist, and never quietly raises the price.
 */

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    isReady: true,
    push: vi.fn(),
    replace: vi.fn(),
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

const FREE_LAYERS = { poster: 6, apparel: 3 };

describe.each(['poster', 'apparel', 'book', 'social'])(
  '%s starters',
  (mode) => {
    const product = PRODUCTS[mode];
    const options = { ...product.defaults, cast: starterCast() };
    const artboard = product.artboard(options);

    it.each(STARTERS[mode].map((s) => [s.name, s]))(
      'builds "%s"',
      (_, starter) => {
        const built = buildStarter(mode, starter, {
          artboard,
          options,
          cast: options.cast,
        });
        expect(built.layers.length).toBeGreaterThan(0);

        const ids = new Set(built.cast.map((m) => m.id));
        built.layers
          .filter((l) => l.type === 'character')
          .forEach((l) => expect(ids.has(l.castId)).toBe(true));

        if (FREE_LAYERS[mode]) {
          expect(built.layers.length).toBeLessThanOrEqual(FREE_LAYERS[mode]);
          const config = { ...options, ...built.options };
          const before = product.price(options, 0, 1).subtotal;
          expect(product.price(config, built.layers.length, 1).subtotal).toBe(
            before
          );
        }

        if (mode === 'book') {
          const pages = built.options.spreads.filter((s) => s.kind === 'story');
          expect(pages.length).toBeGreaterThanOrEqual(3);
          pages.forEach((page) =>
            expect(
              built.layers.some(
                (l) => l.page === page.id && l.type === 'character'
              )
            ).toBe(true)
          );
        }

        // Every placeholder in the words was filled in.
        built.layers
          .filter((l) => l.type === 'text')
          .forEach((l) => expect(l.text).not.toMatch(/\{/));
      }
    );

    it('adds anyone an idea needs to the cast', () => {
      const lonely = [options.cast[0]];
      const needy =
        STARTERS[mode].find((s) => (s.needs ?? []).length > 1) ??
        STARTERS[mode][0];
      const built = buildStarter(mode, needy, {
        artboard,
        options,
        cast: lonely,
      });
      expect(built.cast.length).toBeGreaterThanOrEqual(needy.needs.length);
    });

    it('inspires with an idea other than the one on screen', () => {
      const current = STARTERS[mode][0].id;
      for (let i = 0; i < 10; i += 1)
        expect(randomStarter(mode, current).id).not.toBe(current);
    });
  }
);

describe('scroll stories', () => {
  it.each([
    [
      'storefront',
      ShopStory,
      'A quick tour of Cart Commerce',
      'Shop the collection',
    ],
    [
      'studio',
      StudioStory,
      'How the Custom Creation Studio works',
      'Make a storybook',
    ],
  ])(
    'renders the %s story as readable captions before any 3D loads',
    (_, Story, label, cta) => {
      render(<Story />);
      expect(screen.getByRole('region', { name: label })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: cta })).toBeInTheDocument();
      expect(
        screen.getByRole('list', { name: 'Story chapters' })
      ).toBeInTheDocument();
    }
  );
});
