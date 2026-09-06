export const getTrackingId = () =>
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

export const GA_TRACKING_ID = getTrackingId();

// track page views by URL
// More info on PageViews: https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const handlePageView = (url, trackingId = getTrackingId()) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    trackingId
  ) {
    window.gtag('config', trackingId, {
      page_path: url,
    });
  }
};

// track specific events
// More info on Event Tracking: https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const handleEvent = ({ action, params } = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};