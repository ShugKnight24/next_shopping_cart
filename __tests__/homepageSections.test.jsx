import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandStory } from '../Components/BrandStory/BrandStory';
import { FeaturedCategories } from '../Components/FeaturedCategories/FeaturedCategories';

describe('Homepage Discovery & Storytelling Components', () => {
  it('renders FeaturedCategories with all 5 curated department tiles', () => {
    render(<FeaturedCategories />);

    expect(screen.getByText(/Curated Departments/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore By Category/i)).toBeInTheDocument();

    expect(screen.getByText('Sneakers & Running')).toBeInTheDocument();
    expect(screen.getByText('High-Fidelity Audio')).toBeInTheDocument();
    expect(screen.getByText('Collectibles & TCG')).toBeInTheDocument();
    expect(screen.getByText('Studio Instruments')).toBeInTheDocument();
    expect(screen.getByText('Strength & Conditioning')).toBeInTheDocument();
  });

  it('renders BrandStory editorial section with 3 trust pillars and authentication proof', () => {
    render(<BrandStory />);

    expect(screen.getByText(/The Cart Commerce Standard/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Curated for Connoisseurs. Built on Absolute Trust./i)
    ).toBeInTheDocument();

    // 3 pillars
    expect(
      screen.getByText(/Multi-Point Authenticity Verification/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Vault-Grade Insured Express Transit/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Lifetime Guarantee of Origin/i)
    ).toBeInTheDocument();

    // Verification stats
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Verified Deadstock')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Counterfeit Tolerance')).toBeInTheDocument();
  });

  it('verifies zero emojis in FeaturedCategories and BrandStory', () => {
    const { container: catContainer } = render(<FeaturedCategories />);
    const { container: storyContainer } = render(<BrandStory />);

    const emojiRegex =
      /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    expect(emojiRegex.test(catContainer.textContent || '')).toBe(false);
    expect(emojiRegex.test(storyContainer.textContent || '')).toBe(false);
  });
});
