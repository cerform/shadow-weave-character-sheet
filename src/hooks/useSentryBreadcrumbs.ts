import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SentryBreadcrumbsService } from '@/services/SentryBreadcrumbsService';

/**
 * Хук для автоматического трекинга навигации через Sentry Breadcrumbs
 */
export function useSentryBreadcrumbs() {
  const location = useLocation();

  useEffect(() => {
    // Трекаем каждое изменение маршрута
    SentryBreadcrumbsService.trackNavigation(
      document.referrer || 'direct',
      location.pathname + location.search
    );
  }, [location]);
}

/**
 * Хук для трекинга пользовательских действий
 */
export function useSentryUserActions() {
  return {
    trackClick: (element: string, details?: Record<string, any>) => {
      SentryBreadcrumbsService.trackUserAction(`Clicked ${element}`, details);
    },
    
    trackFormSubmit: (formName: string, details?: Record<string, any>) => {
      SentryBreadcrumbsService.trackUserAction(`Submitted form: ${formName}`, details);
    },
    
    trackSearch: (query: string, results?: number) => {
      SentryBreadcrumbsService.trackUserAction('Search', { query, results });
    },
    
    trackFilter: (filterName: string, value: any) => {
      SentryBreadcrumbsService.trackUserAction('Filter', { filter: filterName, value });
    },
  };
}
