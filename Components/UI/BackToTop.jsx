import { useEffect, useState } from 'react';
import styles from './BackToTop.module.css';

export function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Calculate the stroke-dashoffset for the circular progress
  // Circle circumference = 2 * PI * radius
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      {/* Circular Progress Indicator */}
      <svg className={styles.progressRing} viewBox="0 0 52 52">
        {/* Background track */}
        <circle
          className={styles.progressTrack}
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          strokeWidth="3"
        />
        {/* Progress arc */}
        <circle
          className={styles.progressBar}
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
      </svg>

      {/* Arrow Icon */}
      <span className={styles.arrowIcon}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </span>

      {/* Tooltip */}
      <span className={styles.tooltip}>
        Back to Top
        <span className={styles.percentage}>{Math.round(scrollProgress)}%</span>
      </span>
    </button>
  );
}
