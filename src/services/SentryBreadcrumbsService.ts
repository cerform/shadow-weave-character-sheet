import { SentryService } from './SentryService';

/**
 * Сервис для автоматического трекинга пользовательских действий через Sentry Breadcrumbs
 */
export class SentryBreadcrumbsService {
  /**
   * Трекинг навигации между страницами
   */
  static trackNavigation(from: string, to: string) {
    SentryService.addBreadcrumb({
      category: 'navigation',
      message: `Navigated from ${from} to ${to}`,
      level: 'info',
      data: { from, to },
    });
  }

  /**
   * Трекинг действий пользователя
   */
  static trackUserAction(action: string, details?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'user.action',
      message: action,
      level: 'info',
      data: details,
    });
  }

  /**
   * Трекинг API запросов
   */
  static trackApiRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number
  ) {
    SentryService.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: status && status >= 400 ? 'error' : 'info',
      data: {
        method,
        url,
        status_code: status,
        duration_ms: duration,
      },
    });
  }

  /**
   * Трекинг изменений в UI
   */
  static trackUIChange(component: string, change: string, data?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'ui.change',
      message: `${component}: ${change}`,
      level: 'info',
      data,
    });
  }

  /**
   * Трекинг ошибок формы
   */
  static trackFormError(formName: string, field: string, error: string) {
    SentryService.addBreadcrumb({
      category: 'form.validation',
      message: `Form error in ${formName}`,
      level: 'warning',
      data: {
        form: formName,
        field,
        error,
      },
    });
  }

  /**
   * Трекинг действий в бою (battle)
   */
  static trackBattleAction(action: string, details?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'game.battle',
      message: `Battle: ${action}`,
      level: 'info',
      data: details,
    });
  }

  /**
   * Трекинг действий с персонажами
   */
  static trackCharacterAction(action: string, characterId: string, details?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'game.character',
      message: `Character action: ${action}`,
      level: 'info',
      data: {
        character_id: characterId,
        ...details,
      },
    });
  }

  /**
   * Трекинг действий в сессии
   */
  static trackSessionAction(action: string, sessionId: string, details?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'game.session',
      message: `Session: ${action}`,
      level: 'info',
      data: {
        session_id: sessionId,
        ...details,
      },
    });
  }

  /**
   * Трекинг производительности
   */
  static trackPerformance(metric: string, value: number, unit: string = 'ms') {
    SentryService.addBreadcrumb({
      category: 'performance',
      message: `${metric}: ${value}${unit}`,
      level: 'info',
      data: {
        metric,
        value,
        unit,
      },
    });
  }

  /**
   * Трекинг критических событий
   */
  static trackCriticalEvent(event: string, details?: Record<string, any>) {
    SentryService.addBreadcrumb({
      category: 'app.critical',
      message: event,
      level: 'error',
      data: details,
    });
  }
}
