import PropTypes from 'prop-types';
import Footer from './Footer';
import Nav from './Nav';

export default function Layout({ children }) {
  return (
    <>
      <div className="site-container">
        <Nav />
        {children}
        <Footer />
      </div>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.element.isRequired,
};
