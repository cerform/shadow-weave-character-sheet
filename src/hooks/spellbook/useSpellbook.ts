
import { useState, useCallback, useEffect } from 'react';
import { SpellData, convertSpellDataToCharacterSpell, convertCharacterSpellToSpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { filterSpells } from './filterUtils';

export type SpellFilter = {
  search: string;
  level: number[];
  school: string[];
  className: string[];
  ritual: boolean | null;
  concentration: boolean | null;
};

export interface UseSpellbookProps {
  initialSpells?: SpellData[];
}

export const useSpellbook = ({ initialSpells = [] }: UseSpellbookProps = {}) => {
  const [spells, setSpells] = useState<SpellData[]>(initialSpells);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [filter, setFilter] = useState<SpellFilter>({
    search: '',
    level: [],
    school: [],
    className: [],
    ritual: null,
    concentration: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для SpellBookViewer
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Функции для обработки заклинаний для SpellBookViewer
  const handleOpenSpell = useCallback((spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  }, []);
  
  const handleClose = useCallback(() => {
    setSelectedSpell(null);
    setIsModalOpen(false);
  }, []);
  
  // Функции для фильтров
  const searchTerm = filter.search;
  const setSearchTerm = (term: string) => updateFilter({ search: term });
  
  const activeLevel = filter.level;
  const activeSchool = filter.school;
  const activeClass = filter.className;
  
  // Получаем все уровни, школы и классы из заклинаний
  const allLevels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
  const allSchools = [...new Set(spells.map(spell => spell.school))];
  const allClasses = [...new Set(spells.flatMap(spell => {
    if (Array.isArray(spell.classes)) return spell.classes;
    else if (typeof spell.classes === 'string') return [spell.classes];
    return [];
  }))].filter(Boolean);
  
  // Цвета для уровней заклинаний
  const levelColors: Record<number, string> = {
    0: '#808080',   // Grey
    1: '#007bff',   // Blue
    2: '#28a745',   // Green
    3: '#dc3545',   // Red
    4: '#ffc107',  // Yellow
    5: '#17a2b8',   // Cyan
    6: '#fd7e14',   // Orange
    7: '#6f42c1',   // Indigo
    8: '#e83e8c',   // Pink
    9: '#6c757d'    // Dark Grey
  };

  // Цвета для школ магии
  const schoolColors: Record<string, string> = {
    Abjuration: '#4287f5',    // Blue
    Conjuration: '#28a745',   // Green
    Divination: '#ffc107',    // Yellow
    Enchantment: '#e83e8c',   // Pink
    Evocation: '#dc3545',     // Red
    Illusion: '#6f42c1',      // Indigo
    Necromancy: '#000000',    // Black
    Transmutation: '#fd7e14'  // Orange
  };
  
  // Функции для SpellBookViewer
  const getBadgeColor = (level: number): string => {
    return levelColors[level] || '#999';
  };

  const getSchoolBadgeColor = (school: string): string => {
    return schoolColors[school] || '#999';
  };
  
  const formatClasses = (classes: string | string[]): string => {
    if (typeof classes === 'string') {
      return classes;
    }
    return classes.join(', ');
  };
  
  const toggleLevel = (level: number) => {
    setFilter(prev => {
      const newLevels = prev.level.includes(level) 
        ? prev.level.filter(l => l !== level)
        : [...prev.level, level];
      return { ...prev, level: newLevels };
    });
  };

  const toggleSchool = (school: string) => {
    setFilter(prev => {
      const newSchools = prev.school.includes(school)
        ? prev.school.filter(s => s !== school)
        : [...prev.school, school];
      return { ...prev, school: newSchools };
    });
  };

  const toggleClass = (className: string) => {
    setFilter(prev => {
      const newClasses = prev.className.includes(className)
        ? prev.className.filter(c => c !== className)
        : [...prev.className, className];
      return { ...prev, className: newClasses };
    });
  };
  
  const clearFilters = () => {
    setFilter({
      search: '',
      level: [],
      school: [],
      className: [],
      ritual: null,
      concentration: null,
    });
  };

  // Функция для установки заклинаний
  const setAllSpells = useCallback((spellsData: SpellData[]) => {
    setSpells(spellsData);
  }, []);

  // Функция для добавления заклинаний из Character
  const addSpellsFromCharacter = useCallback((characterSpells: CharacterSpell[]) => {
    if (!characterSpells || characterSpells.length === 0) return;
    
    const convertedSpells = characterSpells.map(spell => convertCharacterSpellToSpellData(spell));
    setSpells(prev => {
      // Объединяем и удаляем дубликаты по id
      const combined = [...prev, ...convertedSpells];
      const uniqueSpells = Array.from(
        new Map(combined.map(spell => [spell.id, spell])).values()
      );
      return uniqueSpells;
    });
    
    // Добавляем в выбранные заклинания
    setSelectedSpells(prev => {
      // Объединяем и удаляем дубликаты по id
      const combined = [...prev, ...convertedSpells];
      const uniqueSpells = Array.from(
        new Map(combined.map(spell => [spell.id, spell])).values()
      );
      return uniqueSpells;
    });
  }, []);
  
  // Функция для выбора заклинания
  const selectSpell = useCallback((spell: SpellData) => {
    setSelectedSpells(prev => [...prev, spell]);
  }, []);

  // Функция для снятия выбора заклинания
  const unselectSpell = useCallback((spellId: string | number) => {
    setSelectedSpells(prev => prev.filter(spell => spell.id !== spellId));
  }, []);

  // Функция для проверки, выбрано ли заклинание
  const isSpellSelected = useCallback((spellId: string | number) => {
    return selectedSpells.some(spell => spell.id === spellId);
  }, [selectedSpells]);

  // Функция для установки фильтра
  const updateFilter = useCallback((newFilter: Partial<SpellFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Функция для сброса фильтра
  const resetFilter = useCallback(() => {
    setFilter({
      search: '',
      level: [],
      school: [],
      className: [],
      ritual: null,
      concentration: null,
    });
  }, []);

  // Применение фильтра при его изменении
  useEffect(() => {
    const result = filterSpells(spells, filter);
    setFilteredSpells(result);
  }, [spells, filter]);
  
  // Инициализация начальными заклинаниями
  useEffect(() => {
    if (initialSpells && initialSpells.length > 0) {
      setSpells(initialSpells);
    }
  }, [initialSpells]);

  return {
    spells,
    filteredSpells,
    selectedSpells,
    filter,
    loading,
    error,
    // Для SpellBookViewer
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    allLevels,
    allSchools,
    allClasses,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    selectedSpell,
    isModalOpen,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    // Стандартные методы
    setAllSpells,
    setSpells,
    addSpellsFromCharacter,
    selectSpell,
    unselectSpell,
    isSpellSelected,
    updateFilter,
    resetFilter,
    setSelectedSpells
  };
};

export default useSpellbook;
