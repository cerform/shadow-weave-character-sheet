
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
  };
};

export const isCharacterSpellObject = (spell: string | CharacterSpell): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

export const getSpellLevel = (spell: string | CharacterSpell): number => {
  if (typeof spell === 'string') {
    return 0; // Default level for string-based spells
  }
  return spell.level;
};

export const isSpellPrepared = (spell: string | CharacterSpell): boolean => {
  if (typeof spell === 'string') {
    return false;
  }
  return !!spell.prepared;
};
