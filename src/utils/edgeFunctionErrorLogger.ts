/**
 * Утилита для логирования ошибок из Edge Functions
 * 
 * Пример использования в edge function:
 * 
 * ```typescript
 * import { logBackendError } from '../_shared/errorLogger.ts';
 * 
 * try {
 *   // ... ваш код
 * } catch (error) {
 *   await logBackendError(supabase, error, 'critical', {
 *     function: 'my-edge-function',
 *     additionalContext: 'some data'
 *   });
 *   throw error;
 * }
 * ```
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type ErrorCategory = 'frontend' | 'backend' | 'database' | 'auth' | 'api' | 'network' | 'other';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface LogErrorParams {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stackTrace?: string;
  userId?: string;
  userEmail?: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Логирование ошибки в таблицу error_logs
 */
export async function logError(
  supabase: SupabaseClient,
  params: LogErrorParams
): Promise<void> {
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        category: params.category,
        severity: params.severity,
        message: params.message,
        stack_trace: params.stackTrace,
        user_id: params.userId,
        user_email: params.userEmail,
        url: params.url,
        metadata: params.metadata || {},
      });

    if (error) {
      console.error('❌ Failed to log error to database:', error);
    }
  } catch (err) {
    console.error('❌ Exception while logging error:', err);
  }
}

/**
 * Логирование backend ошибки
 */
export async function logBackendError(
  supabase: SupabaseClient,
  error: Error,
  severity: ErrorSeverity = 'error',
  metadata?: Record<string, any>
): Promise<void> {
  await logError(supabase, {
    category: 'backend',
    severity,
    message: error.message,
    stackTrace: error.stack,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Логирование database ошибки
 */
export async function logDatabaseError(
  supabase: SupabaseClient,
  error: Error,
  severity: ErrorSeverity = 'error',
  metadata?: Record<string, any>
): Promise<void> {
  await logError(supabase, {
    category: 'database',
    severity,
    message: error.message,
    stackTrace: error.stack,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Логирование API ошибки
 */
export async function logApiError(
  supabase: SupabaseClient,
  error: Error,
  severity: ErrorSeverity = 'error',
  metadata?: Record<string, any>
): Promise<void> {
  await logError(supabase, {
    category: 'api',
    severity,
    message: error.message,
    stackTrace: error.stack,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Пример wrapper для edge function с автоматическим логированием ошибок
 */
export function withErrorLogging<T>(
  supabase: SupabaseClient,
  functionName: string,
  handler: () => Promise<T>
): Promise<T> {
  return handler().catch(async (error) => {
    await logBackendError(supabase, error, 'error', {
      function: functionName,
      errorType: error.constructor.name,
    });
    throw error;
  });
}
