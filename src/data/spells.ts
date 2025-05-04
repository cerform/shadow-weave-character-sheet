
// Этот файл теперь реэкспортирует из организованного модуля
import { spells, getSpellsByClass, getSpellsByLevel, spellsByLevel, getSpellByName } from './spells/index';
export { spells, getSpellsByClass, getSpellsByLevel, spellsByLevel, getSpellByName };

// Для совместимости с существующим кодом
export const getSpellDetails = (spellName: string) => {
  // Используем импортированный массив заклинаний
  return spells.find((spell) => spell.name === spellName) || null;
};

// Добавляем функцию getAllSpells для SpellPanel
export const getAllSpells = () => {
  return spells;
};
