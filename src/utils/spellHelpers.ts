
import { CharacterSpell } from '@/types/character';

/**
 * Проверяет, является ли заклинание подготовленным
 * @param spell Объект заклинания или строка с названием
 * @returns true, если заклинание подготовлено
 */
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return spell.prepared === true;
};

/**
 * Получает уровень заклинания
 * @param spell Объект заклинания или строка с названием
 * @returns Уровень заклинания или 0 для кантрипов
 */
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0;
  return spell.level;
};

/**
 * Проверяет, является ли заклинание объектом CharacterSpell
 * @param spell Объект заклинания или строка с названием
 * @returns true, если заклинание - объект
 */
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

/**
 * Возвращает название уровня заклинания по его числовому значению
 * @param level Числовое значение уровня заклинания
 * @returns Строковое представление уровня заклинания на русском языке
 */
export const getSpellLevelName = (level: number): string => {
  switch (level) {
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
    default: return `Уровень ${level}`;
  }
};
