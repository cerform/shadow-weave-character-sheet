
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
  
  const lowerStr = componentString.toLowerCase();
  
  // Улучшенное распознавание ритуала и концентрации
  components.ritual = lowerStr.includes('р') || 
                      lowerStr.includes('r') || 
                      lowerStr.includes('ритуал') ||
                      componentString.includes('Р');
  
  components.concentration = lowerStr.includes('к') || 
                            lowerStr.includes('c') || 
                            lowerStr.includes('концентрация') || 
                            lowerStr.includes('concentration') ||
                            componentString.includes('К');
  
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

/**
 * Создает уникальный ключ для заклинания на основе имени и уровня
 */
export function createSpellKey(name: string, level: number): string {
  return `${name.toLowerCase().trim()}-${level}`;
}

/**
 * Проверяет, является ли заклинание дубликатом
 */
export function isDuplicateSpell(spell: CharacterSpell, existingSpells: CharacterSpell[]): boolean {
  const spellKey = createSpellKey(spell.name, spell.level);
  
  return existingSpells.some(existingSpell => 
    createSpellKey(existingSpell.name, existingSpell.level) === spellKey
  );
}

/**
 * Удаляет дубликаты заклинаний из массива
 */
export function removeDuplicateSpells(spells: CharacterSpell[]): CharacterSpell[] {
  const uniqueSpells = new Map<string, CharacterSpell>();
  
  spells.forEach(spell => {
    const key = createSpellKey(spell.name, spell.level);
    // Если заклинание уже существует, сохраняем то, у которого больше информации
    if (!uniqueSpells.has(key) || hasMoreInfo(spell, uniqueSpells.get(key)!)) {
      uniqueSpells.set(key, spell);
    }
  });
  
  return Array.from(uniqueSpells.values());
}

/**
 * Проверяет, содержит ли первое заклинание больше информации, чем второе
 */
function hasMoreInfo(spell1: CharacterSpell, spell2: CharacterSpell): boolean {
  // Подсчитываем количество непустых полей
  const countDefinedProps = (obj: any) => 
    Object.keys(obj).filter(key => 
      obj[key] !== undefined && 
      obj[key] !== null && 
      obj[key] !== '' && 
      !(Array.isArray(obj[key]) && obj[key].length === 0)
    ).length;
    
  return countDefinedProps(spell1) > countDefinedProps(spell2);
}

