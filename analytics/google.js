// track page views by URL
// More info on PageViews: https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const handlePageView = (url) => {
	window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
		page_path: url,
	});
}

// track specific events
// More info on Event Tracking: https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const handleEvent = ({ action, params }) => {
	window.gtag('event', action, params);
}