
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
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
  prepared?: boolean;
  source?: string;
}

export interface SpellFilter {
  level?: number | number[];
  school?: string | string[];
  class?: string | string[];
  name?: string;
  ritual?: boolean;
  concentration?: boolean;
}

// Функция для преобразования CharacterSpell в SpellData
export function convertCharacterSpellToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id?.toString() || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В, С, М',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    higherLevel: spell.higherLevel || spell.higherLevels,
    prepared: spell.prepared,
    source: spell.source
  };
}

// Функция для преобразования SpellData в CharacterSpell
export function convertSpellDataToCharacterSpell(spellData: SpellData): CharacterSpell {
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
    classes: Array.isArray(spellData.classes) ? spellData.classes : [spellData.classes],
    ritual: spellData.ritual || false,
    concentration: spellData.concentration || false,
    verbal: spellData.verbal,
    somatic: spellData.somatic,
    material: spellData.material,
    materials: spellData.materials,
    higherLevel: spellData.higherLevel || spellData.higherLevels,
    prepared: spellData.prepared,
    source: spellData.source
  };
}
