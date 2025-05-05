
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  prepared?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
}

export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    prepared: spell.prepared ?? false
  };
};

export const convertToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared ?? false,
    castingTime: spellData.castingTime || '1 действие',
    range: spellData.range || 'На себя',
    components: spellData.components || '',
    duration: spellData.duration || 'Мгновенная',
    description: spellData.description || 'Нет описания'
  } as CharacterSpell;
};
