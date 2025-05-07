
// Типы для фильтрации заклинаний в SpellbookViewer
export interface SpellFilters {
  name?: string;
  level?: string;
  school?: string;
  characterClass?: string;
  ritual?: boolean;
  concentration?: boolean;
}

// Маппинг школ магии для фильтрации
export interface SchoolMapping {
  [key: string]: string;
}
