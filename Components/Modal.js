import { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ModalContext } from '../context/ModalProvider';

export function Modal({ children }){
	const { setShowModal, setModalType } = useContext(ModalContext);
	const elementRef = useRef(null);
	
	if (!elementRef.current) {
		elementRef.current = document.createElement('div');
	}

	useEffect(() => {
		const modalRoot = document.getElementById('modal');

		if (!modalRoot || !elementRef.current) {
			return;
		}
		modalRoot.appendChild(elementRef.current);
		return () => {
			if (elementRef.current) {
				modalRoot.removeChild(elementRef.current);
			}
		};
	}, []);

	function closeModal(){
		setModalType(null);
		setShowModal(false);
	}

	return createPortal(
		<div className="modal-container">
			<div className="modal-header">
				<div className="modal-actions">
					<button
						className="close-modal"
						onClick={ () => closeModal() }
					>
						<i className="fas fa-times"></i>
					</button>
				</div>
			</div>
			{children}
		</div>
	, elementRef.current);
};