import Link from 'next/link';
import { HorizontalRule } from '../Components/HorizontalRule';
import { SocialIcons } from '../Components/SocialIcons';

export default function Footer(){
	return(
		<div className="footer-container">
			<footer>
				<div className="store-info">
					<div className="store-description">
						<div className="image-name">
							<i className="fas fa-shopping-cart"></i>
							<h2>Cart Commerce</h2>
						</div>
						<p>Our store provides quality products at their lowest retail prices</p>
						<SocialIcons />
					</div>
					<div className="store-links">
						<div className="shopping">
							<h3>Online Shopping</h3>
							<ul>
								<li>
									<Link href="#"><a>New Products</a></Link>
								</li>
								{/* Consolidate under an FAQ? */}
								<li>
									<Link href="#"><a>Order Status</a></Link>
								</li>
								<li>
									<Link href="#"><a>Shipping and Delivery</a></Link>
								</li>
								<li>
									<Link href="#"><a>Returns</a></Link>
								</li>
								<li>
									<Link href="#"><a>Payment Options</a></Link>
								</li>
							</ul>
						</div>
						<div className="info">
							<h3>Shop Info</h3>
							<ul>
								<li>
									<Link href="#"><a>About Us</a></Link>
								</li>
								<li>
									<Link href="#"><a>Blog</a></Link>
								</li>
								<li>
									<Link href="#"><a>Location</a></Link>
								</li>
								<li>
									<Link href="#"><a>Feedback</a></Link>
								</li>
							</ul>
						</div>
						<div className="contact">
							<h3>Contact</h3>
							<ul>
								<li>
									<Link href="#"><a>Contact Us</a></Link>
								</li>
								<li>
									<Link href="mailto:customersupport@storename.com">
										<a>customersupport@storename.com</a>
									</Link>
								</li>
								<li>
									<Link href="tel:12345678900">
										<a>1-234-567-8900</a>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<HorizontalRule 
					color={ '#1173A8' }
					borderWidth={ 1 }
				/>
				<div className="copyright">
					Copyright 2021 &copy; Shugmi Shumunov All Rights Reserved
				</div>
			</footer>
		</div>
	)
}