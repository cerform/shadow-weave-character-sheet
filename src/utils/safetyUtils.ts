
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

/**
 * Преобразует значение в массив, если оно не является массивом
 * @param value Значение для преобразования
 * @returns Массив значений
 */
export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Получает длину оборудования персонажа с учетом различных форматов хранения
 * @param equipment Оборудование персонажа
 * @returns Количество предметов оборудования
 */
export function getEquipmentLength(equipment: any): number {
  if (!equipment) return 0;
  
  if (Array.isArray(equipment)) {
    return equipment.length;
  }
  
  if (typeof equipment === 'object') {
    let count = 0;
    
    // Подсчет для разных категорий оборудования
    if (Array.isArray(equipment.weapons)) count += equipment.weapons.length;
    if (Array.isArray(equipment.tools)) count += equipment.tools.length;
    if (Array.isArray(equipment.languages)) count += equipment.languages.length;
    if (Array.isArray(equipment.items)) count += equipment.items.length;
    if (equipment.armor) count += 1;
    
    return count;
  }
  
  return 0;
}
