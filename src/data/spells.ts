
// Этот файл теперь просто реэкспортирует из организованного модуля
import { spells } from './spells/index';
export * from './spells/index';

// Для совместимости с существующим кодом
export const getSpellDetails = (spellName: string) => {
  // Используем импортированный массив заклинаний
  return spells.find((spell) => spell.name === spellName) || null;
};

// Добавляем функцию getAllSpells для SpellPanel
export const getAllSpells = () => {
  return spells;
};
