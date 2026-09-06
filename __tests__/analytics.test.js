import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GA_TRACKING_ID, handleEvent, handlePageView } from '../analytics/google';

describe('Google Analytics Utility', () => {
  const originalGtag = window.gtag;

  beforeEach(() => {
    delete window.gtag;
  });

  afterEach(() => {
    if (originalGtag) {
      window.gtag = originalGtag;
    } else {
      delete window.gtag;
    }
    vi.restoreAllMocks();
  });

  it('exports GA_TRACKING_ID', () => {
    expect(GA_TRACKING_ID).toBeDefined();
    expect(typeof GA_TRACKING_ID).toBe('string');
  });

  describe('handlePageView', () => {
    it('does not throw when window.gtag is undefined', () => {
      expect(() => handlePageView('/test-url')).not.toThrow();
    });

    it('does not throw when window.gtag is not a function', () => {
      window.gtag = 'not-a-function';
      expect(() => handlePageView('/test-url')).not.toThrow();
    });

    it('calls window.gtag with config and page_path when available', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      handlePageView('/shop/shoes');

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('config', GA_TRACKING_ID, {
        page_path: '/shop/shoes',
      });
    });
  });

  describe('handleEvent', () => {
    it('does not throw when window.gtag is undefined', () => {
      expect(() => handleEvent({ action: 'click', params: {} })).not.toThrow();
      expect(() => handleEvent()).not.toThrow();
    });

    it('does not throw when window.gtag is not a function', () => {
      window.gtag = { some: 'object' };
      expect(() => handleEvent({ action: 'click', params: {} })).not.toThrow();
    });

    it('calls window.gtag with event, action, and params when available', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      handleEvent({ action: 'add_to_cart', params: { id: 1, name: 'Jordan 1' } });

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        id: 1,
        name: 'Jordan 1',
      });
    });
  });
});
