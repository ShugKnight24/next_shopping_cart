import Layout from '../Components/Layout';
import { CartProvider } from '../context/CartProvider';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return(
		<Layout>
			<CartProvider>
				<Component {...pageProps} />
			</CartProvider>
		</Layout>
	);
}

export default MyApp;
