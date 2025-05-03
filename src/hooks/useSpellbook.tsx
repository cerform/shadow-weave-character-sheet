
import { useState, useEffect } from 'react';
import { spells as allSpells } from '@/data/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id?: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes?: string[] | string;
  source?: string;
  isRitual?: boolean;
  isConcentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}

export const useSpellbook = () => {
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Extract unique classes from spells
  const extractClasses = (): string[] => {
    const classesSet = new Set<string>();
    
    allSpells.forEach(spell => {
      if (typeof spell.classes === 'string') {
        // If classes is a string, split it by commas
        const classesString = spell.classes as string;
        classesString.split(',').forEach(cls => 
          classesSet.add(cls.trim())
        );
      } else if (Array.isArray(spell.classes)) {
        // If classes is an array, add each element
        (spell.classes as string[]).forEach(cls => {
          if (typeof cls === 'string') {
            classesSet.add(cls.trim());
          }
        });
      }
    });
    
    return Array.from(classesSet).sort();
  };

  const allClasses = extractClasses();
  
  const getBadgeColor = (level: number) => {
    // Colors based on the selected theme
    const levelColors: { [key: number]: string } = {
      0: `bg-stone-800 text-white border border-${currentTheme.accent}`,
      1: `bg-blue-900 text-white border border-${currentTheme.accent}`,
      2: `bg-green-900 text-white border border-${currentTheme.accent}`,
      3: `bg-yellow-900 text-white border border-${currentTheme.accent}`,
      4: `bg-orange-900 text-white border border-${currentTheme.accent}`,
      5: `bg-red-900 text-white border border-${currentTheme.accent}`,
      6: `bg-purple-900 text-white border border-${currentTheme.accent}`,
      7: `bg-pink-900 text-white border border-${currentTheme.accent}`,
      8: `bg-indigo-900 text-white border border-${currentTheme.accent}`,
      9: `bg-cyan-900 text-white border border-${currentTheme.accent}`,
    };

    return levelColors[level] || "bg-gray-800 text-white";
  };

  const getSchoolBadgeColor = (school: string) => {
    const schoolColors: { [key: string]: string } = {
      'Преобразование': 'bg-blue-900 text-white',
      'Воплощение': 'bg-red-900 text-white',
      'Вызов': 'bg-orange-900 text-white',
      'Прорицание': 'bg-purple-900 text-white',
      'Очарование': 'bg-pink-900 text-white',
      'Иллюзия': 'bg-indigo-900 text-white',
      'Некромантия': 'bg-green-900 text-white',
      'Ограждение': 'bg-yellow-900 text-white',
    };

    return schoolColors[school] || "bg-gray-800 text-white";
  };

  useEffect(() => {
    // Convert CharacterSpell[] to SpellData[]
    if (allSpells && allSpells.length > 0) {
      const convertedSpells: SpellData[] = allSpells.map(spell => ({
        ...spell,
        // Ensure properties match the SpellData interface
        isRitual: spell.ritual || false,
        isConcentration: spell.concentration || false
      }));
      setFilteredSpells(convertedSpells);
    } else {
      console.error('Не удалось загрузить заклинания из модуля');
      setFilteredSpells([]);
    }
  }, []);

  useEffect(() => {
    let result = [...allSpells];

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        spell => 
          spell.name.toLowerCase().includes(term) || 
          (spell.description && spell.description.toLowerCase().includes(term)) ||
          (spell.classes && (
            (typeof spell.classes === 'string' && spell.classes.toLowerCase().includes(term)) ||
            (Array.isArray(spell.classes) && (spell.classes as string[]).some(cls => {
              // Check that cls is a string before calling toLowerCase
              return typeof cls === 'string' && cls.toLowerCase().includes(term);
            }))
          ))
      );
    }

    // Filter by levels (if levels are selected)
    if (activeLevel.length > 0) {
      result = result.filter(spell => activeLevel.includes(spell.level));
    }

    // Filter by schools (if schools are selected)
    if (activeSchool.length > 0) {
      result = result.filter(spell => activeSchool.includes(spell.school));
    }

    // Filter by classes (if classes are selected)
    if (activeClass.length > 0) {
      result = result.filter(spell => {
        if (typeof spell.classes === 'string') {
          // Check if the classes string contains any of the selected classes
          const spellClassesStr = spell.classes;
          return activeClass.some(cls => 
            spellClassesStr.toLowerCase().includes(cls.toLowerCase())
          );
        } else if (Array.isArray(spell.classes)) {
          // Check if the classes array contains any of the selected classes
          return (spell.classes as string[]).some(spellClass => {
            if (typeof spellClass !== 'string') return false;
            return activeClass.some(cls => 
              spellClass.toLowerCase().includes(cls.toLowerCase())
            );
          });
        }
        return false;
      });
    }

    // Convert CharacterSpell[] to SpellData[]
    const convertedSpells: SpellData[] = result.map(spell => ({
      ...spell,
      isRitual: spell.ritual || false,
      isConcentration: spell.concentration || false
    }));
    
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

  const allLevels = Array.from(new Set(allSpells.map(spell => spell.level))).sort();
  const allSchools = Array.from(new Set(allSpells.map(spell => spell.school))).sort();
  
  // Convert classes from array to string for display
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
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
  };
};
