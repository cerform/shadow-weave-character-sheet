
/**
 * Безопасно применяет функцию map к массиву или строке
 * @param arrayOrString Массив или строка для обработки
 * @param callback Функция обработки для каждого элемента
 * @returns Результат применения callback к каждому элементу или массив с одним элементом-строкой
 */
export function safeArrayMap<T, R>(
  arrayOrString: T[] | string | undefined,
  callback: (item: T | string, index: number) => R
): R[] {
  if (!arrayOrString) {
    return [];
  }
  
  if (typeof arrayOrString === 'string') {
    return [callback(arrayOrString, 0)];
  }
  
  if (Array.isArray(arrayOrString)) {
    return arrayOrString.map(callback);
  }
  
  return [];
}

/**
 * Безопасно преобразует строку или массив строк в массив строк
 */
export function ensureStringArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
