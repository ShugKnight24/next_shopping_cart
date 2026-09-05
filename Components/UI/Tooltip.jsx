import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Tooltip.module.css';

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  offset = 8,
  disabled = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.top + scrollY - tooltipRect.height - offset;
        break;
      case 'bottom':
        x =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.bottom + scrollY + offset;
        break;
      case 'left':
        x = triggerRect.left + scrollX - tooltipRect.width - offset;
        y =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        x = triggerRect.right + scrollX + offset;
        y =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        break;
      default:
        break;
    }

    // Keep tooltip within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;

    // Adjust horizontal position
    if (x < padding) {
      x = padding;
    } else if (x + tooltipRect.width > viewportWidth - padding) {
      x = viewportWidth - tooltipRect.width - padding;
    }

    // Adjust vertical position
    if (y < scrollY + padding) {
      y = scrollY + padding;
    } else if (y + tooltipRect.height > scrollY + viewportHeight - padding) {
      y = scrollY + viewportHeight - tooltipRect.height - padding;
    }

    setCoords({ x, y });
  }, [position, offset]);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  return (
    <>
      <span
        ref={triggerRef}
        className={styles.trigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`${styles.tooltip} ${styles[position]}`}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
        >
          <div className={styles.content}>{content}</div>
          <div className={styles.arrow} />
        </div>
      )}
    </>
  );
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  offset: PropTypes.number,
  disabled: PropTypes.bool,
};

// Simple icon tooltip variant for common use case
export function IconTooltip({ icon, label, ...props }) {
  return (
    <Tooltip content={label} {...props}>
      <span className={styles.iconWrapper} aria-label={label}>
        {icon}
      </span>
    </Tooltip>
  );
}

IconTooltip.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
};
