
import { CharacterSpell } from '@/types/character';
import { spells as allSpells } from '@/data/spells/index';

// Экспортируем spells для обеспечения совместимости с существующим кодом
export const spells = allSpells;

// Получение всех заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  return allSpells.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false
  }));
};

// Получение заклинаний по классу
export const getSpellsByClass = (characterClass: string): CharacterSpell[] => {
  const allSpellsList = getAllSpells();
  return allSpellsList.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.includes(characterClass);
    } else if (typeof spell.classes === 'string') {
      // Разделяем строку с классами по запятым и проверяем наличие нужного класса
      const classArray = spell.classes.split(',').map(c => c.trim());
      return classArray.includes(characterClass);
    }
    
    return false;
  });
};

// Получение заклинаний по уровню
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  const allSpellsList = getAllSpells();
  return allSpellsList.filter(spell => spell.level === level);
};

// Получение деталей заклинания по имени
export const getSpellDetails = (spellName: string): CharacterSpell | null => {
  const allSpellsList = getAllSpells();
  const spell = allSpellsList.find(s => s.name === spellName);
  return spell || null;
};
