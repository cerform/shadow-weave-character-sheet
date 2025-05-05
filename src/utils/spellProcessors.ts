
/**
 * Обрабатывает строку с компонентами заклинания
 */
export const parseComponents = (componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} => {
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р')
  };
};

/**
 * Конвертирует объект компонентов в строку
 */
export const componentsToString = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}): string => {
  let result = '';
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  if (components.ritual) result += 'Р';
  if (components.concentration) result += 'К';
  return result;
};

/**
 * Преобразует уровень заклинания в текстовое описание
 */
export const spellLevelToText = (level: number): string => {
  switch(level) {
    case 0: return 'Заговор';
    case 1: return '1-й уровень';
    case 2: return '2-й уровень';
    case 3: return '3-й уровень';
    case 4: return '4-й уровень';
    case 5: return '5-й уровень';
    case 6: return '6-й уровень';
    case 7: return '7-й уровень';
    case 8: return '8-й уровень';
    case 9: return '9-й уровень';
    default: return `${level}-й уровень`;
  }
};

/**
 * Преобразует название школы магии в иконку или цветовой код
 */
export const getSchoolIcon = (school: string): string => {
  switch(school.toLowerCase()) {
    case 'вызов': return '🔥';
    case 'очарование': return '💞';
    case 'прорицание': return '🔮';
    case 'иллюзия': return '✨';
    case 'некромантия': return '💀';
    case 'ограждение': return '🛡️';
    case 'преобразование': return '🧙‍♂️';
    case 'воплощение': return '⚡';
    default: return '📚';
  }
};

/**
 * Возвращает цвет для школы магии
 */
export const getSchoolColor = (school: string): string => {
  switch(school.toLowerCase()) {
    case 'вызов': return '#ff7043';
    case 'очарование': return '#ec407a';
    case 'прорицание': return '#7e57c2';
    case 'иллюзия': return '#26c6da';
    case 'некромантия': return '#546e7a';
    case 'ограждение': return '#66bb6a';
    case 'преобразование': return '#ffca28';
    case 'воплощение': return '#42a5f5';
    default: return '#9e9e9e';
  }
};
