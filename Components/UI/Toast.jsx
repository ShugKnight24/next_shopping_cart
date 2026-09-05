import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useState } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ message, type = 'info', duration = 4000, action }) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, message, type, action }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'success', ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'error', ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'info', ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'warning', ...options });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.toastContainer}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ message, type, action, onClose }) {
  const icons = {
    success: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
        <polyline
          points="22 4 12 14.01 9 11.01"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    error: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
        <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
      </svg>
    ),
    warning: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
      </svg>
    ),
    info: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" />
        <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      {action && (
        <button className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className={styles.close} onClick={onClose} aria-label="Dismiss">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  // Simple showToast helper for common use cases
  const showToast = (message, type = 'info', options = {}) => {
    return context.addToast({ message, type, ...options });
  };

  return { ...context, showToast };
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};
