import PropTypes from 'prop-types';

export function Dot({ onClick }){
	return(
		<span className="dot"
			onClick={ onClick }
		></span>
	);
}

Dot.propTypes = {
	onClick: PropTypes.func.isRequired,
};