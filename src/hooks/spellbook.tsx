
import { useState, useEffect } from 'react';
import { useTheme } from './use-theme';
import { themes } from '@/lib/themes';
import { spells } from '@/data/spells';
import { SpellData, UseSpellbookReturn } from './spellbook/types';
import { 
  filterSpellsBySearchTerm, 
  filterSpellsByLevel, 
  filterSpellsBySchool,
  filterSpellsByClass,
  formatClasses,
  convertToSpellData,
  isString,
  isStringArray,
  safeJoin,
  extractClasses
} from './spellbook/filterUtils';
import { useSpellTheme } from './spellbook/themeUtils';
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText as importFromText } from './spellbook/importUtils';

// Экспортируем типы, чтобы они были доступны при импорте
export * from './spellbook/types';

// Экспортируем функцию importSpellsFromText
export const importSpellsFromText = (text: string): CharacterSpell[] => {
  try {
    // Разделяем текст на строки
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Паттерн для определения заклинаний
    const spellPattern = /^(.+) \((\d)(?:st|nd|rd|th) уровень\)$/;
    const cantripsPattern = /^(.+) \(заговор\)$/;
    
    const spells: CharacterSpell[] = [];
    
    lines.forEach(line => {
      let match = line.match(spellPattern);
      
      if (match) {
        const [, name, levelStr] = match;
        const level = parseInt(levelStr);
        
        spells.push({
          name: name.trim(),
          level,
          description: '',
          school: ''
        });
      } else {
        match = line.match(cantripsPattern);
        if (match) {
          const [, name] = match;
          
          spells.push({
            name: name.trim(),
            level: 0,
            description: '',
            school: ''
          });
        }
      }
    });
    
    return spells;
  } catch (error) {
    console.error('Ошибка при импорте заклинаний из текста:', error);
    return [];
  }
};

export const useSpellbook = (): UseSpellbookReturn => {
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  
  const { currentTheme, getBadgeColor, getSchoolBadgeColor } = useSpellTheme();
  
  // Извлечение уникальных классов из заклинаний
  const allClasses = extractClasses(spells);

  useEffect(() => {
    // Преобразуем CharacterSpell[] в SpellData[]
    if (spells && spells.length > 0) {
      const convertedSpells: SpellData[] = spells.map(convertToSpellData);
      setFilteredSpells(convertedSpells);
    } else {
      console.error('Не удалось загрузить заклинания из модуля');
      setFilteredSpells([]);
    }
  }, []);

  useEffect(() => {
    let result = [...spells];

    // Фильтрация по поисковому запросу
    result = filterSpellsBySearchTerm(result, searchTerm);

    // Фильтрация по уровням
    result = filterSpellsByLevel(result, activeLevel);

    // Фильтрация по школам
    result = filterSpellsBySchool(result, activeSchool);

    // Фильтрация по классам
    result = filterSpellsByClass(result, activeClass);

    // Преобразуем CharacterSpell[] в SpellData[]
    const convertedSpells: SpellData[] = result.map(convertToSpellData);
    
    setFilteredSpells(convertedSpells);
  }, [searchTerm, activeLevel, activeSchool, activeClass]);

  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
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
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };

  const allLevels = Array.from(new Set(spells.map(spell => {
    if (typeof spell === 'object' && spell && typeof spell.level === 'number') {
      return spell.level;
    }
    return 0;
  }))).sort();
  
  const allSchools = Array.from(new Set(spells.map(spell => {
    if (typeof spell === 'object' && spell && spell.school) {
      return spell.school;
    }
    return "Преобразование";
  }))).sort();

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
    allLevels: Array.from(new Set(spells.map(spell => spell.level))).sort(),
    allSchools: Array.from(new Set(spells.map(spell => spell.school || "Преобразование"))).sort(),
    allClasses,
    handleOpenSpell: (spell: SpellData) => {
      setSelectedSpell(spell);
      setIsModalOpen(true);
    },
    handleClose: () => {
      setIsModalOpen(false);
    },
    toggleLevel: (level: number) => {
      setActiveLevel(prev => {
        if (prev.includes(level)) {
          return prev.filter(l => l !== level);
        } else {
          return [...prev, level];
        }
      });
    },
    toggleSchool: (school: string) => {
      setActiveSchool(prev => {
        if (prev.includes(school)) {
          return prev.filter(s => s !== school);
        } else {
          return [...prev, school];
        }
      });
    },
    toggleClass: (className: string) => {
      setActiveClass(prev => {
        if (prev.includes(className)) {
          return prev.filter(c => c !== className);
        } else {
          return [...prev, className];
        }
      });
    },
    clearFilters: () => {
      setActiveLevel([]);
      setActiveSchool([]);
      setActiveClass([]);
      setSearchTerm('');
    },
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    importSpellsFromText
  };
};
