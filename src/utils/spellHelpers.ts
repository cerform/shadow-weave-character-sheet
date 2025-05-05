
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export const convertCharacterSpellToSpellData = (spell: string | CharacterSpell): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: spell,
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: '',
      duration: 'Мгновенная',
      description: '',
    };
  }
  
  return {
    ...spell,
    id: spell.id || spell.name,
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

export const getSpellName = (spell: string | CharacterSpell): string => {
  if (typeof spell === 'string') {
    return spell;
  }
  return spell.name || '';
};

export const getSpellLevel = (spell: string | CharacterSpell): number => {
  if (typeof spell === 'string') {
    return 0; // Default level for string-based spells
  }
  return spell.level || 0;
};

export const isSpellPrepared = (spell: string | CharacterSpell): boolean => {
  if (typeof spell === 'string') {
    return false;
  }
  return !!spell.prepared;
};
