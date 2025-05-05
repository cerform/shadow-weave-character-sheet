
import { CharacterSpell } from '@/types/character';

/**
 * Преобразует объект CharacterSpell в строку (возвращает имя заклинания)
 * Это нужно для корректного отображения заклинаний в списках
 */
export const characterSpellToString = (spell: CharacterSpell): string => {
  return spell.name;
};

/**
 * Проверяет, является ли объект CharacterSpell или строкой
 * и возвращает имя заклинания в любом случае
 */
export const getSpellName = (spell: CharacterSpell | string): string => {
  if (typeof spell === 'string') {
    return spell;
  }
  return spell.name;
};

/**
 * Преобразует массив заклинаний CharacterSpell в массив строк с именами
 */
export const spellsToNames = (spells: CharacterSpell[]): string[] => {
  return spells.map(spell => spell.name);
};

/**
 * Преобразует массив строк с именами заклинаний в массив объектов CharacterSpell
 * используя функцию поиска для получения полной информации о заклинании
 */
export const namesToSpells = (
  names: string[], 
  findSpell: (name: string) => CharacterSpell | null
): CharacterSpell[] => {
  return names
    .map(name => findSpell(name))
    .filter((spell): spell is CharacterSpell => spell !== null);
};
