import { useRouter } from 'next/router';
import Script from 'next/script';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { GA_TRACKING_ID, handlePageView } from '../analytics/google';
import Layout from '../Components/Layout';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import { ModalProvider } from '../context/ModalProvider';
import '../static/normalize.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      handlePageView(url);
    };

    // Next Router Events: https://nextjs.org/docs/api-reference/next/router#routerevents
    // handle pageview on mount
    router.events.on('routeChangeComplete', handleRouteChange);

    // cleanup
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <>
      {GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <ToastProvider>
        <ModalProvider>
          <CartProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CartProvider>
        </ModalProvider>
      </ToastProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
