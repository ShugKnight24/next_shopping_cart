import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { sameCastArt, starterCast } from '../Components/Studio/cast/castModel';
import {
  omit,
  useSettled,
  useStable,
} from '../Components/Studio/core/useStable';

describe('useStable', () => {
  it('keeps the old object while nothing that matters changed', () => {
    const { result, rerender } = renderHook(({ v }) => useStable(v), {
      initialProps: { v: { a: 1, b: 2 } },
    });
    const first = result.current;

    rerender({ v: { a: 1, b: 2 } });
    expect(result.current).toBe(first);

    rerender({ v: { a: 1, b: 3 } });
    expect(result.current).not.toBe(first);
  });

  it('ignores the keys a caller leaves out', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useStable(omit(v, ['caption'])),
      { initialProps: { v: { theme: 'mint', caption: 'Hi' } } }
    );
    const first = result.current;

    rerender({ v: { theme: 'mint', caption: 'Hi there' } });
    expect(result.current).toBe(first);
  });
});

describe('sameCastArt', () => {
  it('treats a renamed member as the same art, a new look as different', () => {
    const cast = starterCast();
    const renamed = cast.map((m, i) => (i ? m : { ...m, name: 'Zuri' }));
    const restyled = cast.map((m, i) => (i ? m : { ...m, hair: 'afro' }));

    expect(sameCastArt(cast, renamed)).toBe(true);
    expect(sameCastArt(cast, restyled)).toBe(false);
  });
});

describe('useSettled', () => {
  it('follows a value once it stops changing', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useSettled(v, 100), {
      initialProps: { v: 1 },
    });

    rerender({ v: 2 });
    rerender({ v: 3 });
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(3);
    vi.useRealTimers();
  });
});
