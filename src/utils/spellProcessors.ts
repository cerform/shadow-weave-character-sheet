
import { CharacterSpell } from '@/types/character';

/**
 * Преобразует компоненты заклинания в строковое представление
 */
export function componentsToString(components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}): string {
  const parts: string[] = [];
  
  if (components.verbal) parts.push('В');
  if (components.somatic) parts.push('С');
  if (components.material) parts.push('М');
  
  let result = parts.join(', ');
  
  if (components.ritual) result += ' (ритуал)';
  if (components.concentration) result += ' (концентрация)';
  
  return result;
}

/**
 * Преобразует строковое представление компонентов в объект
 */
export function parseComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} {
  const components = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false,
    concentration: false
  };
  
  // Улучшенное распознавание компонентов с учетом регистра
  if (!componentString) return components;
  
  const upperStr = componentString.toUpperCase();
  
  components.verbal = upperStr.includes('В') || upperStr.includes('V');
  components.somatic = upperStr.includes('С') || upperStr.includes('S');
  components.material = upperStr.includes('М') || upperStr.includes('M');
  components.ritual = componentString.includes('Р') || componentString.includes('р') || 
                     componentString.includes('R') || componentString.includes('r');
  components.concentration = componentString.includes('К') || componentString.includes('к') || 
                           componentString.includes('C') || componentString.includes('c');
  
  return components;
}

/**
 * Возвращает название школы магии на русском языке
 */
export function getSpellSchoolName(school: string): string {
  const schools: Record<string, string> = {
    'abjuration': 'Ограждение',
    'conjuration': 'Вызов',
    'divination': 'Прорицание',
    'enchantment': 'Очарование', 
    'evocation': 'Воплощение',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'transmutation': 'Преобразование'
  };
  
  return schools[school.toLowerCase()] || school;
}

/**
 * Возвращает название класса на русском языке
 */
export function getSpellClassName(className: string): string {
  const classes: Record<string, string> = {
    'bard': 'Бард',
    'cleric': 'Жрец',
    'druid': 'Друид',
    'paladin': 'Паладин',
    'ranger': 'Следопыт',
    'sorcerer': 'Чародей',
    'warlock': 'Колдун',
    'wizard': 'Волшебник'
  };
  
  return classes[className.toLowerCase()] || className;
}

/**
 * Получает строковое представление уровня заклинания
 */
export function getSpellLevelString(level: number): string {
  if (level === 0) return 'Заговор';
  return `${level} уровень`;
}

/**
 * Обрабатывает текст описания заклинания
 */
export function processSpellDescription(description: string | string[]): string {
  if (Array.isArray(description)) {
    return description.join('\n\n');
  }
  return description;
}
