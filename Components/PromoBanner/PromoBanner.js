import { useEffect, useState } from 'react';
import styles from './PromoBanner.module.scss';

export default function PromoBanner({
  message = 'Get 15% off your first order!',
  code = 'FIRST15',
  showCountdown = true,
  expiryHours = 24,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: expiryHours,
    minutes: 0,
    seconds: 0,
  });
  const [isCopied, setIsCopied] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds =
          prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      console.error('Failed to copy code');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.promoBanner}>
      {/* Animated background elements */}
      <div className={styles.backgroundEffects}>
        <div className={styles.shimmer} />
        <div className={styles.sparkle} />
        <div className={styles.sparkle} style={{ animationDelay: '0.5s' }} />
        <div className={styles.sparkle} style={{ animationDelay: '1s' }} />
      </div>

      <div className={styles.content}>
        {/* Left: Decorative icon */}
        <div className={styles.leftIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={styles.giftIcon}
          >
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>

        {/* Center: Main message */}
        <div className={styles.messageContainer}>
          <span className={styles.message}>{message}</span>

          {/* Promo code button */}
          <button
            className={`${styles.codeButton} ${isCopied ? styles.copied : ''}`}
            onClick={handleCopyCode}
            aria-label={`Copy promo code ${code}`}
          >
            <span className={styles.codeLabel}>Use code:</span>
            <span className={styles.codeValue}>{code}</span>
            <span className={styles.copyIcon}>
              {isCopied ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
          </button>

          {/* Countdown timer */}
          {showCountdown && (
            <div className={styles.countdown}>
              <span className={styles.countdownLabel}>Ends in:</span>
              <div className={styles.timerBlocks}>
                <div className={styles.timerBlock}>
                  <span className={styles.timerValue}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className={styles.timerUnit}>hrs</span>
                </div>
                <span className={styles.timerSeparator}>:</span>
                <div className={styles.timerBlock}>
                  <span className={styles.timerValue}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className={styles.timerUnit}>min</span>
                </div>
                <span className={styles.timerSeparator}>:</span>
                <div className={styles.timerBlock}>
                  <span className={styles.timerValue}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className={styles.timerUnit}>sec</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Close button */}
        <button
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
          aria-label="Close promotion banner"
        >
          <span className={styles.closeX}>×</span>
        </button>
      </div>
    </div>
  );
}
