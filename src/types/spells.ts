
import { CharacterSpell } from './character';

export interface SpellData {
  id: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  source?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
  materials?: string;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`, // Гарантируем id, даже если его нет
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная', // Provide default values for required fields
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    ...spell,
    // Make sure all required CharacterSpell properties are set
    name: spell.name,
    level: spell.level,
    id: spell.id // Передаем id из SpellData в CharacterSpell
  };
};

export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
