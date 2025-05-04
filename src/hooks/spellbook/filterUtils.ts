
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
