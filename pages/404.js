import Link from 'next/link'
import { useEffect } from 'react';
import { useRouter } from 'next/router'

export default function NotFound(){

	const router = useRouter();

	useEffect(() => {
		setTimeout(() => {
			router.push('/');
		}, 5000);
	}, []);

	return(
		<div className="not-found-container">
			<div className="page-header">
				<h1>Page Not Found</h1>
				<h2>Are you sure you have the right address</h2>
			</div>
			<div className="not-found-body">
				<p>Use the links below to navigate to some of our most popular pages</p>
				<p>You'll be redirected to the homepage in 5 seconds automatically</p>
				<ul>
					Return:
					<li>
						<Link href="/"><a>Home</a></Link>
					</li>
					<li>
						<Link href="/products"><a>Products</a></Link>
					</li>
					<li>
						<Link href="/cart"><a>Cart</a></Link>
					</li>
				</ul>
			</div>
		</div>
	)
}