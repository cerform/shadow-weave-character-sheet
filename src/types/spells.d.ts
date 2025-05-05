
import { CharacterSpell } from './character';

export interface SpellData {
  id?: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;  // Required in SpellData
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  source?: string;
  isRitual?: boolean;
  isConcentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    school: spell.school || 'Универсальная', // Provide default values for required fields
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    ...spell,
    // Make sure all required CharacterSpell properties are set
    name: spell.name,
    level: spell.level
  };
};

export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
