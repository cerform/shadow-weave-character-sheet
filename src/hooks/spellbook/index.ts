
import { useState, useEffect } from 'react';
import { CharacterSpell, SpellData } from '@/types/character';
import { getSpellsByClass, getAllSpells } from '@/data/spells';

// Адаптер для преобразования CharacterSpell в SpellData
const adaptToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    prepared: spell.prepared || false,
  };
};

// Адаптер для преобразования SpellData обратно в CharacterSpell
const adaptToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared || false
  };
};

export function useSpellbook(characterClass?: string) {
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  
  useEffect(() => {
    if (characterClass) {
      const classSpells = getSpellsByClass(characterClass);
      setSpells(classSpells.map(spell => ({...spell, prepared: false})));
    } else {
      const allSpells = getAllSpells();
      setSpells(allSpells.map(spell => ({...spell, prepared: false})));
    }
  }, [characterClass]);

  const getSpellsByLevel = (level: number): CharacterSpell[] => {
    return spells.filter(spell => spell.level === level);
  };

  const getCantrips = (): CharacterSpell[] => {
    return getSpellsByLevel(0);
  };

  return {
    spells,
    getSpellsByLevel,
    getCantrips,
    adaptToSpellData,
    adaptToCharacterSpell
  };
}

export { adaptToSpellData, adaptToCharacterSpell };
