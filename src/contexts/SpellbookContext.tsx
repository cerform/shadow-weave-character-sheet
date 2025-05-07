
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { SpellData, SpellFilter } from '@/types/spells';
import { getAllSpells } from '@/data/spells';

export interface SpellbookContextProps {
  spells: SpellData[];
  filteredSpells: SpellData[];
  filters: SpellFilter;
  setFilters: (filters: SpellFilter) => void;
  addFilter: (filter: Partial<SpellFilter>) => void;
  removeFilter: (filterKey: keyof SpellFilter) => void;
  clearFilters: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  selectedSpell: SpellData | null;
  handleOpenSpell: (spell: SpellData) => void;
  handleClose: () => void;
  isModalOpen: boolean;
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  formatClasses: (classes: string[] | string) => string;
  isLoading: boolean;
}

export const SpellbookContext = createContext<SpellbookContextProps | undefined>(undefined);

interface SpellbookProviderProps {
  children: ReactNode;
}

export const SpellbookProvider: React.FC<SpellbookProviderProps> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [filters, setFilters] = useState<SpellFilter>({});
  const [searchText, setSearchText] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем все заклинания при инициализации
  useEffect(() => {
    const loadSpells = async () => {
      setIsLoading(true);
      try {
        const allSpells = getAllSpells();
        setSpells(allSpells);
        setFilteredSpells(allSpells);
      } catch (error) {
        console.error('Failed to load spells:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpells();
  }, []);

  // Фильтрация заклинаний при изменении фильтров или поискового текста
  useEffect(() => {
    let result = [...spells];
    
    // Фильтрация по текстовому поиску
    if (searchText) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(searchText.toLowerCase()) || 
        (spell.description && typeof spell.description === 'string' && 
          spell.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    // Фильтрация по уровню
    if (filters.level !== undefined) {
      result = result.filter(spell => {
        if (Array.isArray(filters.level)) {
          return filters.level.includes(spell.level);
        }
        return spell.level === filters.level;
      });
    }
    
    // Фильтрация по школе
    if (filters.school !== undefined) {
      result = result.filter(spell => {
        if (Array.isArray(filters.school)) {
          return filters.school.includes(spell.school);
        }
        return spell.school === filters.school;
      });
    }
    
    // Фильтрация по классу
    if (filters.class !== undefined) {
      result = result.filter(spell => {
        const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
        
        if (Array.isArray(filters.class)) {
          return filters.class.some(c => spellClasses.includes(c));
        }
        return spellClasses.includes(filters.class);
      });
    }
    
    setFilteredSpells(result);
  }, [spells, filters, searchText]);

  // Функции управления фильтрами
  const addFilter = (filter: Partial<SpellFilter>) => {
    setFilters(prev => ({ ...prev, ...filter }));
  };

  const removeFilter = (filterKey: keyof SpellFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Функции для переключения фильтров
  const toggleLevel = (level: number) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters.level) {
        newFilters.level = [level];
      } else if (Array.isArray(newFilters.level)) {
        if (newFilters.level.includes(level)) {
          newFilters.level = newFilters.level.filter(l => l !== level);
          if (newFilters.level.length === 0) delete newFilters.level;
        } else {
          newFilters.level = [...newFilters.level, level];
        }
      } else {
        if (newFilters.level === level) {
          delete newFilters.level;
        } else {
          newFilters.level = [newFilters.level, level];
        }
      }
      
      return newFilters;
    });
  };

  const toggleSchool = (school: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters.school) {
        newFilters.school = [school];
      } else if (Array.isArray(newFilters.school)) {
        if (newFilters.school.includes(school)) {
          newFilters.school = newFilters.school.filter(s => s !== school);
          if (newFilters.school.length === 0) delete newFilters.school;
        } else {
          newFilters.school = [...newFilters.school, school];
        }
      } else {
        if (newFilters.school === school) {
          delete newFilters.school;
        } else {
          newFilters.school = [newFilters.school, school];
        }
      }
      
      return newFilters;
    });
  };

  const toggleClass = (className: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters.class) {
        newFilters.class = [className];
      } else if (Array.isArray(newFilters.class)) {
        if (newFilters.class.includes(className)) {
          newFilters.class = newFilters.class.filter(c => c !== className);
          if (newFilters.class.length === 0) delete newFilters.class;
        } else {
          newFilters.class = [...newFilters.class, className];
        }
      } else {
        if (newFilters.class === className) {
          delete newFilters.class;
        } else {
          newFilters.class = [newFilters.class, className];
        }
      }
      
      return newFilters;
    });
  };

  // Функции для работы с модальным окном
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Вспомогательные функции для отображения
  const getBadgeColor = (level: number) => {
    const colors = [
      'bg-gray-200 text-gray-800', // level 0
      'bg-blue-100 text-blue-800',  // level 1
      'bg-green-100 text-green-800', // level 2
      'bg-yellow-100 text-yellow-800', // level 3
      'bg-orange-100 text-orange-800', // level 4
      'bg-red-100 text-red-800', // level 5
      'bg-purple-100 text-purple-800', // level 6
      'bg-indigo-100 text-indigo-800', // level 7
      'bg-pink-100 text-pink-800', // level 8
      'bg-violet-100 text-violet-800', // level 9
    ];
    
    return colors[level] || colors[0];
  };

  const getSchoolBadgeColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      'Воплощение': 'bg-red-100 text-red-800',
      'Некромантия': 'bg-black text-white',
      'Преобразование': 'bg-green-100 text-green-800',
      'Иллюзия': 'bg-purple-100 text-purple-800',
      'Прорицание': 'bg-blue-100 text-blue-800',
      'Очарование': 'bg-pink-100 text-pink-800',
      'Вызов': 'bg-amber-100 text-amber-800',
      'Ограждение': 'bg-indigo-100 text-indigo-800',
    };
    
    return schoolColors[school] || 'bg-gray-100 text-gray-800';
  };

  const formatClasses = (classes: string[] | string) => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes;
  };

  return (
    <SpellbookContext.Provider
      value={{
        spells,
        filteredSpells,
        filters,
        setFilters,
        addFilter,
        removeFilter,
        clearFilters,
        searchText,
        setSearchText,
        toggleLevel,
        toggleSchool,
        toggleClass,
        selectedSpell,
        handleOpenSpell,
        handleClose,
        isModalOpen,
        getBadgeColor,
        getSchoolBadgeColor,
        formatClasses,
        isLoading
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

// Expose a custom hook to use the context
export const useSpellbookContext = () => {
  const context = useContext(SpellbookContext);
  if (context === undefined) {
    throw new Error('useSpellbookContext must be used within a SpellbookProvider');
  }
  return context;
};
