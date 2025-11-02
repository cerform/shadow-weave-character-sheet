import { useEffect } from 'react';
import { ErrorLogsService } from '@/services/ErrorLogsService';

/**
 * Хук для автоматического логирования глобальных ошибок
 */
export const useErrorLogger = () => {
  useEffect(() => {
    // Обработчик для необработанных ошибок
    const handleError = (event: ErrorEvent) => {
      console.error('🔥 Глобальная ошибка:', event.error);
      
      ErrorLogsService.logFrontendError(
        event.error || new Error(event.message),
        'error',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'unhandled_error',
        }
      ).catch(err => {
        console.error('❌ Не удалось залогировать ошибку:', err);
      });
    };

    // Обработчик для необработанных promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔥 Unhandled Promise Rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      ErrorLogsService.logFrontendError(
        error,
        'error',
        {
          type: 'unhandled_rejection',
          promise: event.promise,
        }
      ).catch(err => {
        console.error('❌ Не удалось залогировать ошибку:', err);
      });
    };

    // Добавляем обработчики
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Удаляем обработчики при размонтировании
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};
