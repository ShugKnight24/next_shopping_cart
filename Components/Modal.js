import { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ModalContext } from '../context/ModalProvider';
import PropTypes from 'prop-types';
import { CloseIcon } from './Icons';

import styles from './Modal.module.css';

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
		<div className={styles.modalContainer}>
			<div className={styles.modalHeader}>
				<div className={styles.modalActions}>
					<button
						className={styles.closeModal}
						onClick={ () => closeModal() }
						aria-label="Close modal"
					>
						<CloseIcon size={16} />
					</button>
				</div>
			</div>
			{children}
		</div>
	, elementRef.current);
};

Modal.propTypes = {
	children: PropTypes.element.isRequired
};