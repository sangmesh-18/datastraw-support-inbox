import { useState, useCallback, useMemo } from 'react';
import { ToastContext } from './toast-context';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg, duration) => addToast('success', msg, duration),
      error: (msg, duration) => addToast('error', msg, duration),
      info: (msg, duration) => addToast('info', msg, duration),
      warning: (msg, duration) => addToast('warning', msg, duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast-item toast-${item.type}`}
            role="alert"
          >
            <div className="toast-icon">
              {item.type === 'success' && <CheckCircle2 size={18} />}
              {item.type === 'error' && <AlertCircle size={18} />}
              {item.type === 'warning' && <AlertTriangle size={18} />}
              {item.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-content">{item.message}</div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
