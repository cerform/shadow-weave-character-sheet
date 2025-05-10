
import { CharacterSpell } from './character';

export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevels?: string;
  higherLevel?: string;
  source?: string;
}

// Convert SpellData to CharacterSpell
export const convertSpellDataToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    id: spellData.id,
    name: spellData.name,
    level: spellData.level,
    school: spellData.school,
    castingTime: spellData.castingTime,
    range: spellData.range,
    components: spellData.components,
    duration: spellData.duration,
    description: spellData.description,
    prepared: spellData.prepared || false,
    ritual: spellData.ritual,
    concentration: spellData.concentration,
    verbal: spellData.verbal,
    somatic: spellData.somatic,
    material: spellData.material,
    materials: spellData.materials,
    classes: spellData.classes,
    source: spellData.source
  };
};

// Convert CharacterSpell to SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes,
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    source: spell.source
  };
};
