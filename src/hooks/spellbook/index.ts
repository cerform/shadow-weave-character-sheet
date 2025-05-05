
import { useState, useEffect } from 'react';
import { spells as allSpells } from '@/data/spells';
import { SpellData, UseSpellbookReturn, convertToCharacterSpell } from './types';
import { 
  filterSpellsBySearchTerm, 
  filterSpellsByLevel, 
  filterSpellsBySchool,
  filterSpellsByClass,
  extractClasses,
  formatClasses,
  convertToSpellData,
  convertCharacterSpellsToSpellData
} from './filterUtils';
import { useSpellTheme } from './themeUtils';
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText as importSpellsFromTextUtil } from './importUtils';

export * from './types';
export { importSpellsFromTextUtil as importSpellsFromText };

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
  const allClasses = extractClasses(allSpells);

  useEffect(() => {
    // Преобразуем в SpellData[] для совместимости
    if (allSpells && allSpells.length > 0) {
      const spellDataArray = convertCharacterSpellsToSpellData(allSpells);
      setFilteredSpells(spellDataArray);
    } else {
      console.error('Не удалось загрузить заклинания из модуля');
      setFilteredSpells([]);
    }
  }, []);

  useEffect(() => {
    let result = [...allSpells];

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      result = filterSpellsBySearchTerm(result, searchTerm);
    }

    // Фильтрация по уровням
    if (activeLevel.length > 0) {
      result = filterSpellsByLevel(result, activeLevel);
    }

    // Фильтрация по школам
    if (activeSchool.length > 0) {
      result = filterSpellsBySchool(result, activeSchool);
    }

    // Фильтрация по классам
    if (activeClass.length > 0) {
      result = filterSpellsByClass(result, activeClass);
    }

    // Преобразуем в SpellData[] для совместимости
    const spellDataArray = convertCharacterSpellsToSpellData(result);
    setFilteredSpells(spellDataArray);
    
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

  // Получаем уникальные значения из заклинаний
  const allLevels: number[] = Array.from(
    new Set(allSpells.map(spell => spell.level || 0))
  ).sort((a, b) => a - b);
  
  const allSchools: string[] = Array.from(
    new Set(allSpells.map(spell => spell.school || ''))
  ).filter(Boolean).sort();

  // Updated signature to match the expected one in the UseSpellbookReturn interface
  const importSpellsFromText = (text: string): CharacterSpell[] => {
    return importSpellsFromTextUtil(text, []);
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
    importSpellsFromText,
    convertCharacterSpellsToSpellData
  };
};
