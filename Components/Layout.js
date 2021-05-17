import Head from 'next/head';
import Nav from './Nav';
import Footer from './Footer';
import PropTypes from 'prop-types';

export default function Layout({ children }){
	return(
		<>
			<Head>
				<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.15.2/css/all.css"></link>
				<link rel="stylesheet" href="../static/normalize.css"></link>
			</Head>
			<div className="site-container">
				<Nav />
				{ children }
				<Footer />
			</div>
		</>
	);
}

Layout.propTypes = {
	children: PropTypes.element.isRequired
};
