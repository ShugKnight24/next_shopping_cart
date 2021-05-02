import Head from 'next/head';
import { Products } from '../../Components/Products';

export default function ProductsPage(){
	return(
		<>
			<Head>
				<title>Shopping Cart | All Products Page</title>
			</Head>
			<div className="products-page">
				<div className="page-header">
					<h1>All Products</h1>
				</div>
				<Products />
			</div>
		</>
	);
}