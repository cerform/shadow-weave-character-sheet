
// Счетчики для отслеживания различных типов сообщений
const logCounts: Record<string, number> = {};
const initializedCategories = new Set<string>();

interface LoggerOptions {
  maxPerCategory?: number;
  allowDuplicates?: boolean;
}

/**
 * Хук для более оптимизированного логирования, позволяющий 
 * избежать спама повторяющихся сообщений в консоли
 */
export const useConsoleLogger = (defaultOptions: LoggerOptions = {}) => {
  const defaultMaxPerCategory = defaultOptions.maxPerCategory || 3;
  const defaultAllowDuplicates = defaultOptions.allowDuplicates || false;
  
  /**
   * Инициализировать категорию для логирования
   * @param category Название категории
   */
  const initCategory = (category: string) => {
    if (!initializedCategories.has(category)) {
      logCounts[category] = 0;
      initializedCategories.add(category);
    }
  };
  
  /**
   * Логировать информационное сообщение
   */
  const logInfo = (message: string, category: string, options?: LoggerOptions) => {
    const maxPerCategory = options?.maxPerCategory ?? defaultMaxPerCategory;
    const allowDuplicates = options?.allowDuplicates ?? defaultAllowDuplicates;
    
    initCategory(category);
    
    if (allowDuplicates || logCounts[category] < maxPerCategory) {
      console.log(`[${category}]: ${message}`);
      logCounts[category]++;
      return true;
    } else if (logCounts[category] === maxPerCategory) {
      console.log(`[${category}]: Дальнейшие сообщения этой категории будут скрыты`);
      logCounts[category]++;
      return false;
    }
    return false;
  };
  
  /**
   * Логировать предупреждение
   */
  const logWarning = (message: string, category: string, options?: LoggerOptions) => {
    const maxPerCategory = options?.maxPerCategory ?? defaultMaxPerCategory;
    const allowDuplicates = options?.allowDuplicates ?? defaultAllowDuplicates;
    
    initCategory(category);
    
    if (allowDuplicates || logCounts[category] < maxPerCategory) {
      console.warn(`[${category}]: ${message}`);
      logCounts[category]++;
      return true;
    } else if (logCounts[category] === maxPerCategory) {
      console.warn(`[${category}]: Дальнейшие предупреждения этой категории будут скрыты`);
      logCounts[category]++;
      return false;
    }
    return false;
  };
  
  /**
   * Логировать ошибку
   */
  const logError = (message: string, category: string, error?: any, options?: LoggerOptions) => {
    const maxPerCategory = options?.maxPerCategory ?? defaultMaxPerCategory;
    const allowDuplicates = options?.allowDuplicates ?? defaultAllowDuplicates;
    
    initCategory(category);
    
    if (allowDuplicates || logCounts[category] < maxPerCategory) {
      if (error) {
        console.error(`[${category}]: ${message}`, error);
      } else {
        console.error(`[${category}]: ${message}`);
      }
      logCounts[category]++;
      return true;
    } else if (logCounts[category] === maxPerCategory) {
      console.error(`[${category}]: Дальнейшие ошибки этой категории будут скрыты`);
      logCounts[category]++;
      return false;
    }
    return false;
  };
  
  /**
   * Сбросить счетчики для категории
   */
  const resetCategory = (category: string) => {
    if (initializedCategories.has(category)) {
      logCounts[category] = 0;
    }
  };
  
  /**
   * Сбросить все счетчики
   */
  const resetAllCategories = () => {
    initializedCategories.forEach(category => {
      logCounts[category] = 0;
    });
  };
  
  return {
    logInfo,
    logWarning,
    logError,
    resetCategory,
    resetAllCategories
  };
};
