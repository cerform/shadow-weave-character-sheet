
import { SpellData, SpellFilters } from '@/types/spells';

export interface SpellbookContextType {
  spells: SpellData[];
  filteredSpells: SpellData[];
  availableSpells: SpellData[];
  selectedSpell: SpellData | null;
  searchTerm: string;
  levelFilter: number[];
  classFilter: string[];
  schoolFilter: string[];
  ritualFilter: boolean | null;
  concentrationFilter: boolean | null;
  loading: boolean;
  filters: SpellFilters;
  updateFilters: (newFilters: Partial<SpellFilters>) => void;
  setSearchTerm: (term: string) => void;
  setLevelFilter: (levels: number[]) => void;
  setClassFilter: (classes: string[]) => void;
  setSchoolFilter: (schools: string[]) => void;
  setRitualFilter: (ritual: boolean | null) => void;
  setConcentrationFilter: (concentration: boolean | null) => void;
  selectSpell: (spell: SpellData | null) => void;
  resetFilters: () => void;
  loadSpellsForCharacter: (className: string, level: number) => void;
}
