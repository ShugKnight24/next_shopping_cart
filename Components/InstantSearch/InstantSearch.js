import { useEffect, useState } from 'react';
import { Hit } from './Hit';

export function InstantSearch(){
	const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
	const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

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
	.then(data => setHitList(data.hits));

	useEffect(() => {
		fetchAlgoliaData();
	}, []);

	return(
		<div className="instant-search-container">
			<input
				className="instant-search"
				type="text"
				placeholder="Search Products"
				onFocus={ 
					() => setShowHits(true)
				}
				onBlur={
					() => setShowHits(false)
				}
			/>
			<ul className={`instant-list ${ showHits ? 'populated' : '' }`}>
				{
					showHits
					? hitList.map(product => {
						return(
							<Hit
								key={ product.itemid }
								itemid={ product.itemid }
								image={ product.image }
								productName={ product.productName }
								manufacturer={ product.manufacturer }
							/>
						)
					})
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