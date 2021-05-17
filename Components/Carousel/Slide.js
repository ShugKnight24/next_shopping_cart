import PropTypes from 'prop-types';

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

Slide.propTypes = {
	productName: PropTypes.string.isRequired,
	slideText: PropTypes.string.isRequired,
	slideMemeText: PropTypes.string.isRequired,
	slideImage: PropTypes.string.isRequired
};