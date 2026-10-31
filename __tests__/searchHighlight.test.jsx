import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '../Components/Search/CommandPalette';
import { Highlight } from '../Components/Search/Highlight';

const products = [
  {
    itemid: 'PHONE-16',
    productName: 'iPhone 16 Pro',
    manufacturer: 'Apple',
    price: 999,
    image: '/phone.png',
  },
  {
    itemid: 'MIC-58',
    productName: 'SM58',
    manufacturer: 'Shure',
    price: 99,
    image: '/mic.png',
  },
];

describe('Highlight', () => {
  it('wraps matched text in mark elements', () => {
    const { container } = render(
      <Highlight text="iPhone 16 Pro" query="iphon" />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('iPhon');
    expect(container.textContent).toBe('iPhone 16 Pro');
  });

  it('renders plain text without a match', () => {
    const { container } = render(<Highlight text="SM58" query="apple" />);
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('SM58');
  });
});

describe('CommandPalette search', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ranks products fuzzily as the user types', () => {
    render(<CommandPalette isOpen onClose={() => {}} products={products} />);

    fireEvent.change(
      screen.getByPlaceholderText('Search products, brands, categories...'),
      { target: { value: 'ipohne' } }
    );
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('iPhone', { selector: 'mark' })).toBeTruthy();
    expect(screen.queryByText('SM58')).toBeNull();
  });
});
