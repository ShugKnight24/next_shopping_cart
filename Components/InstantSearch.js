import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';

export function InstantSearch(){
	const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
	const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

	const { state, dispatch } = useContext(CartContext);
	const [showHits, setShowHits] = useState(false);
	const [hitList, setHitList] = useState([]);

	const url = `https://${ appId }-dsn.algolia.net/1/indexes/${ indexName }`;
	/*
		Built from https://www.algolia.com/doc/rest-api/search/
		Eventually implement try catch for all Algolia api servers...?
		-1.algolianet.com
		-2.algolianet.com
		-3.algolianet.com
	*/
	
	const fetchAlgoliaData = () => fetch(url, {
		method: 'GET',
		withCredentials: true,
		headers: {
			'X-Algolia-API-Key': apiKey,
			'X-Algolia-Application-Id': appId,
			'Content-Type': 'application/json; charset=UTF-8'
		}
	})
	.then(response => response.json())
	.then(data => buildSearch(data.hits));

	function handleButtonClick(event, productId){
		event.stopPropagation();
		dispatch({ 
			type: 'ADD_ITEM',
			payload: {
				productId
			}
		});
	}

	// update # available from inventory state
	const buildSearch = (algoliaResponse) => {
		const hitsHTML = algoliaResponse.map(product => {
			const disabledButton = product.available === 0 ? true : false;
			return(
				<li 
					className="hit-container"
					key={ product.itemid }
				>
					<Link href={`/products/${ product.itemid.toString() }`}>
						<a>
							<div className="hit-content">
								<img
									className="hit-image"
									src={ product.image }
									alt={`${ product.productName } made by ${ product.manufacturer }`}
								/>
								<div className="name-manufacturer">
									<h2>{ product.productName }</h2>
									<h3>Made By: { product.manufacturer }</h3>
								</div>
								<button 
									className={`button add-cart-button ${ disabledButton ? 'disabled' : '' }`}
									onClick={ (event) => handleButtonClick(event,  product.itemid) }
								>Add To Cart</button>
							</div>
						</a>
					</Link>
				</li>
			);
		});
		setHitList(hitsHTML);
	}

	useEffect(() => {
		fetchAlgoliaData();
	}, []);

	return(
		<div className="instant-search-container">
			<input
				className="instant-search"
				type="text"
				placeholder="Search Products"
				onClick={
					() => setShowHits(true)
				}
			/>
			<ul className={`instant-list ${ showHits ? 'populated' : '' }`}>
				{
					showHits
					? hitList.map(hit => <>{hit}</>)
					: (
						<>
							<li><a>Find the products you want</a></li>
							<li><a>Filter by name and manufacturer</a></li>
						</>
					)
				}
				
			</ul>
		</div>
	);
}