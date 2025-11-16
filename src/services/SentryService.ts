import * as Sentry from '@sentry/react';
import React from 'react';

/**
 * Сервис для интеграции с Sentry
 */
export class SentryService {
  private static initialized = false;

  /**
   * Инициализация Sentry
   */
  static init() {
    if (this.initialized) return;

    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!sentryDsn) {
      console.warn('⚠️ VITE_SENTRY_DSN не настроен. Sentry не будет активирован.');
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION || 'development',
        
        integrations: [
          // Трейсинг производительности
          Sentry.browserTracingIntegration(),
          
          // Session Replay с расширенными настройками
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
            maskAllInputs: true, // Маскируем input поля для безопасности
            // Сохраняем больше информации при ошибках
            networkDetailAllowUrls: [window.location.origin],
          }),
          
          // Автоматические breadcrumbs для DOM событий
          Sentry.breadcrumbsIntegration({
            console: true,
            dom: true,
            fetch: true,
            history: true,
            sentry: true,
            xhr: true,
          }),
        ],
        
        // Трейсинг
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        
        // Propagation targets для трейсинга
        tracePropagationTargets: [
          'localhost',
          /^\//,
          /^https:\/\/[^/]*\.lovableproject\.com/,
        ],
        
        // Session Replay
        replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0, // Всегда записываем при ошибках
        
        // Игнорируем известные не критичные ошибки
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'Network request failed',
          /Loading chunk \d+ failed/,
        ],
        
        // Обработка перед отправкой
        beforeSend(event, hint) {
          // Группировка по severity
          if (event.exception?.values?.[0]) {
            const error = event.exception.values[0];
            
            // Устанавливаем уровень серьезности на основе типа ошибки
            if (error.type?.includes('TypeError') || error.type?.includes('ReferenceError')) {
              event.level = 'error';
            } else if (error.type?.includes('NetworkError')) {
              event.level = 'warning';
            }
          }
          
          // Добавляем дополнительный контекст
          event.contexts = {
            ...event.contexts,
            app: {
              version: import.meta.env.VITE_APP_VERSION || 'development',
              build_time: import.meta.env.VITE_BUILD_TIME,
            },
            browser: {
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              online: navigator.onLine,
            },
          };
          
          return event;
        },
        
        // Сэмплинг breadcrumbs
        beforeBreadcrumb(breadcrumb, hint) {
          // Фильтруем слишком частые breadcrumbs
          if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
            return null; // Игнорируем обычные console.log
          }
          
          return breadcrumb;
        },
      });

      this.initialized = true;
      console.log('✅ Sentry инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Sentry:', error);
    }
  }

  /**
   * Захват ошибки
   */
  static captureError(
    error: Error,
    context?: {
      level?: Sentry.SeverityLevel;
      tags?: Record<string, string>;
      extra?: Record<string, any>;
      user?: {
        id?: string;
        email?: string;
        username?: string;
      };
    }
  ) {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      if (context?.level) {
        scope.setLevel(context.level);
      }
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      if (context?.user) {
        scope.setUser(context.user);
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Захват сообщения
   */
  static captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, any>;
    }
  ) {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureMessage(message, level);
    });
  }

  /**
   * Установка пользователя
   */
  static setUser(user: {
    id?: string;
    email?: string;
    username?: string;
  } | null) {
    if (!this.initialized) return;
    Sentry.setUser(user);
  }

  /**
   * Добавление breadcrumb
   */
  static addBreadcrumb(breadcrumb: {
    message: string;
    level?: Sentry.SeverityLevel;
    category?: string;
    data?: Record<string, any>;
  }) {
    if (!this.initialized) return;
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Проверка, инициализирован ли Sentry
   */
  static isInitialized() {
    return this.initialized;
  }
}
