
import { useState, useEffect } from 'react';
import { filterBySearchTerm, filterByLevel, filterBySchool, filterByClass, extractClasses } from './filterUtils';
import { SpellData } from './types';
import { allSpells } from '@/data/allSpells'; // Import the full spells database
import { getSpellSchoolBadgeVariant } from './schemeUtils';
import { getSchoolBadgeColor } from './themeUtils';

// Функция для получения цвета бейджа в зависимости от уровня заклинания
export const getBadgeColor = (level: number): string => {
  const colors = {
    0: '#4b5563', // gray for cantrips
    1: '#3b82f6', // blue for level 1
    2: '#10b981', // green for level 2
    3: '#f59e0b', // amber for level 3
    4: '#8b5cf6', // purple for level 4
    5: '#ec4899', // pink for level 5
    6: '#f43f5e', // rose for level 6
    7: '#0ea5e9', // sky for level 7
    8: '#9333ea', // violet for level 8
    9: '#dc2626', // red for level 9
  };
  
  return colors[level as keyof typeof colors] || '#6b7280'; // default to gray
};

// Main hook for spellbook management
export function useSpellbook() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilters, setLevelFilters] = useState<number[]>([]);
  const [schoolFilters, setSchoolFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  
  // Use the full spells database directly instead of preloading
  const spells = allSpells;

  useEffect(() => {
    let results = [...spells];

    // Apply search term filter
    results = filterBySearchTerm(results, searchTerm);

    // Apply level filters
    results = filterByLevel(results, levelFilters);

    // Apply school filters
    results = filterBySchool(results, schoolFilters);

    // Apply class filters
    results = filterByClass(results, classFilters);

    setFilteredSpells(results);
  }, [spells, searchTerm, levelFilters, schoolFilters, classFilters]);

  // Utility function to toggle filter options
  const toggleFilter = (filterType: 'level' | 'school' | 'class', value: string | number) => {
    const valueStr = String(value); // Convert value to string for consistent handling

    switch (filterType) {
      case 'level':
        setLevelFilters(prev =>
          prev.includes(Number(value)) ? prev.filter(item => item !== Number(value)) : [...prev, Number(value)]
        );
        break;
      case 'school':
        setSchoolFilters(prev =>
          prev.includes(valueStr) ? prev.filter(item => item !== valueStr) : [...prev, valueStr]
        );
        break;
      case 'class':
        setClassFilters(prev =>
          prev.includes(valueStr) ? prev.filter(item => item !== valueStr) : [...prev, valueStr]
        );
        break;
      default:
        break;
    }
  };

  return {
    spells,
    allSpells: spells, // Отдаем все заклинания для подсчета
    filteredSpells,
    searchTerm,
    setSearchTerm,
    levelFilters,
    schoolFilters,
    classFilters,
    toggleFilter,
    extractClasses: () => extractClasses(spells),
    getSpellSchoolBadgeVariant,
    getSchoolBadgeColor,
    getBadgeColor,
    formatClasses: (classes: string[] | string | undefined) => {
      if (!classes) return '';
      if (Array.isArray(classes)) {
        return classes.join(', ');
      }
      return classes;
    }
  };
}

// Export utility functions for direct access
export { 
  filterByLevel,
  filterBySchool,
  filterByClass, 
  filterBySearchTerm,
  extractClasses,
  getSpellSchoolBadgeVariant,
  getSchoolBadgeColor
};
