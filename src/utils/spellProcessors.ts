/**
 * Обрабатывает строку с компонентами заклинания
 */
export const parseComponents = (componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р'),
    concentration: componentString.includes('К')
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

/**
 * Расчитывает количество доступных заклинаний по классу и уровню персонажа
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilities?: {
    wisdom?: number;
    charisma?: number;
    intelligence?: number;
  }
): { cantrips: number; spells: number } => {
  // Базовые значения
  let cantrips = 0;
  let spells = 0;
  
  // Получаем модификаторы характеристик
  const intMod = abilities?.intelligence ? Math.floor((abilities.intelligence - 10) / 2) : 0;
  const wisMod = abilities?.wisdom ? Math.floor((abilities.wisdom - 10) / 2) : 0;
  const chaMod = abilities?.charisma ? Math.floor((abilities.charisma - 10) / 2) : 0;
  
  // Определяем доступные заклинания в зависимости от класса
  switch (characterClass) {
    case 'Бард':
      // Заговоры: 2 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Известные заклинания по таблице барда
      spells = level + 3;
      break;
      
    case 'Жрец':
      // Заговоры: 3 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 3 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Подготовленные заклинания: уровень + модификатор мудрости
      spells = level + Math.max(1, wisMod);
      break;
      
    case 'Друид':
      // Заговоры: 2 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Подготовленные заклинания: уровень + модификатор мудрости
      spells = level + Math.max(1, wisMod);
      break;
      
    case 'Колдун':
    case 'Чернокнижник':
      // Заговоры: 2 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Известные заклинания по таблице колдуна
      if (level === 1) spells = 2;
      else if (level <= 3) spells = 3 + (level - 2);
      else if (level <= 9) spells = 4 + Math.floor((level - 3) / 2);
      else spells = 10 + Math.floor((level - 9) / 2);
      break;
      
    case 'Волшебник':
      // Заговоры: 3 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 3 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Минимум 2 заклинания на уровень в книгу + интеллект при подготовке
      spells = level + Math.max(1, intMod);
      break;
      
    case 'Паладин':
      cantrips = 0; // У паладинов нет заговоров
      // Подготовленные заклинания: 1/2 уровня + модификатор харизмы
      spells = Math.floor(level / 2) + Math.max(1, chaMod);
      break;
      
    case 'Следопыт':
      cantrips = 0; // У следопытов нет заговоров
      // Известные заклинания по таблице следопыта
      if (level >= 2) spells = 2 + Math.floor((level - 2) / 2);
      else spells = 0;
      break;
      
    case 'Чародей':
      // Заговоры: 4 на 1 уровне, +1 на 4, 10 уровнях
      cantrips = 4 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      // Известные заклинания по таблице чародея
      if (level === 1) spells = 2;
      else if (level === 2) spells = 3;
      else if (level === 3) spells = 4;
      else spells = 4 + Math.floor((level - 3) / 2);
      break;
      
    default:
      // Для других классов или при отсутствии класса
      cantrips = 0;
      spells = 0;
  }
  
  return { cantrips, spells };
};
