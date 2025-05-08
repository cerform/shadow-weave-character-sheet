
import { useCallback, useState } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
}

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...options };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    console.log('Toast:', options);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return { toast, dismissToast, toasts };
};

// Экспортируем toast функцию для использования без хука
export const toast = (options: ToastOptions): Toast => {
  const id = Math.random().toString(36).substring(2, 9);
  console.log('Toast:', options);
  return { id, ...options };
};
