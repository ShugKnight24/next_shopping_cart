import Layout from '../Components/Layout';
import { CartProvider } from '../context/CartProvider';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return(
		<CartProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</CartProvider>
	);
}

export default MyApp;
