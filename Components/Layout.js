import PropTypes from 'prop-types';
import Footer from './Footer';
import Nav from './Nav';
import { BackToTop } from './UI';

export default function Layout({ children }) {
  return (
    <>
      <div className="site-container">
        <Nav />
        {children}
        <Footer />
        <BackToTop />
      </div>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.element.isRequired,
};
