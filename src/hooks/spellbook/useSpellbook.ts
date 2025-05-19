
import { useState, useEffect, useMemo } from 'react';
import { SpellData } from '@/types/spells';
import { allSpells } from '@/data/spells';
import { filterSpellsByText, filterSpellsByLevel, filterSpellsBySchool, filterSpellsByClass } from './filterUtils';
import { UseSpellbookReturn } from './types';
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText } from '@/utils/spellBatchImporter';

export const useSpellbook = (): UseSpellbookReturn => {
  // State for filtered spells
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Convert CharacterSpell[] to SpellData[]
  const spells: SpellData[] = useMemo(() => {
    return allSpells.map(spell => ({
      id: spell.id || spell.name.toLowerCase().replace(/\s/g, '-'),
      name: spell.name,
      level: spell.level,
      school: spell.school || '',
      castingTime: spell.castingTime || '',
      range: spell.range || '',
      components: spell.components || '',
      duration: spell.duration || '',
      description: Array.isArray(spell.description) 
        ? spell.description.join('\n') 
        : (spell.description || ''),
      classes: Array.isArray(spell.classes) 
        ? spell.classes 
        : (spell.classes ? [spell.classes] : []),
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      prepared: spell.prepared || false,
      materials: spell.materials || '',
      higherLevels: spell.higherLevel || spell.higherLevels || '',
      source: spell.source || 'PHB'
    }));
  }, [allSpells]);

  // Get unique values for filters
  const allLevels = useMemo(() => {
    const levels = [...new Set(spells.map(spell => spell.level))];
    return levels.sort((a, b) => a - b);
  }, [spells]);

  const allSchools = useMemo(() => {
    const schools = [...new Set(spells.map(spell => spell.school))];
    return schools.filter(Boolean).sort();
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
    return [...classes].sort();
  }, [spells]);

  // Filter spells based on all active filters
  const filteredSpells = useMemo(() => {
    let result = [...spells];

    // Apply text search filter
    if (searchTerm) {
      result = filterSpellsByText(result, searchTerm);
    }

    // Apply level filter
    if (activeLevel.length > 0) {
      result = filterSpellsByLevel(result, activeLevel);
    }

    // Apply school filter
    if (activeSchool.length > 0) {
      result = filterSpellsBySchool(result, activeSchool);
    }

    // Apply class filter
    if (activeClass.length > 0) {
      result = filterSpellsByClass(result, activeClass);
    }

    return result;
  }, [spells, searchTerm, activeLevel, activeSchool, activeClass]);

  // Theme setup
  const currentTheme = {
    primary: '#7c3aed',
    secondary: '#a78bfa',
    accent: '#c4b5fd',
    background: '#1e1b4b',
    text: '#f5f3ff',
    surface: '#312e81'
  };

  // Handlers
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedSpell(null);
    }, 200);
  };

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

  const getBadgeColor = (level: number) => {
    const colors = {
      0: 'bg-gray-700',
      1: 'bg-blue-700',
      2: 'bg-green-700',
      3: 'bg-yellow-700',
      4: 'bg-orange-700',
      5: 'bg-red-700',
      6: 'bg-purple-700',
      7: 'bg-pink-700',
      8: 'bg-indigo-700',
      9: 'bg-teal-700'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-700';
  };

  const getSchoolBadgeColor = (school: string) => {
    const colors: { [key: string]: string } = {
      'Abjuration': 'bg-blue-700',
      'Conjuration': 'bg-yellow-700',
      'Divination': 'bg-cyan-700',
      'Enchantment': 'bg-pink-700',
      'Evocation': 'bg-red-700',
      'Illusion': 'bg-purple-700',
      'Necromancy': 'bg-green-700', 
      'Transmutation': 'bg-orange-700'
    };
    return colors[school] || 'bg-gray-700';
  };

  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes.toString();
  };

  // Функция импорта заклинаний из текста
  const importSpellsFromTextWrapper = (text: string, existingSpells: CharacterSpell[]): CharacterSpell[] => {
    try {
      return importSpellsFromText(text, existingSpells);
    } catch (error) {
      console.error('Ошибка при импорте заклинаний:', error);
      return existingSpells;
    }
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
    importSpellsFromText: importSpellsFromTextWrapper
  };
};
