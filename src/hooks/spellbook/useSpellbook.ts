
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { spells as allSpellsData } from '@/data/spells';
import { convertSpellDataToCharacterSpell } from '@/types/spells';
import { importSpellsFromText } from './importUtils';

export const useSpellbook = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);

  // Extract unique values for filters
  const spells = useMemo(() => {
    return Array.isArray(allSpellsData) ? allSpellsData : [];
  }, []);

  const allLevels = useMemo(() => {
    const levels = Array.from(new Set(spells.map(spell => spell.level)))
      .sort((a, b) => a - b);
    return levels;
  }, [spells]);

  const allSchools = useMemo(() => {
    const schools = Array.from(new Set(spells.map(spell => spell.school)))
      .filter(Boolean)
      .sort();
    return schools;
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

  // Filter spells based on search and filters
  const filteredSpells = useMemo(() => {
    return spells.filter(spell => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Level filter
      const matchesLevel = activeLevel.length === 0 || 
        activeLevel.includes(spell.level);

      // School filter
      const matchesSchool = activeSchool.length === 0 || 
        activeSchool.includes(spell.school);

      // Class filter
      const matchesClass = activeClass.length === 0 || 
        (Array.isArray(spell.classes) && 
          spell.classes.some(cls => activeClass.includes(cls))) || 
        (typeof spell.classes === 'string' && 
          activeClass.includes(spell.classes));

      return matchesSearch && matchesLevel && matchesSchool && matchesClass;
    });
  }, [spells, searchTerm, activeLevel, activeSchool, activeClass]);

  // Toggle filter functions
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
  };

  // Color functions for badges
  const getBadgeColor = (level: number) => {
    switch (level) {
      case 0: return '#9e9e9e'; // Cantrips
      case 1: return '#4caf50'; // Level 1
      case 2: return '#2196f3'; // Level 2
      case 3: return '#ff9800'; // Level 3
      case 4: return '#9c27b0'; // Level 4
      case 5: return '#f44336'; // Level 5
      case 6: return '#795548'; // Level 6
      case 7: return '#607d8b'; // Level 7
      case 8: return '#ff5722'; // Level 8
      case 9: return '#e91e63'; // Level 9
      default: return '#9e9e9e';
    }
  };

  const getSchoolBadgeColor = (school: string) => {
    switch (school.toLowerCase()) {
      case 'воплощение': return '#f44336';
      case 'вызов': return '#9c27b0';
      case 'иллюзия': return '#9e9e9e';
      case 'некромантия': return '#000000';
      case 'ограждение': return '#2196f3';
      case 'очарование': return '#ff9800';
      case 'преобразование': return '#4caf50';
      case 'прорицание': return '#ffeb3b';
      case 'evocation': return '#f44336';
      case 'conjuration': return '#9c27b0';
      case 'illusion': return '#9e9e9e';
      case 'necromancy': return '#000000';
      case 'abjuration': return '#2196f3';
      case 'enchantment': return '#ff9800';
      case 'transmutation': return '#4caf50';
      case 'divination': return '#ffeb3b';
      default: return '#9e9e9e';
    }
  };

  // Format classes for display
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes;
  };

  // Modal handlers
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSpell(null), 300);
  };

  // Function to load spells for a specific character class and level
  const loadSpellsForCharacter = (characterClass: string, characterLevel: number) => {
    const maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
    
    const filteredSpells = spells.filter(spell => {
      // Check spell level
      if (spell.level > maxSpellLevel) return false;
      
      // Check if spell is available for the character's class
      if (!spell.classes) return false;
      
      const spellClasses = Array.isArray(spell.classes) 
        ? spell.classes 
        : [spell.classes];
      
      return spellClasses.some(cls => 
        cls.toLowerCase() === characterClass.toLowerCase()
      );
    });
    
    setAvailableSpells(filteredSpells);
    return filteredSpells;
  };

  // Function to toggle selection of a spell
  const toggleSpellSelection = (spell: SpellData) => {
    setSelectedSpells(prevSelected => {
      const isAlreadySelected = prevSelected.some(s => s.name === spell.name);
      
      if (isAlreadySelected) {
        return prevSelected.filter(s => s.name !== spell.name);
      } else {
        const characterSpell = convertSpellDataToCharacterSpell(spell);
        return [...prevSelected, characterSpell];
      }
    });
  };

  // Function to check if a spell is selected
  const isSpellSelected = (spellName: string) => {
    return selectedSpells.some(spell => spell.name === spellName);
  };

  return {
    filteredSpells,
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
    currentTheme,
    selectedSpells,
    setSelectedSpells,
    availableSpells,
    loadSpellsForCharacter,
    toggleSpellSelection,
    isSpellSelected,
    importSpellsFromText
  };
};

export type UseSpellbookReturn = ReturnType<typeof useSpellbook>;
