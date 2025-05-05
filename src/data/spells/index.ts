// Добавим обязательное поле prepared во все заклинания
import { spells } from './cantrips';
import { clericSpells } from './cleric';
import { druidSpells } from './druid';
import { paladinSpells } from './paladin';
import { rangerSpells } from './ranger';
import { sorcererSpells } from './sorcerer';
import { warlockSpells } from './warlock';
import { wizardSpells } from './wizard';

// Ensure all spells have the required 'prepared' field
const ensureSpellsHavePreparedField = (spellList) => {
  return spellList.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false
  }));
};

// Обновим функции для возврата спеллов с полем prepared
export const getAllSpells = () => {
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

export const getSpellsByClass = (className) => {
  return ensureSpellsHavePreparedField(
    getAllSpells().filter(spell => 
      Array.isArray(spell.classes) 
        ? spell.classes.includes(className) 
        : spell.classes === className
    )
  );
};

export const getSpellsByLevel = (level) => {
  return ensureSpellsHavePreparedField(
    getAllSpells().filter(spell => spell.level === level)
  );
};

export const getSpellDetails = (spellName) => {
  const spell = getAllSpells().find(s => s.name === spellName);
  return spell ? { ...spell, prepared: spell.prepared || false } : null;
};

// Экспортируем все заклинания и функции
export { spells };
