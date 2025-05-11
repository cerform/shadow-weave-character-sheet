
export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
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
