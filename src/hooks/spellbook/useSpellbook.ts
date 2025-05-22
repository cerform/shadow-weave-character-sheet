
import { useState, useEffect, useMemo } from 'react';
import { SpellData } from '@/types/spells';
import { allSpells } from '@/data/spells';
import { 
  filterSpellsByText, 
  filterSpellsByLevel, 
  filterSpellsBySchool, 
  filterSpellsByClass, 
  filterSpellsByRitual, 
  filterSpellsByConcentration,
  filterSpellsByComponents,
  filterSpellsByCastingTime,
  filterSpellsByRange,
  filterSpellsByDuration,
  filterSpellsBySource
} from './filterUtils';
import { UseSpellbookReturn } from './types';
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText } from '@/utils/spellBatchImporter';

export const useSpellbook = (): UseSpellbookReturn => {
  // Базовые фильтры
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRitualOnly, setIsRitualOnly] = useState<boolean>(false);
  const [isConcentrationOnly, setIsConcentrationOnly] = useState<boolean>(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState<boolean>(false);
  
  // Расширенные фильтры
  const [verbalComponent, setVerbalComponent] = useState<boolean | null>(null);
  const [somaticComponent, setSomaticComponent] = useState<boolean | null>(null);
  const [materialComponent, setMaterialComponent] = useState<boolean | null>(null);
  const [activeCastingTimes, setActiveCastingTimes] = useState<string[]>([]);
  const [activeRangeTypes, setActiveRangeTypes] = useState<string[]>([]);
  const [activeDurationTypes, setActiveDurationTypes] = useState<string[]>([]);
  const [activeSources, setActiveSources] = useState<string[]>([]);

  // Доступные значения для расширенных фильтров
  const castingTimes = ['action', 'bonus', 'reaction', 'minute', 'hour'];
  const rangeTypes = ['self', 'touch', 'short', 'medium', 'long'];
  const durationTypes = ['instant', 'round', 'minute', 'hour', 'day', 'permanent'];
  const sources = ['PHB', 'XGE', 'TCE', 'SCAG', 'EE', 'AI', 'WGE', 'IDRotF', 'FTD', 'SCC', 'UA', 'HB'];

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
      higherLevels: spell.higherLevels || '',
      source: spell.source || 'PHB'
    }));
  }, []);

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

  // Enhanced filter spells based on all active filters
  const filteredSpells = useMemo(() => {
    let result = [...spells];

    // Базовые фильтры
    if (searchTerm) {
      result = filterSpellsByText(result, searchTerm);
    }

    if (activeLevel.length > 0) {
      result = filterSpellsByLevel(result, activeLevel);
    }

    if (activeSchool.length > 0) {
      result = filterSpellsBySchool(result, activeSchool);
    }

    if (activeClass.length > 0) {
      result = filterSpellsByClass(result, activeClass);
    }

    if (isRitualOnly) {
      result = filterSpellsByRitual(result, true);
    }

    if (isConcentrationOnly) {
      result = filterSpellsByConcentration(result, true);
    }
    
    // Расширенные фильтры
    if (verbalComponent !== null || somaticComponent !== null || materialComponent !== null) {
      result = filterSpellsByComponents(result, verbalComponent, somaticComponent, materialComponent);
    }
    
    if (activeCastingTimes.length > 0) {
      result = filterSpellsByCastingTime(result, activeCastingTimes);
    }
    
    if (activeRangeTypes.length > 0) {
      result = filterSpellsByRange(result, activeRangeTypes);
    }
    
    if (activeDurationTypes.length > 0) {
      result = filterSpellsByDuration(result, activeDurationTypes);
    }
    
    if (activeSources.length > 0) {
      result = filterSpellsBySource(result, activeSources);
    }

    return result;
  }, [
    spells, 
    searchTerm, 
    activeLevel, 
    activeSchool, 
    activeClass, 
    isRitualOnly, 
    isConcentrationOnly,
    verbalComponent,
    somaticComponent,
    materialComponent,
    activeCastingTimes,
    activeRangeTypes,
    activeDurationTypes,
    activeSources
  ]);

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

  // Enhanced toggle level handler with multi-select
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  // Enhanced toggle school handler with multi-select
  const toggleSchool = (school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  };

  // Enhanced toggle class handler with multi-select
  const toggleClass = (className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  // Toggle ritual filter
  const toggleRitualOnly = () => {
    setIsRitualOnly(prev => !prev);
  };

  // Toggle concentration filter
  const toggleConcentrationOnly = () => {
    setIsConcentrationOnly(prev => !prev);
  };

  // Toggle advanced filters panel
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(prev => !prev);
  };
  
  // Toggle casting time filter
  const toggleCastingTime = (time: string) => {
    setActiveCastingTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time];
      }
    });
  };
  
  // Toggle range filter
  const toggleRangeType = (range: string) => {
    setActiveRangeTypes(prev => {
      if (prev.includes(range)) {
        return prev.filter(r => r !== range);
      } else {
        return [...prev, range];
      }
    });
  };
  
  // Toggle duration filter
  const toggleDurationType = (duration: string) => {
    setActiveDurationTypes(prev => {
      if (prev.includes(duration)) {
        return prev.filter(d => d !== duration);
      } else {
        return [...prev, duration];
      }
    });
  };
  
  // Toggle source filter
  const toggleSource = (source: string) => {
    setActiveSources(prev => {
      if (prev.includes(source)) {
        return prev.filter(s => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  // Clear all filters at once
  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setIsRitualOnly(false);
    setIsConcentrationOnly(false);
    clearAdvancedFilters();
  };
  
  // Clear only advanced filters
  const clearAdvancedFilters = () => {
    setVerbalComponent(null);
    setSomaticComponent(null);
    setMaterialComponent(null);
    setActiveCastingTimes([]);
    setActiveRangeTypes([]);
    setActiveDurationTypes([]);
    setActiveSources([]);
  };

  // Enhanced color mapping for level badges
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

  // Enhanced color mapping for school badges
  const getSchoolBadgeColor = (school: string) => {
    const colors: { [key: string]: string } = {
      'Abjuration': 'bg-blue-700',
      'Conjuration': 'bg-yellow-700',
      'Divination': 'bg-cyan-700',
      'Enchantment': 'bg-pink-700',
      'Evocation': 'bg-red-700',
      'Illusion': 'bg-purple-700',
      'Necromancy': 'bg-green-700', 
      'Transmutation': 'bg-orange-700',
      'Ограждение': 'bg-blue-700',
      'Вызов': 'bg-yellow-700',
      'Прорицание': 'bg-cyan-700',
      'Очарование': 'bg-pink-700',
      'Воплощение': 'bg-red-700',
      'Иллюзия': 'bg-purple-700',
      'Некромантия': 'bg-green-700', 
      'Преобразование': 'bg-orange-700'
    };
    return colors[school] || 'bg-gray-700';
  };

  // Enhanced class formatter to handle different class formats
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes.toString();
  };

  // Импорт заклинаний из текста
  const importSpellsFromTextWrapper = (text: string, existingSpells: CharacterSpell[]): CharacterSpell[] => {
    try {
      return importSpellsFromText(text, existingSpells);
    } catch (error) {
      console.error('Ошибка при импорте заклинаний:', error);
      return existingSpells;
    }
  };

  // Загрузка заклинаний
  const loadSpells = () => {
    console.info(`Загружено заклинаний: ${spells.length}`);
    return spells;
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
    importSpellsFromText: importSpellsFromTextWrapper,
    isRitualOnly,
    isConcentrationOnly,
    toggleRitualOnly,
    toggleConcentrationOnly,
    advancedFiltersOpen,
    toggleAdvancedFilters,
    loadSpells,
    
    // Расширенные фильтры
    verbalComponent,
    setVerbalComponent,
    somaticComponent,
    setSomaticComponent,
    materialComponent,
    setMaterialComponent,
    castingTimes,
    activeCastingTimes,
    toggleCastingTime,
    rangeTypes,
    activeRangeTypes,
    toggleRangeType,
    durationTypes,
    activeDurationTypes,
    toggleDurationType,
    sources,
    activeSources,
    toggleSource,
    clearAdvancedFilters
  };
};
