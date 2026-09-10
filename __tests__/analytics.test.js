import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatGA4Item,
  GA_TRACKING_ID,
  handleEvent,
  handlePageView,
  setTrafficClassification,
  trackAddToCart,
  trackApplyPromotion,
  trackBeginCheckout,
  trackRemoveFromCart,
  trackSearch,
  trackSelectItem,
  trackStudioInteraction,
  trackViewCart,
  trackViewItem,
  trackViewItemList,
  trackWebVitals,
} from '../analytics/google';

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

      handleEvent({
        action: 'add_to_cart',
        params: { id: 1, name: 'Jordan 1' },
      });

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        id: 1,
        name: 'Jordan 1',
      });
    });
  });

  describe('setTrafficClassification', () => {
    it('sets GA4 user properties with traffic classification', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      setTrafficClassification('human');

      expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', {
        traffic_classification: 'human',
        is_human: true,
      });

      setTrafficClassification('suspected_bot');
      expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', {
        traffic_classification: 'suspected_bot',
        is_human: false,
      });
    });
  });

  describe('GA4 Enhanced Ecommerce & Telemetry Helpers', () => {
    const sampleProduct = {
      itemid: 'PROD-1',
      productName: 'Air Jordan 4',
      category: 'Footwear',
      manufacturer: 'Nike',
      price: 310,
    };

    it('formats product item correctly with formatGA4Item', () => {
      const formatted = formatGA4Item(sampleProduct, 2, 'US 10.5', 3);
      expect(formatted).toEqual({
        item_id: 'PROD-1',
        item_name: 'Air Jordan 4',
        item_category: 'Footwear',
        item_brand: 'Nike',
        price: 310,
        quantity: 2,
        item_variant: 'US 10.5',
        index: 3,
      });
    });

    it('tracks view_item_list with trackViewItemList', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackViewItemList([sampleProduct], 'Sneakers', 'cat_sneakers');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_item_list', {
        item_list_id: 'cat_sneakers',
        item_list_name: 'Sneakers',
        items: [formatGA4Item(sampleProduct, 1, null, 1)],
      });
    });

    it('tracks select_item with trackSelectItem', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackSelectItem(sampleProduct, 'Catalog', 2);

      expect(mockGtag).toHaveBeenCalledWith('event', 'select_item', {
        item_list_name: 'Catalog',
        items: [formatGA4Item(sampleProduct, 1, null, 2)],
      });
    });

    it('tracks view_item with trackViewItem', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackViewItem(sampleProduct, 'US 11.0');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', {
        currency: 'USD',
        value: 310,
        items: [formatGA4Item(sampleProduct, 1, 'US 11.0')],
      });
    });

    it('tracks add_to_cart with trackAddToCart', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackAddToCart(sampleProduct, 2, 'US 10');

      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        currency: 'USD',
        value: 620,
        items: [formatGA4Item(sampleProduct, 2, 'US 10')],
      });
    });

    it('tracks remove_from_cart with trackRemoveFromCart', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackRemoveFromCart(sampleProduct, 1);

      expect(mockGtag).toHaveBeenCalledWith('event', 'remove_from_cart', {
        currency: 'USD',
        value: 310,
        items: [formatGA4Item(sampleProduct, 1)],
      });
    });

    it('tracks view_cart and begin_checkout', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      const cartItems = [{ ...sampleProduct, quantity: 1 }];
      trackViewCart(cartItems, 310);
      expect(mockGtag).toHaveBeenCalledWith('event', 'view_cart', {
        currency: 'USD',
        value: 310,
        items: [formatGA4Item(sampleProduct, 1)],
      });

      trackBeginCheckout(cartItems, 310, 'VIP20');
      expect(mockGtag).toHaveBeenCalledWith('event', 'begin_checkout', {
        currency: 'USD',
        value: 310,
        coupon: 'VIP20',
        items: [formatGA4Item(sampleProduct, 1)],
      });
    });

    it('tracks promotions, searches, and studio interactions', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackApplyPromotion('SAVE20', 20);
      expect(mockGtag).toHaveBeenCalledWith('event', 'apply_promotion', {
        coupon: 'SAVE20',
        discount_percent: 20,
      });

      trackSearch('Jordan', 4);
      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'Jordan',
        result_count: 4,
      });

      trackStudioInteraction('preset_angle', 'sole', { productId: 'PROD-1' });
      expect(mockGtag).toHaveBeenCalledWith('event', 'studio_3d_interaction', {
        interaction_action: 'preset_angle',
        interaction_label: 'sole',
        productId: 'PROD-1',
      });
    });

    it('tracks Next.js Web Vitals metrics', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackWebVitals({
        id: 'v1-12345',
        name: 'INP',
        value: 120,
        label: 'web-vital',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'INP', {
        event_category: 'Web Vitals',
        value: 120,
        event_label: 'v1-12345',
        non_interaction: true,
      });

      trackWebVitals({
        id: 'v1-67890',
        name: 'CLS',
        value: 0.045,
        label: 'web-vital',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
        event_category: 'Web Vitals',
        value: 45, // Multiplied by 1000 for CLS
        event_label: 'v1-67890',
        non_interaction: true,
      });
    });
  });
});
