
export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[] | string;
  source?: string;
}

export interface SpellFilter {
  level?: number | null;
  school?: string | null;
  class?: string | null;
  name?: string | null;
  prepared?: boolean | null;
  ritual?: boolean | null;
  concentration?: boolean | null;
}

export interface SpellsState {
  allSpells: SpellData[];
  filteredSpells: SpellData[];
  selectedSpell: SpellData | null;
  filters: SpellFilter;
  loading: boolean;
  error: string | null;
}
