
// Import required modules and types
import { useState, useMemo, useCallback } from 'react';
import { SpellData } from './types';
import { spells as allSpells } from '@/data/spells';
import { importSpellsFromText } from './importUtils';
import { getSchoolBadgeColor as getSchoolColor } from './themeUtils';
import { 
  filterByLevel, 
  filterBySchool, 
  filterByClass, 
  filterBySearchTerm 
} from './filterUtils';
import { CharacterSpell } from '@/types/character';

export const useSpellbook = () => {
  // Set initial state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalize the spell data to match the SpellData interface
  const normalizedSpells: SpellData[] = useMemo(() => {
    return allSpells.map(spell => ({
      id: spell.id ? spell.id.toString() : '',
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Unknown',
      castingTime: spell.castingTime || '',
      range: spell.range || '',
      components: spell.components || '',
      duration: spell.duration || '',
      description: spell.description || '',
      classes: spell.classes || [],
      isRitual: spell.ritual || false,
      isConcentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      higherLevel: spell.higherLevels || ''
    }));
  }, []);

  // Get unique levels, schools, and classes from all spells
  const allLevels = useMemo(() => {
    const levels = [...new Set(normalizedSpells.map(spell => spell.level))];
    return levels.sort((a, b) => a - b);
  }, [normalizedSpells]);

  const allSchools = useMemo(() => {
    const schools = [...new Set(normalizedSpells.map(spell => spell.school))];
    return schools.sort();
  }, [normalizedSpells]);

  const allClasses = useMemo(() => {
    const classes = new Set<string>();
    normalizedSpells.forEach(spell => {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      } else if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      }
    });
    return Array.from(classes).sort();
  }, [normalizedSpells]);

  // Filter spells based on selected filters
  const filteredSpells = useMemo(() => {
    let filtered = [...normalizedSpells];

    // Apply all filters
    filtered = filterByLevel(filtered, activeLevel);
    filtered = filterBySchool(filtered, activeSchool);
    filtered = filterByClass(filtered, activeClass);
    filtered = filterBySearchTerm(filtered, searchTerm);

    return filtered;
  }, [normalizedSpells, activeLevel, activeSchool, activeClass, searchTerm]);

  // Handlers for filters
  const toggleLevel = useCallback((level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  }, []);

  const toggleSchool = useCallback((school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  }, []);

  const toggleClass = useCallback((className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  }, []);

  // Handlers for spell selection
  const handleOpenSpell = useCallback((spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSpell(null);
  }, []);

  // Theme and color utilities
  const currentTheme = useMemo(() => {
    // Return a default theme object
    return {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#1f2937',
      accent: '#10b981'
    };
  }, []);

  // Badge color utilities
  const getBadgeColor = (type: string): string => {
    switch (type) {
      case 'level':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'school':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'class':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSchoolBadgeColor = (school: string): string => {
    return getSchoolColor(school);
  };

  // Format utilities
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    if (Array.isArray(classes)) return classes.join(', ');
    return classes;
  };

  return {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    selectedSpell,
    isModalOpen,
    activeSchool,
    activeClass,
    currentTheme,
    allLevels,
    allSchools,
    allClasses,
    handleOpenSpell,
    handleClose,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    importSpellsFromText: (text: string) => importSpellsFromText(text, [])
  };
};

export * from './types';
