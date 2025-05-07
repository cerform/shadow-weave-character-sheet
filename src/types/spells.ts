
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id: string | number;
  name: string;
  name_en?: string; // Added to match CharacterSpell
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string[] | string;
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  materials?: string;
}

export interface SpellFilter {
  name?: string;
  level?: number | number[];
  school?: string | string[];
  class?: string | string[];
  ritual?: boolean;
  concentration?: boolean;
}

// Функция для преобразования CharacterSpell в SpellData
export function convertCharacterSpellToSpellData(spell: CharacterSpell | string): SpellData {
  if (typeof spell === 'string') {
    // Возвращаем минимальную структуру, если передана только строка
    return {
      id: spell,
      name: spell,
      level: 0,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      classes: []
    };
  }
  
  return {
    id: spell.id || spell.name,
    name: spell.name,
    name_en: spell.name_en,
    level: spell.level,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    prepared: spell.prepared,
    higherLevel: spell.higherLevel || spell.higherLevels,
    higherLevels: spell.higherLevels || spell.higherLevel,
    materials: spell.materials
  };
}

// Функция для преобразования SpellData в CharacterSpell
export function convertSpellDataToCharacterSpell(spell: SpellData): CharacterSpell {
  return {
    id: spell.id,
    name: spell.name,
    name_en: spell.name_en,
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
    prepared: spell.prepared,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    materials: spell.materials
  };
}
