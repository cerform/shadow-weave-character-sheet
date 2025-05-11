
import { CharacterSpell } from './character';

export interface SpellData {
  id: string;  // id required for SpellData
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
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
  materials?: string;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`, // Ensure id is present
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная', // Provide default values for required fields
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    prepared: spell.prepared
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id, // Ensure id is passed from SpellData to CharacterSpell
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    prepared: spell.prepared
  };
};

export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
