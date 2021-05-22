import PropTypes from 'prop-types';

export function HorizontalRule({ color, borderWidth }){
	return(
		<hr 
			className="horizontal-rule"
			style={{ 
				borderColor: `${ color }`,
				borderWidth: `${ borderWidth }px`
			}}
		/>
	);
}

HorizontalRule.propTypes = {
	color: PropTypes.string,
	borderWidth: PropTypes.number
}