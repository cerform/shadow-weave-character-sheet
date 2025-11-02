import { supabase } from '@/integrations/supabase/client';

export type ErrorCategory = 'frontend' | 'backend' | 'database' | 'auth' | 'api' | 'network' | 'other';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLog {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack_trace?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  url?: string | null;
  user_agent?: string | null;
  metadata?: any;
  resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErrorLogFilters {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  resolved?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export class ErrorLogsService {
  /**
   * Получить все логи ошибок с фильтрацией
   */
  static async getErrorLogs(filters?: ErrorLogFilters): Promise<ErrorLog[]> {
    console.log('🔍 ErrorLogsService: получение логов с фильтрами', filters);
    
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Применяем фильтры
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.resolved !== undefined) {
      query = query.eq('resolved', filters.resolved);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters?.search) {
      query = query.ilike('message', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Ошибка получения логов:', error);
      throw error;
    }

    console.log('✅ Получено логов:', data?.length);
    return data || [];
  }

  /**
   * Получить статистику по логам
   */
  static async getErrorStats(): Promise<{
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    resolved: number;
    unresolved: number;
  }> {
    console.log('📊 ErrorLogsService: получение статистики');

    const { data, error } = await supabase
      .from('error_logs')
      .select('category, severity, resolved');

    if (error) {
      console.error('❌ Ошибка получения статистики:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      resolved: 0,
      unresolved: 0,
    };

    data?.forEach(log => {
      // Подсчет по категориям
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Подсчет по серьезности
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Подсчет resolved/unresolved
      if (log.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    console.log('✅ Статистика получена:', stats);
    return stats;
  }

  /**
   * Создать новый лог ошибки
   */
  static async createErrorLog(errorLog: Omit<ErrorLog, 'id' | 'created_at' | 'updated_at' | 'resolved' | 'resolved_by' | 'resolved_at'>): Promise<ErrorLog> {
    console.log('📝 ErrorLogsService: создание лога ошибки', errorLog);

    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('error_logs')
      .insert({
        ...errorLog,
        user_id: user?.user?.id,
        user_email: user?.user?.email,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Ошибка создания лога:', error);
      throw error;
    }

    console.log('✅ Лог создан:', data);
    return data;
  }

  /**
   * Пометить ошибку как resolved
   */
  static async markAsResolved(errorId: string): Promise<void> {
    console.log('✅ ErrorLogsService: помечаем ошибку как resolved', errorId);

    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_by: user?.user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', errorId);

    if (error) {
      console.error('❌ Ошибка обновления лога:', error);
      throw error;
    }

    console.log('✅ Ошибка помечена как resolved');
  }

  /**
   * Удалить лог ошибки
   */
  static async deleteErrorLog(errorId: string): Promise<void> {
    console.log('🗑️ ErrorLogsService: удаление лога', errorId);

    const { error } = await supabase
      .from('error_logs')
      .delete()
      .eq('id', errorId);

    if (error) {
      console.error('❌ Ошибка удаления лога:', error);
      throw error;
    }

    console.log('✅ Лог удален');
  }

  /**
   * Очистить старые логи (старше 90 дней и resolved)
   */
  static async cleanupOldLogs(): Promise<number> {
    console.log('🧹 ErrorLogsService: очистка старых логов');

    const { data, error } = await supabase.rpc('cleanup_old_error_logs');

    if (error) {
      console.error('❌ Ошибка очистки логов:', error);
      throw error;
    }

    console.log('✅ Удалено старых логов:', data);
    return data || 0;
  }

  /**
   * Логировать ошибку фронтенда (работает для всех пользователей, включая неавторизованных)
   */
  static async logFrontendError(
    error: Error,
    severity: ErrorSeverity = 'error',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Получаем пользователя, но не требуем авторизации
      const { data: { user } } = await supabase.auth.getUser();
      
      // Генерируем или получаем session_id для неавторизованных пользователей
      let sessionId = window.sessionStorage.getItem('anonymous_session_id');
      if (!sessionId) {
        sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        window.sessionStorage.setItem('anonymous_session_id', sessionId);
      }

      const { error: insertError } = await supabase
        .from('error_logs')
        .insert({
          category: 'frontend',
          severity,
          message: error.message,
          stack_trace: error.stack || null,
          url: window.location.href,
          user_agent: navigator.userAgent,
          user_id: user?.id || null,
          user_email: user?.email || null,
          metadata: {
            ...metadata,
            sessionId: user?.id || sessionId,
            isAuthenticated: !!user,
            timestamp: new Date().toISOString(),
          },
        });

      if (insertError) {
        console.error('❌ Ошибка логирования:', insertError);
      } else {
        console.log('✅ Ошибка залогирована:', error.message);
      }
    } catch (e) {
      console.error('❌ Не удалось залогировать ошибку:', e);
      // Не выбрасываем ошибку, чтобы не создать бесконечный цикл
    }
  }
}
