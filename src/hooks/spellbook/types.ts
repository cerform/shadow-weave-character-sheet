
import { CharacterSpell } from '@/types/character';
import { SpellData, SpellFilters } from '@/types/spells';

// Интерфейс для возвращаемого значения хука useSpellbook
export interface UseSpellbookReturn {
  spells: SpellData[];
  filteredSpells: SpellData[];
  loading: boolean;
  error: string | null;
  filters: SpellFilters;
  updateFilters: (newFilters: Partial<SpellFilters>) => void;
  resetFilters: () => void;
  fetchSpells: () => Promise<void>;
  getSpellById: (id: string | number) => SpellData | undefined;
}

// Используем правильный синтаксис для экспорта типа
export type { SpellData };
export type { SpellFilters };
