
/**
 * Форматирует текст заклинания, разбивая его на абзацы
 */
export function formatSpellDescription(description: string | string[]): string[] {
  if (Array.isArray(description)) {
    return description;
  }
  
  // Разбиваем по двойным переносам или по точкам в конце предложений
  return description.split(/\n\n|\. (?=[A-ZА-Я])/).map(p => p.trim()).filter(p => p);
}

/**
 * Преобразует объектное представление компонентов в строку
 */
export function componentsToString({
  verbal = false,
  somatic = false,
  material = false,
  materials = '',
  ritual = false,
  concentration = false
}: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  ritual?: boolean;
  concentration?: boolean;
}): string {
  const components: string[] = [];
  if (verbal) components.push('В');
  if (somatic) components.push('С');
  if (material) components.push(`М${materials ? ` (${materials})` : ''}`);
  
  let result = components.join(', ');
  
  if (ritual) result += ' (ритуал)';
  if (concentration) result += ' (концентрация)';
  
  return result;
}

/**
 * Преобразует строку компонентов в объектное представление
 */
export function parseComponents(componentsStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials: string;
  ritual: boolean;
  concentration: boolean;
} {
  const result = {
    verbal: componentsStr.includes('В'),
    somatic: componentsStr.includes('С'),
    material: componentsStr.includes('М'),
    materials: '',
    ritual: componentsStr.toLowerCase().includes('ритуал'),
    concentration: componentsStr.toLowerCase().includes('концентрация')
  };
  
  // Извлекаем материальные компоненты из скобок
  const materialMatch = componentsStr.match(/М\s*\((.*?)\)/);
  if (materialMatch && materialMatch[1]) {
    result.materials = materialMatch[1];
  }
  
  return result;
}

/**
 * Определяет основную характеристику для заклинаний класса
 */
export function getSpellcastingAbilityForClass(className: string): string {
  switch (className.toLowerCase()) {
    case 'бард':
    case 'чародей':
    case 'колдун':
    case 'паладин':
      return 'ХАР';
    case 'жрец':
    case 'друид':
    case 'следопыт':
      return 'МДР';
    case 'волшебник':
    case 'мистический рыцарь':
    case 'мистический ловкач':
      return 'ИНТ';
    default:
      return '';
  }
}

/**
 * Возвращает сокращение для характеристики
 */
export function getAbilityShortName(abilityName: string): string {
  switch (abilityName.toLowerCase()) {
    case 'сила': return 'СИЛ';
    case 'ловкость': return 'ЛОВ';
    case 'телосложение': return 'ТЕЛ';
    case 'интеллект': return 'ИНТ';
    case 'мудрость': return 'МДР';
    case 'харизма': return 'ХАР';
    default: return abilityName;
  }
}

/**
 * Получает полное название характеристики из сокращения
 */
export function getAbilityFullName(shortName: string): string {
  switch (shortName.toUpperCase()) {
    case 'СИЛ': case 'STR': return 'Сила';
    case 'ЛОВ': case 'DEX': return 'Ловкость';
    case 'ТЕЛ': case 'CON': return 'Телосложение';
    case 'ИНТ': case 'INT': return 'Интеллект';
    case 'МДР': case 'WIS': return 'Мудрость';
    case 'ХАР': case 'CHA': return 'Харизма';
    default: return shortName;
  }
}

/**
 * Рассчитывает доступные заклинания по классу и уровню персонажа
 */
export function calculateAvailableSpellsByClassAndLevel(
  className: string,
  level: number
): { maxLevel: number; cantripsCount: number; knownSpells: number } {
  // Максимальный уровень заклинаний по уровню персонажа
  const spellLevelTable = [
    /* 1 */ 1, /* 2 */ 1, /* 3 */ 2, /* 4 */ 2, /* 5 */ 3,
    /* 6 */ 3, /* 7 */ 4, /* 8 */ 4, /* 9 */ 5, /* 10 */ 5,
    /* 11 */ 6, /* 12 */ 6, /* 13 */ 7, /* 14 */ 7, /* 15 */ 8,
    /* 16 */ 8, /* 17 */ 9, /* 18 */ 9, /* 19 */ 9, /* 20 */ 9
  ];
  
  // Таблица известных заговоров по классу и уровню
  const cantripsKnownTable: Record<string, number[]> = {
    "Бард": [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "Жрец": [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    "Друид": [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "Волшебник": [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    "Чародей": [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    "Колдун": [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "Следопыт": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Паладин": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };
  
  // Таблица известных заклинаний (не для подготовки) по классу и уровню
  const spellsKnownTable: Record<string, number[]> = {
    "Бард": [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    "Следопыт": [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
    "Чародей": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    "Колдун": [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
  };
  
  // Проверка валидности уровня
  const validLevel = Math.max(1, Math.min(level, 20));
  const levelIndex = validLevel - 1;
  
  // Получаем максимальный уровень заклинаний
  const maxLevel = spellLevelTable[levelIndex];
  
  // Получаем количество известных заговоров
  const cantripsCount = cantripsKnownTable[className]?.[levelIndex] || 0;
  
  // Получаем количество известных заклинаний (для классов, которые не готовят заклинания)
  const knownSpells = spellsKnownTable[className]?.[levelIndex] || 0;
  
  return {
    maxLevel,
    cantripsCount,
    knownSpells
  };
}
