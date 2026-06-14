import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      remove(id);
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Container des toasts */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto"
            >
              <ToastItem toast={t} onClose={() => remove(t.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/95',
          border: 'border-emerald-200 dark:border-emerald-900/50',
          text: 'text-emerald-800 dark:text-emerald-300',
          iconColor: 'text-emerald-500',
          Icon: CheckCircle,
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/95',
          border: 'border-red-200 dark:border-red-900/50',
          text: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-500',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/95',
          border: 'border-amber-200 dark:border-amber-900/50',
          text: 'text-amber-800 dark:text-amber-300',
          iconColor: 'text-amber-500',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/95',
          border: 'border-blue-200 dark:border-blue-900/50',
          text: 'text-blue-800 dark:text-blue-300',
          iconColor: 'text-blue-500',
          Icon: Info,
        };
    }
  };

  const s = getStyles();
  const Icon = s.Icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-premium border ${s.bg} ${s.border} ${s.text} shadow-xl backdrop-blur-md`}>
      <Icon size={20} className={`${s.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 text-sm font-semibold leading-relaxed">
        {toast.message}
      </div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors shrink-0 mt-0.5 cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé au sein d\'un ToastProvider');
  }
  return context;
};
