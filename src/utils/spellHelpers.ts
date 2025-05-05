
import { CharacterSpell } from '@/types/character';

export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell === 'object';
};

export const getSpellName = (spell: CharacterSpell | string): string => {
  if (typeof spell === 'string') return spell;
  return spell.name;
};

export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0; // По умолчанию заговор
  return spell.level;
};

export const getSpellSchool = (spell: CharacterSpell | string): string => {
  if (typeof spell === 'string') return "Неизвестная";
  return spell.school || "Неизвестная";
};

export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return spell.prepared || false;
};

export const toggleSpellPrepared = (spell: CharacterSpell | string): CharacterSpell => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0,
      prepared: true
    };
  }
  
  return {
    ...spell,
    prepared: !spell.prepared
  };
};

export const getSpellsByLevel = (spells: (CharacterSpell | string)[], level: number): (CharacterSpell | string)[] => {
  return spells.filter(spell => {
    if (typeof spell === 'string') {
      return level === 0; // Строковые заклинания считаются заговорами
    }
    return spell.level === level;
  });
};
