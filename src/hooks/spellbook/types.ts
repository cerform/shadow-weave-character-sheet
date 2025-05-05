
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Интерфейс для возвращаемого значения хука useSpellbook
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
  importSpellsFromText?: (text: string, existingSpells: CharacterSpell[]) => CharacterSpell[];
}
