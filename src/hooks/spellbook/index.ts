import { useState, useEffect } from 'react';
import { filterBySearchTerm, filterByLevel, filterBySchool, filterByClass, extractClasses } from './filterUtils';
import { SpellData } from './types';
import usePreloadSpells from './usePreloadSpells';
import { getSpellSchoolBadgeVariant } from './schemeUtils';
import { getSchoolBadgeColor } from './themeUtils';

// Main hook for spellbook management
export function useSpellbook() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilters, setLevelFilters] = useState<number[]>([]);
  const [schoolFilters, setSchoolFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const spells = usePreloadSpells();

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
