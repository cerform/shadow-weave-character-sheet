
// Конвертирует компоненты заклинания в строку
export function componentsToString({
  verbal = false,
  somatic = false,
  material = false,
  ritual = false,
  concentration = false
}: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}): string {
  const components = [];
  
  if (verbal) components.push('В');
  if (somatic) components.push('С');
  if (material) components.push('М');
  
  let result = components.join(', ');
  
  if (ritual) result += ' (ритуал)';
  if (concentration) result += ' (концентрация)';
  
  return result;
}

// Парсит компоненты заклинания из строки
export function parseComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} {
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р') || componentString.includes('ритуал'),
    concentration: componentString.includes('К') || componentString.includes('концентрация')
  };
}

// Получает имя заклинания на выбранном языке
export function getSpellName(spell: any, language = 'ru'): string {
  if (!spell) return '';
  
  if (language === 'en' && spell.name_en) {
    return spell.name_en;
  }
  
  return spell.name;
}

// Форматирует школу магии для отображения
export function formatSchool(school: string): string {
  const schoolMap: Record<string, string> = {
    'abjuration': 'Ограждение',
    'conjuration': 'Вызов',
    'divination': 'Прорицание',
    'enchantment': 'Очарование',
    'evocation': 'Воплощение',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'transmutation': 'Преобразование',
    'universal': 'Универсальная'
  };
  
  return schoolMap[school.toLowerCase()] || school;
}

// Форматирует уровень заклинания
export function formatSpellLevel(level: number): string {
  if (level === 0) return 'Заговор';
  return `${level} уровень`;
}

// Форматирует компоненты заклинания
export function formatComponents(components: string): string {
  if (!components) return '';
  
  return components.replace(/В/g, 'Вербальный')
                 .replace(/С/g, 'Соматический')
                 .replace(/М/g, 'Материальный');
}
