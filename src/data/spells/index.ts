
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

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  if (!className) return [];
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => c.includes(className));
    }
    
    if (typeof spell.classes === 'string') {
      return spell.classes.includes(className);
    }
    
    return false;
  });
};

// Функция получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  return spells.filter(spell => spell.level === level);
};
