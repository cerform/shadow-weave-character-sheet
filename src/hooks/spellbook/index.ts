// Re-export everything from the module
export * from './filterUtils';
export * from './themeUtils';
export * from './importUtils';
export * from './types';

import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from './types';
import { CharacterSpell } from '@/types/character.d';
import { 
  getAllLevels, 
  getAllSchools, 
  getAllClasses, 
  getBadgeColorByLevel,
  getSchoolBadgeColor,
  formatClassesString
} from './filterUtils';
import { convertToSpellData, convertToCharacterSpell } from './types';

export const importSpellsFromText = (text: string): CharacterSpell[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    // Simple parsing logic - this is a basic implementation
    // Split the text by double newlines which typically separate spell entries
    const spellBlocks = text.split(/\n\n+/);
    const spells: CharacterSpell[] = [];
    
    for (const block of spellBlocks) {
      if (!block.trim()) continue;
      
      // Try to extract the name from the first line
      const lines = block.split('\n');
      const nameMatch = lines[0]?.match(/^([А-Яа-яЁё\w\s]+)/);
      
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        // Try to determine the level from the text
        let level = 0; // Default to cantrip
        const levelMatch = block.match(/(\d)(й|го|ый|ой)?\s+уров(ень|ня)/i);
        if (levelMatch) {
          level = parseInt(levelMatch[1]);
        } else if (block.toLowerCase().includes('заговор')) {
          level = 0;
        }
        
        // Try to determine the school
        let school = 'Неизвестная';
        const schoolRegex = /(воплощени[еяй]|некромантия|очаровани[еяй]|преобразовани[еяй]|вызов|огражд[ае]ни[еяй]|иллюзи[еяй])/i;
        const schoolMatch = block.match(schoolRegex);
        if (schoolMatch) {
          school = schoolMatch[1].charAt(0).toUpperCase() + schoolMatch[1].slice(1).toLowerCase();
        }
        
        // Add the parsed spell
        spells.push({
          name,
          level,
          school,
          prepared: false,
          description: block
        });
      }
    }
    
    return spells;
  } catch (error) {
    console.error("Error parsing spell text:", error);
    return [];
  }
};

export const useSpellbook = () => {
  const [spellsData, setSpellsData] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Все возможные уровни, школы и классы
  const allLevels = getAllLevels(spellsData);
  const allSchools = getAllSchools(spellsData);
  const allClasses = getAllClasses(spellsData);
  
  // Обработчики открытия и закрытия модального окна
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  const handleClose = () => {
    setSelectedSpell(null);
    setIsModalOpen(false);
  };
  
  // Обработчики для фильтров
  const toggleLevel = (level: number) => {
    setActiveLevel(prev =>
      prev.includes(level) ? prev.filter(item => item !== level) : [...prev, level]
    );
  };
  
  const toggleSchool = (school: string) => {
    setActiveSchool(prev =>
      prev.includes(school) ? prev.filter(item => item !== school) : [...prev, school]
    );
  };
  
  const toggleClass = (className: string) => {
    setActiveClass(prev =>
      prev.includes(className) ? prev.filter(item => item !== className) : [...prev, className]
    );
  };
  
  // Очистка фильтров
  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
  };
  
  // Цвета для уровней и школ
  const getBadgeColor = (level: number) => getBadgeColorByLevel(level);
  const getSchoolBadgeColorFunc = (school: string) => getSchoolBadgeColor(school);
  
  const formatClasses = (classes: string[] | string | undefined) => formatClassesString(classes);
  
  // Преобразование CharacterSpell[] в SpellData[]
  const convertCharacterSpellsToSpellData = (characterSpells: CharacterSpell[]): SpellData[] => {
    return characterSpells.map(convertToSpellData);
  };
  
  // Эффект для фильтрации заклинаний
  const filteredSpells = (() => {
    let filtered = [...spellsData];
    
    if (searchTerm) {
      filtered = filterSpellsBySearchTerm(filtered, searchTerm);
    }
    
    if (activeLevel.length > 0) {
      filtered = filterSpellsByLevel(filtered, activeLevel);
    }
    
    if (activeSchool.length > 0) {
      filtered = filterSpellsBySchool(filtered, activeSchool);
    }
    
    if (activeClass.length > 0) {
      filtered = filterSpellsByClass(filtered, activeClass);
    }
    
    return filtered;
  })();
  
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
    getSchoolBadgeColor: getSchoolBadgeColorFunc,
    formatClasses,
    importSpellsFromText,
    convertCharacterSpellsToSpellData
  };
};
