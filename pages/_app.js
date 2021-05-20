import { useEffect } from 'react';
import Layout from '../Components/Layout';
import { CartProvider } from '../context/CartProvider';
import { ModalProvider } from '../context/ModalProvider';
import { useRouter } from 'next/router';
import { handlePageView } from '../analytics/google';

import '../styles/app.scss';

function MyApp({ Component, pageProps }) {
	const router = useRouter();

	useEffect(() => {
		const handleRouteChange = (url) => {
			handlePageView(url);
		}

		// Next Router Events: https://nextjs.org/docs/api-reference/next/router#routerevents
		// handle pageview on mount
		router.events.on('routeChangeComplete', handleRouteChange);

		// cleanup
		return () => router.events.off('routeChangeComplete', handleRouteChange);
	}, [router.events]);

	return(
		<ModalProvider>
			<CartProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</CartProvider>
		</ModalProvider>
	);
}

export default MyApp;
