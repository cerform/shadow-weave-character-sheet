
import { SpellData } from '@/types/spells';

export interface SpellFilters {
  level?: number | null;
  school?: string | null;
  class?: string | null;
  searchTerm?: string;
  ritual?: boolean;
  concentration?: boolean;
}

export interface SpellbookContextType {
  selectedSpells: SpellData[];
  availableSpells: SpellData[];
  setSelectedSpells: (spells: SpellData[]) => void;
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
  canAddSpell: (spell: SpellData) => boolean;
  getSpellLimits: () => { cantrips: number; spells: number };
  getSelectedSpellCount: () => { cantrips: number; spells: number };
  saveCharacterSpells: () => void;
  isSpellAvailableForClass: (spell: SpellData) => boolean;
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
  
  // Добавляем необходимые свойства для SpellBookViewer
  spells: SpellData[];
  loadSpells: () => void;
  isLoading: boolean;
  filters: SpellFilters;
  setFilters: (filters: SpellFilters) => void;
}
