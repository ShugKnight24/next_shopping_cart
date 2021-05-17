import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const ModalContext = createContext();

export function ModalProvider({ children }){
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState(null);

	return(
		<ModalContext.Provider value={{ showModal, setShowModal, modalType, setModalType }}>
			{ children }
			<div id="modal"></div>
		</ModalContext.Provider>
	);
}


ModalProvider.propTypes = {
	children: PropTypes.element.isRequired
};