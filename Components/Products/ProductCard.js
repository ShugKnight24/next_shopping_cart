import { useContext } from 'react';
import Link from 'next/link';
import { ModalContext } from '../../context/ModalProvider';
import { formatCurrency } from '../../utils/cartUtils';

export function ProductCard({ 
	available,
	description,
	image,
	itemid,
	manufacturer,
	price,
	productName,
	setSelectedProduct
}){
	const { setShowModal, setModalType } = useContext(ModalContext);

	function handleAddToCart(itemid){
		setShowModal(true);
		setModalType('Add');
		setSelectedProduct(itemid);
	}

	const disabledButton = available === 0 ? true : false;
	return (
		<div
			className="product"
		>
			<img 
				src={ image }
				alt={`${ productName } made by ${ manufacturer }`}
			/>
			<h2>{ productName }</h2>
			<h3>Manufactured By: { manufacturer }</h3>
			<div className="product-info">
				{/* TODO:// Trim description Text `...Read More` => Head to Specific product */}
				<p className="product-description">
					<span className="bold-text">Description</span>: { description }
				</p>
				<p className="product-price">
					<span className="bold-text">Price</span>: { formatCurrency(price) }
				</p>
				<p className="product-quantity">
					<span className="bold-text">Currently Available</span>: { available }
				</p>
				<div className="product-actions">
					<button className="button more-info-button">
						<Link href={`/products/${ itemid.toString() }`}><a>More Info</a></Link>
					</button>
					<button
						className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
						onClick={ () => handleAddToCart(itemid) }
					>Add To Cart</button>
				</div>
			</div>
		</div>
	)
}