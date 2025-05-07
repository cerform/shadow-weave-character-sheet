
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SpellData, SpellFilter, convertSpellDataToCharacterSpell, convertCharacterSpellToSpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { applyAllFilters } from './filterUtils';

// Don't redefine SpellFilter type here, use the imported one

export function useSpellbook(initialSpells: SpellData[] = []) {
  const { toast } = useToast();
  const [spells, setSpells] = useState<SpellData[]>(initialSpells);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [filter, setFilter] = useState<SpellFilter>({
    search: '',
    level: [],
    school: [],
    className: [],
    ritual: null,
    concentration: null
  });

  // Получение уникальных значений для фильтров
  const allLevels = useMemo(() => {
    const levels = new Set<number>();
    spells.forEach(spell => levels.add(spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [spells]);

  const allSchools = useMemo(() => {
    const schools = new Set<string>();
    spells.forEach(spell => schools.add(spell.school));
    return Array.from(schools).sort();
  }, [spells]);

  const allClasses = useMemo(() => {
    const classes = new Set<string>();
    spells.forEach(spell => {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      } else if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      }
    });
    return Array.from(classes).sort();
  }, [spells]);

  // Отфильтрованные заклинания
  const filteredSpells = useMemo(() => {
    return applyAllFilters(
      spells, 
      filter.search, 
      filter.level, 
      filter.school,
      filter.className,
      filter.ritual,
      filter.concentration
    );
  }, [spells, filter]);

  // Функции для обновления фильтров
  const updateFilter = (updates: Partial<SpellFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  // Обработчики для изменения фильтров
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateFilter({ search: value });
  };

  const toggleLevel = (level: number) => {
    const newActiveLevels = [...activeLevel];
    const index = newActiveLevels.indexOf(level);
    
    if (index === -1) {
      newActiveLevels.push(level);
    } else {
      newActiveLevels.splice(index, 1);
    }
    
    setActiveLevel(newActiveLevels);
    updateFilter({ level: newActiveLevels });
  };

  const toggleSchool = (school: string) => {
    const newActiveSchools = [...activeSchool];
    const index = newActiveSchools.indexOf(school);
    
    if (index === -1) {
      newActiveSchools.push(school);
    } else {
      newActiveSchools.splice(index, 1);
    }
    
    setActiveSchool(newActiveSchools);
    updateFilter({ school: newActiveSchools });
  };

  const toggleClass = (className: string) => {
    const newActiveClasses = [...activeClass];
    const index = newActiveClasses.indexOf(className);
    
    if (index === -1) {
      newActiveClasses.push(className);
    } else {
      newActiveClasses.splice(index, 1);
    }
    
    setActiveClass(newActiveClasses);
    updateFilter({ className: newActiveClasses });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setFilter({
      search: '',
      level: [],
      school: [],
      className: [],
      ritual: null,
      concentration: null
    });
  };

  // Обработчики для модального окна
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Вспомогательные функции для UI
  const getBadgeColor = (level: number): string => {
    switch (level) {
      case 0: return '#6b7280'; // gray-500
      case 1: return '#6366f1'; // indigo-500
      case 2: return '#3b82f6'; // blue-500
      case 3: return '#06b6d4'; // cyan-500
      case 4: return '#14b8a6'; // teal-500
      case 5: return '#22c55e'; // green-500
      case 6: return '#eab308'; // yellow-500
      case 7: return '#f97316'; // orange-500
      case 8: return '#ef4444'; // red-500
      case 9: return '#a855f7'; // purple-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getSchoolBadgeColor = (school: string): string => {
    switch (school.toLowerCase()) {
      case 'огонь': return '#ef4444'; // red-500
      case 'вода': return '#3b82f6'; // blue-500
      case 'земля': return '#92400e'; // amber-700
      case 'воздух': return '#7dd3fc'; // sky-300
      case 'воплощение': return '#f97316'; // orange-500
      case 'некромантия': return '#581c87'; // purple-900
      case 'преобразование': return '#16a34a'; // green-600
      case 'ограждение': return '#f59e0b'; // amber-500
      case 'иллюзия': return '#ec4899'; // pink-400
      case 'очарование': return '#d946ef'; // purple-500
      case 'прорицание': return '#06b6d4'; // cyan-500
      default: return '#64748b'; // slate-500
    }
  };

  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) {
      return '';
    }
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes;
  };

  // Функции для управления заклинаниями
  const setAllSpells = (spellsData: SpellData[]) => {
    setSpells(spellsData);
  };

  const addSpell = (spell: SpellData) => {
    setSpells(prev => {
      if (!prev.some(s => s.id === spell.id)) {
        return [...prev, spell];
      }
      return prev;
    });
  };

  const removeSpell = (spellId: string | number) => {
    setSpells(prev => prev.filter(spell => spell.id !== spellId));
    setSelectedSpells(prev => prev.filter(spell => spell.id !== spellId));
  };

  const toggleSpellSelection = (spell: SpellData) => {
    setSelectedSpells(prev => {
      const exists = prev.some(s => s.id === spell.id);
      
      if (exists) {
        return prev.filter(s => s.id !== spell.id);
      } else {
        return [...prev, spell];
      }
    });
  };

  const isSpellSelected = (spellId: string | number): boolean => {
    return selectedSpells.some(spell => spell.id === spellId);
  };

  return {
    spells,
    filteredSpells,
    selectedSpells,
    filter,
    loading,
    error,
    setAllSpells,
    addSpell,
    removeSpell,
    toggleSpellSelection,
    isSpellSelected,
    updateFilter,
    setSelectedSpells,
    // Дополнительные возвращаемые значения для совместимости с SpellBookViewer
    searchTerm,
    setSearchTerm: handleSearchChange,
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
    formatClasses
  };
}
