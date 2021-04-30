import { useEffect } from 'react';

export function InstantSearch(){
	const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
	const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

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
	.then(data => console.log(data));

	useEffect(() => {
		fetchAlgoliaData();
	}, []);

	return(
		<div className="instant-search-container">
			<div>This is InstantSearch</div>
		</div>
	);
}