
import { CharacterSpell } from '@/types/character';
import { Dispatch, SetStateAction } from 'react';

// Типы для работы с заклинаниями
export interface SpellData extends Omit<CharacterSpell, 'ritual' | 'concentration'> {
  id: number;
  isRitual: boolean;
  isConcentration: boolean;
  castingTime: string;
  toString: () => string;
  higherLevels?: string;
  higherLevel?: string;
  source?: string;
}

// Тип для возвращаемого значения хука useSpellbook
export interface UseSpellbookReturn {
  filteredSpells: SpellData[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
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
  formatClasses: (classes: string[] | string) => string;
  importSpellsFromText: (text: string) => CharacterSpell[];
}

// Тип для краткой информации о заклинании
export interface SpellSummary {
  id: number;
  name: string;
  level: number;
  school: string;
  isRitual: boolean;
  isConcentration: boolean;
  castingTime: string;
}

// Тип для фильтров заклинаний
export interface SpellFilters {
  searchTerm: string;
  level: number[];
  school: string[];
  class: string[];
}

// Тип для требования мультиклассирования
export interface MulticlassRequirements {
  [key: string]: {
    abilities: { [key: string]: number };
    description: string;
  }
}
