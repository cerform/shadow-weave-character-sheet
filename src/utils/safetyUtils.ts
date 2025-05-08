
/**
 * Безопасно получает длину оборудования персонажа
 * @param character Персонаж
 * @returns Количество предметов в инвентаре
 */
export const getEquipmentLength = (character: any): number => {
  // Безопасно проверяем наличие массива equipment у персонажа
  if (!character || !character.equipment || !Array.isArray(character.equipment)) {
    return 0;
  }
  return character.equipment.length;
};

/**
 * Безопасно получает имя персонажа
 * @param character Персонаж
 * @returns Имя персонажа или дефолтное значение
 */
export const getSafeName = (character: any): string => {
  if (!character || !character.name) {
    return 'Безымянный персонаж';
  }
  return character.name;
};

/**
 * Безопасно получает расу персонажа
 * @param character Персонаж
 * @returns Раса персонажа или дефолтное значение
 */
export const getSafeRace = (character: any): string => {
  if (!character || !character.race) {
    return 'Неизвестная раса';
  }
  return character.race;
};

/**
 * Безопасно получает класс персонажа
 * @param character Персонаж
 * @returns Класс персонажа или дефолтное значение
 */
export const getSafeClass = (character: any): string => {
  if (!character) {
    return 'Неизвестный класс';
  }
  // Проверяем разные варианты хранения класса
  if (character.className) {
    return character.className;
  }
  if (character.class) {
    return character.class;
  }
  return 'Неизвестный класс';
};

/**
 * Безопасно получает уровень персонажа
 * @param character Персонаж
 * @returns Уровень персонажа или 1 по умолчанию
 */
export const getSafeLevel = (character: any): number => {
  if (!character || !character.level || isNaN(Number(character.level))) {
    return 1;
  }
  return Number(character.level);
};

/**
 * Безопасно получает значение по пути в объекте
 * @param obj Объект
 * @param path Путь к свойству
 * @param defaultValue Значение по умолчанию
 * @returns Значение свойства или значение по умолчанию
 */
export const safeGet = (obj: any, path: string, defaultValue: any = undefined): any => {
  try {
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[part];
    }
    
    return result === undefined ? defaultValue : result;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Проверяет, пуста ли экипировка
 * @param equipment Экипировка или массив предметов
 * @returns true если экипировка пуста, иначе false
 */
export const isEquipmentEmpty = (equipment: any): boolean => {
  if (!equipment) return true;
  
  if (Array.isArray(equipment)) {
    return equipment.length === 0;
  }
  
  if (typeof equipment === 'object') {
    return Object.keys(equipment).length === 0;
  }
  
  return true;
};
