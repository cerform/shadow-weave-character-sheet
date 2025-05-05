
import { CharacterSpell } from './character';

// Интерфейс для данных заклинания
export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  subclasses?: string[];
  ritual?: boolean;
  concentration?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  source?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  id?: string | number;
  name_en?: string;
  // Добавляем свойства для совместимости с существующим кодом
  isRitual?: boolean;
  isConcentration?: boolean;
  prepared?: boolean;
}

// Функция для конвертации CharacterSpell в SpellData
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
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    // Добавляем совместимость с различными форматами
    isRitual: spell.ritual || false,
    isConcentration: spell.concentration || false,
    prepared: spell.prepared,
    higherLevels: spell.higherLevel || spell.higherLevels || '',
    id: spell.id
  };
};

// Функция для конвертации SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  const descriptionStr = typeof spell.description === 'string' 
    ? spell.description 
    : spell.description?.join('\n') || '';
    
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: descriptionStr,
    classes: typeof spell.classes === 'string' ? [spell.classes] : spell.classes,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual || spell.isRitual,
    concentration: spell.concentration || spell.isConcentration,
    prepared: spell.prepared,
    higherLevel: spell.higherLevels || spell.higherLevel,
    id: spell.id
  };
};
