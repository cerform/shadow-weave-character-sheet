
import { CharacterSpell } from '@/types/character.d';

export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school: string; // Required field
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
  prepared: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
}

export interface UseSpellbookReturn {
  filteredSpells: SpellData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeLevel: number[];
  selectedSpell: SpellData | null;
  isModalOpen: boolean;
  activeSchool: string[];
  activeClass: string[];
  currentTheme: any;
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  handleOpenSpell: (spell: SpellData) => void;
  handleClose: () => void;
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  formatClasses: (classes: string[] | string | undefined) => string;
  importSpellsFromText: (text: string) => CharacterSpell[];
  convertCharacterSpellsToSpellData: (characterSpells: CharacterSpell[]) => SpellData[];
}

// Helper function to convert between CharacterSpell and SpellData
export const convertToSpellData = (characterSpell: CharacterSpell): SpellData => {
  return {
    ...characterSpell,
    school: characterSpell.school || 'Неизвестная', // Provide a default value for required field
    prepared: characterSpell.prepared || false
  };
};

export const convertToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    id: typeof spellData.id === 'string' ? parseInt(spellData.id) || undefined : spellData.id
  };
};
