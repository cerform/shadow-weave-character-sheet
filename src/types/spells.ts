
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  materials?: string;
  source?: string;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id?.toString() || spell.name.toLowerCase().replace(/\s+/g, '-'),
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) 
      ? spell.description.join('\n') 
      : spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    prepared: spell.prepared,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    materials: spell.materials,
    source: spell.source
  };
};
