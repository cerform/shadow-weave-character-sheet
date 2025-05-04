
export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school: string; // Убрал необязательность
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[] | string;
  isRitual: boolean;
  isConcentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  higherLevel?: string;
  ritual?: boolean;
  concentration?: boolean;
  materialComponents?: string;
  higherLevels?: string;
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
  getBadgeColor: (type: string) => string;
  getSchoolBadgeColor: (school: string) => string;
  formatClasses: (classes: string[] | string | undefined) => string;
  importSpellsFromText: (text: string) => any[];
}
