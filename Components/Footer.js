import Link from 'next/link';
import { HorizontalRule } from '../Components/HorizontalRule';
import { PaymentMethods } from '../Components/PaymentMethods';
import { SocialIcons } from '../Components/SocialIcons';
import { Logo } from './Logo';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <div className="footer-container">
      <footer>
        <div className="store-info">
          <div className="store-description">
            <Link href="/" aria-label="Home / Shop">
              <Logo />
            </Link>
            <p>
              Our store provides quality products at their lowest retail prices
            </p>
            {/* TODO: Place payment methods below footer */}
            <PaymentMethods />
          </div>
          <div className="store-links">
            <div className="shopping">
              <h3>Online Shopping</h3>
              <ul>
                <li>
                  <Link href="#">New Products</Link>
                </li>
                {/* TODO: Consolidate under an FAQ? */}
                <li>
                  <Link href="#">Order Status</Link>
                </li>
                <li>
                  <Link href="#">Shipping and Delivery</Link>
                </li>
                <li>
                  <Link href="#">Returns</Link>
                </li>
                <li>
                  <Link href="#">Payment Options</Link>
                </li>
              </ul>
            </div>
            <div className="info">
              <h3>Shop Info</h3>
              <ul>
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Location</Link>
                </li>
                <li>
                  <Link href="#">Feedback</Link>
                </li>
              </ul>
            </div>
            <div className="contact">
              <h3>Contact</h3>
              <ul>
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
                <li>
                  <Link href="mailto:customersupport@storename.com">
                    customersupport@storename.com
                  </Link>
                </li>
                <li>
                  <Link href="tel:12345678900">1-234-567-8900</Link>
                </li>
              </ul>
              <SocialIcons />
            </div>
          </div>
        </div>
        <HorizontalRule color={'#1173A8'} borderWidth={1} />
        <div className="copyright">
          Copyright {currentYear} &copy; Shugmi Shumunov All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
