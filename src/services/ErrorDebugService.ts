import { supabase } from '@/integrations/supabase/client';
import { ErrorLog } from './ErrorLogsService';

export interface ErrorAnalysis {
  analysis: string;
}

export interface AutoFixSuggestion {
  canAutoFix: boolean;
  fixSteps: string[];
  codeChanges: Array<{
    file: string;
    description: string;
    suggestion: string;
  }>;
  prevention: string;
}

export class ErrorDebugService {
  /**
   * Получить AI-анализ ошибки
   */
  static async analyzeError(errorLog: ErrorLog): Promise<string> {
    console.log('🤖 ErrorDebugService: запрос AI-анализа для ошибки', errorLog.id);

    try {
      const { data, error } = await supabase.functions.invoke('debug-error', {
        body: { errorLog },
      });

      if (error) {
        console.error('❌ Ошибка вызова функции debug-error:', error);
        throw error;
      }

      if (!data || !data.analysis) {
        throw new Error('Пустой ответ от AI');
      }

      console.log('✅ AI-анализ получен');
      return data.analysis;
    } catch (error) {
      console.error('❌ Ошибка получения AI-анализа:', error);
      throw error;
    }
  }

  /**
   * Получить автоматическое предложение по исправлению ошибки
   */
  static async getAutoFixSuggestion(errorLogId: string): Promise<AutoFixSuggestion> {
    console.log('🔧 ErrorDebugService: запрос автоисправления для ошибки', errorLogId);

    try {
      const { data, error } = await supabase.functions.invoke('auto-fix-error', {
        body: { errorLogId },
      });

      if (error) {
        console.error('❌ Ошибка вызова функции auto-fix-error:', error);
        throw error;
      }

      if (!data || !data.fix) {
        throw new Error('Пустой ответ от AI');
      }

      console.log('✅ Предложение по исправлению получено');
      return data.fix;
    } catch (error) {
      console.error('❌ Ошибка получения предложения по исправлению:', error);
      throw error;
    }
  }
}
