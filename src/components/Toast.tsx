import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col space-y-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center space-x-3 min-w-[320px] max-w-[400px] p-5 rounded-2xl shadow-2xl border
                ${toast.type === 'success' ? 'bg-white border-green-100' : 
                  toast.type === 'error' ? 'bg-white border-red-100' : 
                  'bg-white border-blue-100'}
              `}>
                <div className={`p-2 rounded-xl shrink-0 ${
                  toast.type === 'success' ? 'bg-green-50 text-green-600' : 
                  toast.type === 'error' ? 'bg-red-50 text-red-600' : 
                  'bg-blue-50 text-blue-600'
                }`}>
                  {toast.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                  {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
                  {toast.type === 'info' && <Info className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 line-clamp-2">
                    {toast.type === 'success' ? 'Success' : 
                     toast.type === 'error' ? 'Attention' : 
                     'Information'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
