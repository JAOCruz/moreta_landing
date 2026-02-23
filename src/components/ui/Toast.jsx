import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import gsap from 'gsap';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
};

const TOAST_COLORS = {
  success: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', text: '#34d399' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' }
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '380px' }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
  const Icon = TOAST_ICONS[toast.type] || Info;

  useEffect(() => {
    const el = document.getElementById(`toast-${toast.id}`);
    if (el) {
      gsap.fromTo(el, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  }, [toast.id]);

  return (
    <div
      id={`toast-${toast.id}`}
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 backdrop-blur-xl border font-mono-tech text-xs"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span className="flex-1 text-white/90">{toast.message}</span>
      <button onClick={onRemove} className="opacity-40 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // fallback: no-op toast
    return { success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
  }
  return ctx;
};
