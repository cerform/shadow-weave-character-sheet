
import { CharacterSpell, SpellData } from '@/types/character';

/**
 * Извлекает имена заклинаний из массива заклинаний
 * @param spells Массив заклинаний
 * @returns Массив имен заклинаний
 */
export const extractSpellNames = (spells: CharacterSpell[] | string[]): string[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return spell;
    }
    return spell.name;
  });
};

/**
 * Безопасная версия метода Array.some
 * @param array Массив
 * @param predicate Функция-предикат
 * @returns Результат выполнения метода some
 */
export const safeSome = <T>(array: T[] | undefined, predicate: (item: T) => boolean): boolean => {
  if (!array || !Array.isArray(array)) {
    return false;
  }
  return array.some(predicate);
};

/**
 * Безопасная версия метода Array.filter
 * @param array Массив
 * @param predicate Функция-предикат
 * @returns Отфильтрованный массив
 */
export const safeFilter = <T>(array: T[] | undefined, predicate: (item: T) => boolean): T[] => {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
};
