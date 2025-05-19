
import { CharacterSpell } from './character';

export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  materials?: string;
  higherLevels?: string;
  source?: string;
}

// Функция для преобразования CharacterSpell в SpellData
export function convertCharacterSpellToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id || spell.name.toLowerCase().replace(/\s/g, '-'),
    name: spell.name,
    level: spell.level,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: Array.isArray(spell.description) 
      ? spell.description.join('\n') 
      : (spell.description || ''),
    classes: Array.isArray(spell.classes) 
      ? spell.classes 
      : (spell.classes ? [spell.classes] : []),
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false,
    materials: spell.materials || '',
    higherLevels: spell.higherLevel || spell.higherLevels || '',
    source: spell.source || 'PHB'
  };
}

// Функция для преобразования SpellData в CharacterSpell
export function convertSpellDataToCharacterSpell(spell: SpellData): CharacterSpell {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: typeof spell.description === 'string'
      ? spell.description
      : Array.isArray(spell.description) 
        ? spell.description.join('\n') 
        : '',
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    prepared: spell.prepared,
    materials: spell.materials,
    higherLevel: spell.higherLevels
  };
}

// Функция для преобразования массива заклинаний из CharacterSpell в SpellData
export function convertSpellArray(spells: CharacterSpell[]): SpellData[] {
  return spells.map(convertCharacterSpellToSpellData);
}
