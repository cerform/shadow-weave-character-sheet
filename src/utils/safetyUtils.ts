
/**
 * Безопасно получает значение из вложенных объектов
 * @param obj Исходный объект
 * @param path Путь к свойству через точку
 * @param defaultValue Значение по умолчанию
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined && current !== null ? current as T : defaultValue;
}

/**
 * Проверяет наличие свойства в объекте с поддержкой вложенности
 * @param obj Исходный объект
 * @param path Путь к свойству через точку
 */
export function safePropExists(obj: any, path: string): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    current = current[part];
  }
  
  return current !== undefined && current !== null;
}

/**
 * Безопасное приведение свойств объекта к нужному типу
 * @param obj Исходный объект
 * @param fallback Объект с запасными значениями
 */
export function safeCast<T>(obj: any, fallback: T): T {
  if (!obj) return fallback;
  
  const result = { ...fallback };
  
  for (const key in fallback) {
    if (obj[key] !== undefined && obj[key] !== null) {
      (result as any)[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Проверяет, является ли объект массивом и каждый его элемент соответствует типу
 * @param obj Проверяемый объект
 * @param typeChecker Функция для проверки типа элементов
 */
export function isTypedArray<T>(obj: any, typeChecker: (item: any) => boolean): obj is T[] {
  return Array.isArray(obj) && obj.every(item => typeChecker(item));
}

export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

