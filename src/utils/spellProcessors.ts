
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
