import { useState } from 'react';
import styles from './PromoBanner.module.scss';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.promoBanner}>
      <p>Get 20% off your first order! Use code: FIRST20</p>
      <button className={styles.closeButton} onClick={handleClose}>
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
