
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
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  higher_level?: string;
  source: string;
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  source?: string;
  higher_level?: string;
  higherLevel?: string;
  higherLevels?: string;
}

export interface SpellFilters {
  name: string;
  schools: string[];
  levels: number[];
  classes: string[];
  ritual: boolean | null;
  concentration: boolean | null;
}

// Utility function to convert CharacterSpell to SpellData
export function convertCharacterSpellToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: String(spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`),
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Universal',
    castingTime: spell.castingTime || '1 action',
    range: spell.range || 'Self',
    components: spell.components || '',
    duration: spell.duration || 'Instantaneous',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: Boolean(spell.ritual),
    concentration: Boolean(spell.concentration),
    verbal: Boolean(spell.verbal),
    somatic: Boolean(spell.somatic),
    material: Boolean(spell.material),
    materials: spell.materials || '',
    prepared: Boolean(spell.prepared),
    higherLevel: spell.higherLevel || spell.higherLevels || spell.higher_level || '',
    higherLevels: spell.higherLevels || spell.higherLevel || spell.higher_level || '',
    source: spell.source || 'Custom'
  };
}

// Функция для преобразования данных заклинаний в формат CharacterSpell
export function convertSpellDataToCharacterSpell(spell: SpellData): CharacterSpell {
  return {
    id: spell.id.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: spell.prepared || false,
    source: spell.source,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    higher_level: spell.higher_level
  };
}
