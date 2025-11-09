import { useEffect } from 'react';
import { ErrorLogsService } from '@/services/ErrorLogsService';
import { SentryService } from '@/services/SentryService';

/**
 * Хук для автоматического логирования глобальных ошибок
 */
export const useErrorLogger = () => {
  useEffect(() => {
    // Обработчик для необработанных ошибок
    const handleError = (event: ErrorEvent) => {
      console.error('🔥 Глобальная ошибка:', event.error);
      
      const error = event.error || new Error(event.message);
      const context = {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error',
      };

      // Отправляем в Sentry
      SentryService.captureError(error, {
        level: 'error',
        tags: { type: 'unhandled_error' },
        extra: context,
      });
      
      // Отправляем в Supabase
      ErrorLogsService.logFrontendError(error, 'error', context).catch(err => {
        console.error('❌ Не удалось залогировать ошибку:', err);
      });
    };

    // Обработчик для необработанных promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔥 Unhandled Promise Rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      const context = {
        type: 'unhandled_rejection',
        promise: event.promise,
      };

      // Отправляем в Sentry
      SentryService.captureError(error, {
        level: 'error',
        tags: { type: 'unhandled_rejection' },
        extra: context,
      });

      // Отправляем в Supabase
      ErrorLogsService.logFrontendError(error, 'error', context).catch(err => {
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
