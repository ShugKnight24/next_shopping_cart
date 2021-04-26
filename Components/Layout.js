import Nav from './Nav';
import Footer from './Footer';

export default function Layout({ children }){
	return(
		<div className="site-container">
			<Nav />
			{ children }
			<Footer />
		</div>
	);
}