import { useEffect, useState } from 'react';
import { Hit } from './Hit';

export function InstantSearch(){
	const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
	const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

	const [showHits, setShowHits] = useState(false);
	const [hitList, setHitList] = useState([]);

	const baseAlgoliaURL = `https://${ appId }-dsn.algolia.net/1/indexes/${ indexName }`;

	/*
		Built from https://www.algolia.com/doc/rest-api/search/
		Eventually implement try catch for all Algolia api servers...?
		-1.algolianet.com
		-2.algolianet.com
		-3.algolianet.com
	*/
	
	const fetchAlgoliaData = (url) => fetch(url, {
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
		fetchAlgoliaData(baseAlgoliaURL);
	}, []);

	function handleKeyUp(event){
		const newKey = event.target.value;
		const searchURL = baseAlgoliaURL + '?query=' + encodeURIComponent(newKey) + '&hitsPerPage=2&getRankingInfo=1';
		const newURL = (event.target.value === '') ? baseAlgoliaURL : searchURL;

		fetchAlgoliaData(newURL);
	}

	return(
		<div className={`instant-search-container ${ showHits ? 'populated' : '' }`}>
			<input
				className="instant-search"
				type="text"
				placeholder="Search Products"
				onFocus={ 
					() => setShowHits(true)
				}
				onBlur={
					() => setShowHits(false)
				onKeyUp={ 
					(event) => handleKeyUp(event)
				}
			/>
			<ul className="instant-list">
				{
					showHits
					?
						hitList !== undefined
						?
						hitList.map(product => {
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
						: <li><a>No Matches Found</a></li>

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