import * as Sentry from '@sentry/react';

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
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        // Трейсинг
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        // Игнорируем некоторые ошибки
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],
        beforeSend(event, hint) {
          // Можно добавить дополнительную фильтрацию
          return event;
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
