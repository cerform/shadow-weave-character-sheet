
// Добавим обязательное поле prepared во все заклинания
import { CharacterSpell } from '@/types/character';
import { spells as cantripSpells } from './cantrips';
import { level4 } from './level4';
import { level3Spells } from './level3';
import { level4Part2 } from './level4_part2';
import { level4Part3 } from './level4_part3';
import { ensureSpellFields } from './ensureSpellFields';

// Empty arrays for class-specific spells until they're implemented
const clericSpells: CharacterSpell[] = [];
const druidSpells: CharacterSpell[] = [];
const paladinSpells: CharacterSpell[] = [];
const rangerSpells: CharacterSpell[] = [];
const sorcererSpells: CharacterSpell[] = [];
const warlockSpells: CharacterSpell[] = [];
const wizardSpells: CharacterSpell[] = [];

// Collect all spells
export const allSpells = [
  ...cantripSpells,
  ...level4,
  ...level3Spells,
  ...level4Part2,
  ...level4Part3,
  ...clericSpells,
  ...druidSpells,
  ...paladinSpells,
  ...rangerSpells,
  ...sorcererSpells,
  ...warlockSpells,
  ...wizardSpells
];

// Export the cantrips and all spells explicitly
export const spells = ensureSpellFields(allSpells);

// Обновим функции для возврата спеллов с полем prepared
export const getAllSpells = (): CharacterSpell[] => {
  return spells;
};

export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.includes(className);
    } else if (typeof spell.classes === 'string') {
      // Разделяем строку с классами по запятым и проверяем наличие нужного класса
      const classArray = spell.classes.split(',').map(c => c.trim());
      return classArray.includes(className);
    }
    
    return false;
  });
};

// Добавляем явный экспорт для getSpellsByLevel
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};

export const getSpellDetails = (spellName: string): CharacterSpell | null => {
  const spell = spells.find(s => s.name === spellName);
  return spell ? { ...spell } : null;
};

// Export all the class-specific spells
export { 
  cantripSpells,
  level4,
  level3Spells,
  level4Part2,
  level4Part3,
  clericSpells,
  druidSpells,
  paladinSpells,
  rangerSpells,
  sorcererSpells,
  warlockSpells,
  wizardSpells
};
