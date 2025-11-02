import { supabase } from '@/integrations/supabase/client';
import { ErrorLog } from './ErrorLogsService';

export interface ErrorAnalysis {
  analysis: string;
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
}
