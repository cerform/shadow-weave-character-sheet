
import { useState, useMemo, useCallback } from 'react';
import { CharacterFilter, SearchOptions, FilterSet } from '@/types/characterFilters';

export interface Character {
  id: string;
  name: string;
  class: string;
  subclass?: string;
  level: number;
  background?: string;
  race?: string;
  alignment?: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  armorClass: number;
  hitPoints: number;
  campaign?: string;
  player?: string;
  status: 'active' | 'retired' | 'deceased';
  lastModified: Date;
  isMulticlass?: boolean;
  notes?: string;
  description?: string;
}

interface UseCharacterFiltersProps {
  characters: Character[];
}

export const useCharacterFilters = ({ characters }: UseCharacterFiltersProps) => {
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    fuzzyMatch: true,
    searchFields: ['name', 'background', 'notes', 'description'],
    tags: []
  });
  const [savedFilterSets, setSavedFilterSets] = useState<FilterSet[]>([]);

  // Функция для фильтрации персонажей
  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    // Текстовый поиск
    if (searchOptions.query) {
      const query = searchOptions.query.toLowerCase();
      result = result.filter(character => {
        return searchOptions.searchFields.some(field => {
          const value = character[field as keyof Character];
          return typeof value === 'string' && value.toLowerCase().includes(query);
        });
      });
    }

    // Фильтр по классам
    if (activeFilters.classes && activeFilters.classes.length > 0) {
      result = result.filter(character => 
        activeFilters.classes.includes(character.class)
      );
    }

    // Фильтр по уровню
    if (activeFilters.levelRange) {
      const [minLevel, maxLevel] = activeFilters.levelRange;
      result = result.filter(character => 
        character.level >= minLevel && character.level <= maxLevel
      );
    }

    // Фильтр по мультиклассу
    if (activeFilters.isMulticlass !== null && activeFilters.isMulticlass !== undefined) {
      result = result.filter(character => 
        Boolean(character.isMulticlass) === activeFilters.isMulticlass
      );
    }

    // Фильтр по характеристикам
    if (activeFilters.statRanges) {
      result = result.filter(character => {
        return Object.entries(activeFilters.statRanges).every(([stat, range]) => {
          const [min, max] = range as [number, number];
          const statValue = character.stats[stat as keyof typeof character.stats];
          return statValue >= min && statValue <= max;
        });
      });
    }

    // Фильтр по КД
    if (activeFilters.acRange) {
      const [minAC, maxAC] = activeFilters.acRange;
      result = result.filter(character => 
        character.armorClass >= minAC && character.armorClass <= maxAC
      );
    }

    // Фильтр по кампаниям
    if (activeFilters.campaigns && activeFilters.campaigns.length > 0) {
      result = result.filter(character => 
        character.campaign && activeFilters.campaigns.includes(character.campaign)
      );
    }

    // Фильтр по статусу
    if (activeFilters.status && activeFilters.status.length > 0) {
      const statusMap: Record<string, string> = {
        'Активный': 'active',
        'На пенсии': 'retired',
        'Погиб': 'deceased'
      };
      
      const mappedStatus = activeFilters.status.map((s: string) => statusMap[s] || s);
      result = result.filter(character => 
        mappedStatus.includes(character.status)
      );
    }

    return result;
  }, [characters, activeFilters, searchOptions]);

  // Получение уникальных значений для фильтров
  const availableClasses = useMemo(() => {
    return [...new Set(characters.map(c => c.class))].sort();
  }, [characters]);

  const availableCampaigns = useMemo(() => {
    return [...new Set(characters.map(c => c.campaign).filter(Boolean))].sort();
  }, [characters]);

  const availablePlayers = useMemo(() => {
    return [...new Set(characters.map(c => c.player).filter(Boolean))].sort();
  }, [characters]);

  // Функции управления фильтрами
  const updateFilters = useCallback((newFilters: any) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSearch = useCallback((newSearch: SearchOptions) => {
    setSearchOptions(newSearch);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchOptions({
      query: '',
      fuzzyMatch: true,
      searchFields: ['name', 'background', 'notes', 'description'],
      tags: []
    });
  }, []);

  const saveFilterSet = useCallback((name: string, description?: string) => {
    const newFilterSet: FilterSet = {
      id: Date.now().toString(),
      name,
      description,
      filters: [], // TODO: Преобразовать activeFilters в CharacterFilter[]
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSavedFilterSets(prev => [...prev, newFilterSet]);
    
    // Сохранение в localStorage
    const saved = localStorage.getItem('character-filter-sets');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('character-filter-sets', JSON.stringify([...existing, newFilterSet]));
  }, [activeFilters]);

  const loadFilterSet = useCallback((filterSet: FilterSet) => {
    // TODO: Преобразовать CharacterFilter[] обратно в activeFilters
    setActiveFilters({});
  }, []);

  return {
    filteredCharacters,
    activeFilters,
    searchOptions,
    availableClasses,
    availableCampaigns,
    availablePlayers,
    savedFilterSets,
    updateFilters,
    updateSearch,
    clearAllFilters,
    saveFilterSet,
    loadFilterSet,
    totalCount: characters.length,
    filteredCount: filteredCharacters.length
  };
};
