
export interface SpellData {
  id: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;  // Required in SpellData
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

export interface SpellbookEntry {
  id: string | number;
  userId: string;
  spellId: string | number;
  name: string;
  isFavorite: boolean;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  spell?: SpellData;
}

import { CharacterSpell } from './character';

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    ...spell,
    name: spell.name,
    level: spell.level,
    id: spell.id
  };
};

export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};

export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0: return "Заговоры";
    case 1: return "1-й уровень";
    case 2: return "2-й уровень";
    case 3: return "3-й уровень";
    case 4: return "4-й уровень";
    case 5: return "5-й уровень";
    case 6: return "6-й уровень";
    case 7: return "7-й уровень";
    case 8: return "8-й уровень";
    case 9: return "9-й уровень";
    default: return `${level}-й уровень`;
  }
};
