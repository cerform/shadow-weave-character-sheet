
import { CharacterSpell } from '@/types/character';

/**
 * Проверяет, является ли значение строкой
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Проверяет, является ли значение массивом строк
 */
export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

/**
 * Безопасно объединяет строки или массивы строк через разделитель
 */
export const safeJoin = (value: string[] | string | undefined, separator: string = ', '): string => {
  if (!value) return '';
  
  if (isStringArray(value)) {
    return value.join(separator);
  }
  
  if (isString(value)) {
    return value;
  }
  
  return '';
};

/**
 * Функция для работы с заклинаниями в разных форматах
 */
export const getSpellName = (spell: string | CharacterSpell): string => {
  if (typeof spell === 'string') {
    return spell;
  }
  return spell.name;
};

/**
 * Преобразовывает строку в CharacterSpell
 */
export const stringToSpell = (spellName: string): CharacterSpell => {
  return {
    name: spellName,
    level: 0,
    description: '',
    school: ''
  };
};

/**
 * Проверяет, является ли значение объектом CharacterSpell
 */
export const isCharacterSpell = (spell: string | CharacterSpell): spell is CharacterSpell => {
  return typeof spell === 'object' && spell !== null && 'name' in spell;
};

/**
 * Конвертирует массив строк в массив CharacterSpell
 */
export const convertStringsToSpells = (spells: (string | CharacterSpell)[]): CharacterSpell[] => {
  return spells.map(spell => isString(spell) ? stringToSpell(spell) : spell);
};

/**
 * Конвертирует массив CharacterSpell в массив строк (имён заклинаний)
 */
export const extractSpellNames = (spells: CharacterSpell[]): string[] => {
  return spells.map(spell => spell.name);
};

/**
 * Извлекает уникальные классы из списка заклинаний
 */
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (isStringArray(spell.classes)) {
      spell.classes.forEach(cls => classesSet.add(cls));
    } else if (isString(spell.classes)) {
      classesSet.add(spell.classes);
    }
  });
  
  return Array.from(classesSet).sort();
};

/**
 * Функция форматирования списка классов
 */
export const formatClasses = (classes: string[] | string | undefined): string => {
  return safeJoin(classes);
};

/**
 * Фильтрует заклинания по поисковому запросу
 */
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  if (!searchTerm) return spells;
  const lowerCaseTerm = searchTerm.toLowerCase();
  return spells.filter(spell => getSpellName(spell).toLowerCase().includes(lowerCaseTerm));
};

/**
 * Фильтрует заклинания по уровням
 */
export const filterSpellsByLevel = (spells: CharacterSpell[], levels: number[]): CharacterSpell[] => {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

/**
 * Фильтрует заклинания по школам
 */
export const filterSpellsBySchool = (spells: CharacterSpell[], schools: string[]): CharacterSpell[] => {
  if (!schools.length) return spells;
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

/**
 * Фильтрует заклинания по классам
 */
export const filterSpellsByClass = (spells: CharacterSpell[], classes: string[]): CharacterSpell[] => {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (isStringArray(spell.classes)) {
      return spell.classes.some(cls => classes.includes(cls));
    }
    
    if (isString(spell.classes)) {
      return classes.includes(spell.classes);
    }
    
    return false;
  });
};

/**
 * Преобразует объект CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): any => {
  return {
    ...spell,
    id: spell.id || 0,
    isRitual: spell.ritual || false,
    isConcentration: spell.concentration || false,
    castingTime: spell.castingTime || 'Не указано',
    range: spell.range || 'Не указано',
    components: spell.components || 'Не указано',
    duration: spell.duration || 'Не указано',
    toString: () => spell.name
  };
};
