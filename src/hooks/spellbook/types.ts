
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
  isRitualOnly: boolean;
  isConcentrationOnly: boolean;
  toggleRitualOnly: () => void;
  toggleConcentrationOnly: () => void;
  advancedFiltersOpen: boolean;
  toggleAdvancedFilters: () => void;
  loadSpells: () => SpellData[];
  
  // Расширенные фильтры
  verbalComponent: boolean | null;
  setVerbalComponent: (value: boolean | null) => void;
  somaticComponent: boolean | null;
  setSomaticComponent: (value: boolean | null) => void;
  materialComponent: boolean | null;
  setMaterialComponent: (value: boolean | null) => void;
  castingTimes: string[];
  activeCastingTimes: string[];
  toggleCastingTime: (time: string) => void;
  rangeTypes: string[];
  activeRangeTypes: string[];
  toggleRangeType: (range: string) => void;
  durationTypes: string[];
  activeDurationTypes: string[];
  toggleDurationType: (duration: string) => void;
  sources: string[];
  activeSources: string[];
  toggleSource: (source: string) => void;
  clearAdvancedFilters: () => void;
}

// Экспортируем также тип SpellData
export type { SpellData };

// Interface for filter state
export interface SpellFilters {
  levels: number[];
  schools: string[];
  classes: string[];
  ritual: boolean;
  concentration: boolean;
  searchText: string;
  verbalComponent: boolean | null;
  somaticComponent: boolean | null;
  materialComponent: boolean | null;
  castingTimes: string[];
  rangeTypes: string[];
  durationTypes: string[];
  sources: string[];
}

// Interface for spell components
export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
}
