
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SpellData, SpellFilter, convertSpellDataToCharacterSpell, convertCharacterSpellToSpellData } from '@/types/spells';
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
    return filterSpells(spells, filter);
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
  const getBadgeColor = (level: number) => {
    switch (level) {
      case 0: return { bg: 'bg-gray-500', text: 'text-white' };
      case 1: return { bg: 'bg-indigo-500', text: 'text-white' };
      case 2: return { bg: 'bg-blue-500', text: 'text-white' };
      case 3: return { bg: 'bg-cyan-500', text: 'text-white' };
      case 4: return { bg: 'bg-teal-500', text: 'text-white' };
      case 5: return { bg: 'bg-green-500', text: 'text-white' };
      case 6: return { bg: 'bg-yellow-500', text: 'text-black' };
      case 7: return { bg: 'bg-orange-500', text: 'text-white' };
      case 8: return { bg: 'bg-red-500', text: 'text-white' };
      case 9: return { bg: 'bg-purple-600', text: 'text-white' };
      default: return { bg: 'bg-gray-500', text: 'text-white' };
    }
  };

  const getSchoolBadgeColor = (school: string) => {
    switch (school.toLowerCase()) {
      case 'огонь': return { bg: 'bg-red-500', text: 'text-white' };
      case 'вода': return { bg: 'bg-blue-500', text: 'text-white' };
      case 'земля': return { bg: 'bg-amber-700', text: 'text-white' };
      case 'воздух': return { bg: 'bg-sky-300', text: 'text-black' };
      case 'воплощение': return { bg: 'bg-orange-500', text: 'text-white' };
      case 'некромантия': return { bg: 'bg-purple-900', text: 'text-white' };
      case 'преобразование': return { bg: 'bg-green-600', text: 'text-white' };
      case 'ограждение': return { bg: 'bg-amber-500', text: 'text-black' };
      case 'иллюзия': return { bg: 'bg-pink-400', text: 'text-white' };
      case 'очарование': return { bg: 'bg-purple-500', text: 'text-white' };
      case 'прорицание': return { bg: 'bg-cyan-500', text: 'text-white' };
      default: return { bg: 'bg-slate-500', text: 'text-white' };
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
