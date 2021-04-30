import { createContext, useState } from 'react';

export const ModalContext = createContext();

export function ModalProvider({ children }){
	const [showModal, setShowModal] = useState(false);

	return(
		<ModalContext.Provider value={{ showModal, setShowModal }}>
			{ children }
			<div id="modal"></div>
		</ModalContext.Provider>
	);
}