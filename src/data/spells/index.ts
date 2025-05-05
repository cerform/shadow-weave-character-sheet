
// Добавим обязательное поле prepared во все заклинания
import { CharacterSpell } from '@/types/character';
import { spells as cantripSpells } from './cantrips';

// Empty arrays for class-specific spells until they're implemented
const clericSpells: CharacterSpell[] = [];
const druidSpells: CharacterSpell[] = [];
const paladinSpells: CharacterSpell[] = [];
const rangerSpells: CharacterSpell[] = [];
const sorcererSpells: CharacterSpell[] = [];
const warlockSpells: CharacterSpell[] = [];
const wizardSpells: CharacterSpell[] = [];

// Export the cantrips properly
export const spells = cantripSpells;

// Ensure all spells have the required 'prepared' field
const ensureSpellsHavePreparedField = (spellList: CharacterSpell[]): CharacterSpell[] => {
  return spellList.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false
  }));
};

// Обновим функции для возврата спеллов с полем prepared
export const getAllSpells = (): CharacterSpell[] => {
  return ensureSpellsHavePreparedField([
    ...spells,
    ...clericSpells,
    ...druidSpells,
    ...paladinSpells,
    ...rangerSpells,
    ...sorcererSpells,
    ...warlockSpells,
    ...wizardSpells
  ]);
};

export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return ensureSpellsHavePreparedField(
    getAllSpells().filter(spell => 
      Array.isArray(spell.classes) 
        ? spell.classes.includes(className) 
        : spell.classes === className
    )
  );
};

export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return ensureSpellsHavePreparedField(
    getAllSpells().filter(spell => spell.level === level)
  );
};

export const getSpellDetails = (spellName: string): CharacterSpell | null => {
  const spell = getAllSpells().find(s => s.name === spellName);
  return spell ? { ...spell, prepared: spell.prepared || false } : null;
};

// Export all the class-specific spells
export { 
  clericSpells,
  druidSpells,
  paladinSpells,
  rangerSpells,
  sorcererSpells,
  warlockSpells,
  wizardSpells
};
