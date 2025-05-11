
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
  source?: string;
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
    source: spell.source || ''
  };
}
