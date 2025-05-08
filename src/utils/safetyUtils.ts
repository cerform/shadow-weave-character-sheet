
/**
 * Утилиты для безопасной работы с данными
 */

// Проверяет, является ли значение undefined или null
export const isNullOrUndefined = (value: any): boolean => {
  return value === undefined || value === null;
};

// Безопасно получает значение из объекта, возвращая defaultValue, если путь не существует
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (isNullOrUndefined(result) || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return isNullOrUndefined(result) ? defaultValue : result;
};

// Безопасно возвращает строковое представление значения
export const safeString = (value: any, defaultValue = ''): string => {
  if (isNullOrUndefined(value)) return defaultValue;
  return String(value);
};

// Безопасно возвращает числовое представление значения
export const safeNumber = (value: any, defaultValue = 0): number => {
  if (isNullOrUndefined(value)) return defaultValue;
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Функция для проверки пустого оборудования
export const isEquipmentEmpty = (equipment: any): boolean => {
  if (!equipment) return true;
  if (Array.isArray(equipment)) return equipment.length === 0;
  if (typeof equipment === 'object') {
    const { weapons, armor, items } = equipment as { weapons?: any[], armor?: string, items?: any[] };
    return (!weapons || weapons.length === 0) && 
           (!armor || armor === '') && 
           (!items || items.length === 0);
  }
  return true;
};

// Получение длины экипировки (количество элементов)
export const getEquipmentLength = (equipment: any): number => {
  if (!equipment) return 0;
  
  if (Array.isArray(equipment)) {
    return equipment.length;
  }
  
  if (typeof equipment === 'object') {
    let count = 0;
    const { weapons, armor, items } = equipment as { weapons?: any[], armor?: string, items?: any[] };
    
    if (weapons && Array.isArray(weapons)) {
      count += weapons.length;
    }
    
    if (armor && armor !== '') {
      count += 1;
    }
    
    if (items && Array.isArray(items)) {
      count += items.length;
    }
    
    return count;
  }
  
  return 0;
};
