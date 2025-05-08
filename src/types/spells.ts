
import { CharacterSpell } from './character';

export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string[] | string;
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  prepared?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  source?: string;
  higherLevel?: string;
  higherLevels?: string;
  materials?: string;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  // Обеспечиваем, что classes всегда будет массивом строк
  let classesArray: string[] = [];
  
  if (!spell.classes) {
    classesArray = [];
  } else if (typeof spell.classes === 'string') {
    classesArray = [spell.classes];
  } else if (Array.isArray(spell.classes)) {
    classesArray = spell.classes.map(c => String(c));
  }

  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description ? 
      Array.isArray(spell.description) ? 
        spell.description : 
        [spell.description] : 
      ['Нет описания'],
    classes: classesArray,
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials
  };
};

// Эта функция для преобразования массива заклинаний
export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};

// Функция для преобразования SpellData обратно в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: Array.isArray(spell.description) ? spell.description.join('\n') : spell.description,
    classes: Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes,
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials
  };
};
