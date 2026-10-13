import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollStory } from '../Components/Scroll3D/ScrollStory';

// No WebGL: the renderer cannot be created, so the story falls back to text.
vi.mock('three', () => ({
  WebGLRenderer: function WebGLRenderer() {
    throw new Error('WebGL unavailable');
  },
}));

const CAPTIONS = [
  { at: [0, 0.3], title: 'First' },
  { at: [0.35, 0.6], title: 'Second' },
  {
    at: [0.7, 1],
    title: 'Last',
    ctas: [{ href: '/products', label: 'Shop now', primary: true }],
  },
];

describe('ScrollStory without WebGL', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('leaves every caption and its links reachable', async () => {
    render(
      <ScrollStory
        id="test-story"
        label="Test story"
        captions={CAPTIONS}
        loadScene={vi.fn()}
      />
    );

    const story = await screen.findByLabelText('Test story');
    await waitFor(() => expect(story.className).toMatch(/isStatic/));

    for (const title of ['First', 'Second', 'Last']) {
      expect(
        screen.getByRole('heading', { name: title }).closest('article').inert
      ).toBe(false);
    }
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
  });

  it('puts the skip link before everything else in the story', async () => {
    render(
      <ScrollStory
        id="test-story"
        label="Test story"
        captions={CAPTIONS}
        loadScene={vi.fn()}
        skipTo="#after"
      />
    );
    const story = await screen.findByLabelText('Test story');
    const focusable = story.querySelectorAll('a[href], button');

    expect(focusable[0]).toHaveTextContent('Skip the story');
  });
});
