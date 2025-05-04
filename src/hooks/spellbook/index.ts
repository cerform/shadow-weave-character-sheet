
import { useState, useEffect } from 'react';
import { spells as allSpells } from '@/data/spells';
import { SpellData, UseSpellbookReturn } from './types';
import { 
  filterSpellsBySearchTerm, 
  filterSpellsByLevel, 
  filterSpellsBySchool,
  filterSpellsByClass,
  extractClasses,
  formatClasses,
  convertToSpellData,
  isString,
  isStringArray
} from './filterUtils';
import { useSpellTheme } from './themeUtils';
import { importSpellsFromText as importSpellsFromTextUtil } from './importUtils';
import { CharacterSpell } from '@/types/character';

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
    // Преобразуем CharacterSpell[] в SpellData[]
    if (allSpells && allSpells.length > 0) {
      const convertedSpells: SpellData[] = allSpells.map(spell => ({
        id: spell.id,
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
        higherLevel: spell.higherLevels || '',
      }));
      setFilteredSpells(convertedSpells);
    } else {
      console.error('Не удалось загрузить заклинания из модуля');
      setFilteredSpells([]);
    }
  }, []);

  useEffect(() => {
    let result = [...allSpells];

    // Фильтрация по поисковому запросу
    result = filterSpellsBySearchTerm(result, searchTerm);

    // Фильтрация по уровням
    result = filterSpellsByLevel(result, activeLevel);

    // Фильтрация по школам
    result = filterSpellsBySchool(result, activeSchool);

    // Фильтрация по классам
    result = filterSpellsByClass(result, activeClass);

    // Преобразуем CharacterSpell[] в SpellData[]
    const convertedSpells: SpellData[] = result.map(spell => ({
      id: spell.id,
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
      higherLevel: spell.higherLevels || '',
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

  const importSpells = (textData: string) => {
    // Этот метод будет обновлять данные в data/spells
  };

  const allLevels = Array.from(new Set(allSpells.map(spell => spell.level))).sort();
  const allSchools = Array.from(new Set(allSpells.map(spell => spell.school))).sort();

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
    importSpellsFromText: importSpellsFromTextUtil
  };
};

export default useSpellbook;
