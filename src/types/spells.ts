
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
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  higherLevels?: string;
  source: string;
  prepared?: boolean;
}

export interface SpellFilters {
  name: string;
  schools: string[];
  levels: number[];
  classes: string[];
  ritual: boolean | null;
  concentration: boolean | null;
}

export function convertCharacterSpellToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id ? String(spell.id) : `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    materials: spell.materials || '',
    source: spell.source || "Player's Handbook",
    higherLevels: spell.higherLevel || spell.higherLevels || '',
    prepared: spell.prepared
  };
}
