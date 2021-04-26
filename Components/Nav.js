import Link from 'next/link';

export default function Nav(){
	return(
		<div className="nav-container">
			<nav>
				<Link href="/"><a>Shop</a></Link>
				<Link href="/products"><a>Products</a></Link>
				<Link href="/cart"><a>Cart</a></Link>
			</nav>
		</div>
	);
}