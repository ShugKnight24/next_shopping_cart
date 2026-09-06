import { useRouter } from 'next/router';
import Script from 'next/script';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { GA_TRACKING_ID, handlePageView, trackWebVitals } from '../analytics/google';
import { HoneypotField, telemetry } from '../analytics/telemetry';
import Layout from '../Components/Layout';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import { MascotProvider } from '../context/MascotProvider';
import { ModalProvider } from '../context/ModalProvider';
import { MascotCompanion } from '../Components/Mascot/MascotCompanion';
import '../static/normalize.css';
import '../styles/globals.css';

export function reportWebVitals(metric) {
  trackWebVitals(metric);
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    telemetry.init();

    const handleRouteChange = (url) => {
      handlePageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
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
            <MascotProvider>
              <Layout>
                <HoneypotField />
                <Component {...pageProps} />
                <MascotCompanion />
              </Layout>
            </MascotProvider>
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
