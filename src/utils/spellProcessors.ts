
/**
 * Парсит строку компонентов заклинания в объект
 * @param componentStr Строка компонентов (например "ВСМ", "ВС(Р)")
 * @returns Объект с флагами компонентов
 */
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} => {
  const result = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false
  };

  if (!componentStr) return result;
  
  // Проверяем наличие компонентов
  if (componentStr.includes('В')) result.verbal = true;
  if (componentStr.includes('С')) result.somatic = true;
  if (componentStr.includes('М')) result.material = true;
  if (componentStr.includes('Р') || componentStr.includes('(Р)')) result.ritual = true;
  
  return result;
};

/**
 * Форматирует объект компонентов в строку для отображения
 * @param components Объект компонентов
 * @returns Форматированная строка компонентов
 */
export const formatComponents = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
}): string => {
  let result = '';
  
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  
  if (components.ritual) {
    result += ' (Р)';
  }
  
  return result;
};

/**
 * Преобразует объект компонентов в строку с учетом материалов
 * @param components Объект с компонентами заклинания и материалами
 * @returns Форматированная строка компонентов
 */
export const componentsToString = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  materials?: string;
}): string => {
  let result = '';
  
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  
  if (components.materials) {
    result += ` (${components.materials})`;
  }
  
  if (components.ritual) {
    result += ' (Р)';
  }
  
  return result || 'Нет';
};

/**
 * Получает цвет для школы магии
 * @param school Название школы магии
 * @returns Цвет для школы
 */
export const getSpellSchoolColor = (school: string): string => {
  const schoolColors: Record<string, string> = {
    'Преобразование': '#3b82f6', // blue
    'Воплощение': '#ef4444',    // red
    'Вызов': '#f97316',         // orange
    'Прорицание': '#8b5cf6',    // purple
    'Очарование': '#ec4899',    // pink
    'Иллюзия': '#6366f1',       // indigo
    'Некромантия': '#10b981',   // green
    'Ограждение': '#eab308',    // yellow
  };
  
  return schoolColors[school] || '#6b7280'; // gray default
};

/**
 * Форматирует строку продолжительности заклинания
 * @param duration Строка продолжительности
 * @returns Форматированная строка продолжительности
 */
export const formatDuration = (duration?: string): string => {
  if (!duration) return 'Мгновенная';
  return duration;
};

/**
 * Форматирует строку дальности заклинания
 * @param range Строка дальности
 * @returns Форматированная строка дальности
 */
export const formatRange = (range?: string): string => {
  if (!range) return 'На себя';
  return range;
};
