import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { handlePageView } from '../analytics/google';
import Layout from '../Components/Layout';
import { ToastProvider } from '../Components/UI/Toast';
import { CartProvider } from '../context/CartProvider';
import { ModalProvider } from '../context/ModalProvider';
import '../static/normalize.css';
import '../styles/app.scss';

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
    <ToastProvider>
      <ModalProvider>
        <CartProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CartProvider>
      </ModalProvider>
    </ToastProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
