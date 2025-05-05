
import { CharacterSpell } from './character';

export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
}

// Функция для преобразования объекта CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    id: spell.id?.toString() || Math.random().toString(),
    school: spell.school || 'Универсальная', // Значение по умолчанию
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
  };
};

// Функция для преобразования объекта SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    ...spell,
    name: spell.name,
    level: spell.level
  };
};

// Функция для массового преобразования массива заклинаний
export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
