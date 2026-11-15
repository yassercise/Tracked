import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import './ui.css';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

type Show = (message: string, action?: ToastAction) => void;

const ToastContext = createContext<Show>(() => {});
export const useToast = () => useContext(ToastContext);

/** Short confirmation at the bottom of the screen. Pass an action (usually Undo) to keep it up longer. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; action?: ToastAction } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<Show>((message, action) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = window.setTimeout(() => setToast(null), action ? 5000 : 1900);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast${toast.action ? ' has-action' : ''}`}
            role="status"
            initial={{ opacity: 0, y: 16, x: '-50%', scale: 0.94 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 10, x: '-50%', scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
          >
            {toast.message}
            {toast.action && (
              <button
                className="toast-action press"
                onClick={() => {
                  toast.action!.onClick();
                  window.clearTimeout(timer.current);
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
