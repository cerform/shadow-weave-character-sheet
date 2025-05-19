
import { CharacterSpell } from '@/types/character';

export interface SpellData {
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
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevels?: string; // Используем higherLevels вместо higherLevel
}

// Конвертер из CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  // Преобразуем higherLevel в higherLevels для совместимости
  let higherLevels = spell.higherLevels || spell.higherLevel;
  
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    source: spell.source,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: spell.prepared,
    higherLevels
  };
};

// Конвертер из SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    source: spell.source,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: spell.prepared,
    higherLevels: spell.higherLevels
  };
};

// Функция конвертации массива
export const convertSpellArray = (spells: SpellData[] | CharacterSpell[]): CharacterSpell[] => {
  return spells.map(spell => {
    // Проверяем, является ли spell уже CharacterSpell
    if ('higherLevels' in spell || 'higherLevel' in spell) {
      return spell as CharacterSpell;
    }
    return convertSpellDataToCharacterSpell(spell as SpellData);
  });
};

// Функция создания пустого заклинания
export const createEmptySpell = (): SpellData => {
  return {
    name: '',
    level: 0,
    school: '',
    castingTime: '',
    range: '',
    components: '',
    duration: '',
    description: '',
    classes: [],
    ritual: false,
    concentration: false,
    verbal: false,
    somatic: false,
    material: false
  };
};
