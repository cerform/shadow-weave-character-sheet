
import { CharacterSpell } from './character';

// SpellData interface used for the UI components
export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string[] | string; // This is required
  isRitual?: boolean;
  isConcentration?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
  id?: string | number;
  source?: string;
}

// Convert CharacterSpell to SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    isRitual: spell.ritual || false,
    isConcentration: spell.concentration || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false,
    materials: spell.materials,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    id: spell.id,
    source: spell.source
  };
};

// Convert SpellData to CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual || spell.isRitual || false,
    concentration: spell.concentration || spell.isConcentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false,
    materials: spell.materials,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    id: spell.id,
    source: spell.source
  };
};
