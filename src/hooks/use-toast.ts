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

// Временный заглушка для тостов, заменить на полноценную реализацию
export const useToast = () => {
  const toast = (options: ToastOptions) => {
    console.log('Toast:', options);
  };

  return { toast };
};
