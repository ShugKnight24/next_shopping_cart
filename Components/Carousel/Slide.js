export function Slide({ productName, slideText, slideMemeText, slideImage }){
	return(
		<div className="slide fade">
			<h2>{ productName }</h2>
			<h3>{ slideText }</h3>
			<h3>{ slideMemeText }</h3>
			<img 
				src={ slideImage }
				alt={ productName }
			/>
		</div>
	)
}