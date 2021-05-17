import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { ProductCard } from '../Components/Products/ProductCard';

export default function Favorites(){
	const { state } = useContext(CartContext)
	const { inventory } = state;

	const filteredFavorites = inventory.filter((item) => {
		if (item.favorite === null){
			return item;
		}
	})

	return(
		<>
			<Head>
				<title>Shopping Cart | Favorites</title>
			</Head>
			<div className="favorites-container">
				<h1>Favorite Products</h1>
			{
				filteredFavorites.length > 0
				?
				filteredFavorites.map(({ available, description, favorite, image, itemid, manufacturer, price, productName }) => {
					return(
						<ProductCard 
							key={ itemid }
							available={ available }
							description={ description }
							favorite={ favorite }
							image={ image }
							itemid={ itemid }
							manufacturer={ manufacturer }
							price={ price }
							productName={ productName }
						/>
					)
				})
				:
				<div className="no-favorites">
					<p className="bold-text">You have no favorite products</p>
					<p>Use the links below to navigate to our most popular pages</p>
 					<ul>
						<span className="bold-text">Continue Shopping</span>:
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
			}
			</div>
		</>
	)
}