import Layout from '../Components/Layout';
import { CartProvider } from '../context/CartProvider';
import { ModalProvider } from '../context/ModalProvider';

import '../styles/app.scss';

function MyApp({ Component, pageProps }) {
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
