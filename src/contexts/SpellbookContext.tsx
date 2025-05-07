import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { SpellData } from '@/types/spells';
import { CharacterSpell, Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';
import { filterSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import { convertCharacterSpellToSpellData } from '@/types/spells';

export interface SpellbookContextProps {
  spells: SpellData[];
  filteredSpells: SpellData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  selectedSpells: SpellData[]; // Добавляем selectedSpells
  setSelectedSpells: (spells: SpellData[]) => void; // Добавляем сеттер для selectedSpells
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  loadSpellsForClass: (className: string) => void;
  loadSpellsForCharacter: (className: string, level: number) => void;
  selectedSpell: SpellData | null;
  isModalOpen: boolean;
  handleOpenSpell: (spell: SpellData) => void;
  handleClose: () => void;
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  formatClasses: (classes: string | string[]) => string;
  isLoading: boolean; // Добавляем свойство isLoading
}

export const SpellbookContext = createContext<SpellbookContextProps | undefined>(undefined);

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]); // Добавляем state для selectedSpells
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Добавляем state для isLoading
  const { theme } = useTheme();
  const { toast } = useToast();

  // Загрузка заклинаний при инициализации
  useEffect(() => {
    const loadSpells = async () => {
      try {
        setIsLoading(true);
        const allSpellsData = getAllSpells();
        setSpells(allSpellsData);
        setFilteredSpells(allSpellsData);
      } catch (error) {
        console.error("Error loading spells:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSpells();
  }, []);

  // Получаем все уровни, школы и классы из заклинаний
  const allLevels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
  const allSchools = [...new Set(spells.map(spell => spell.school))];
  const allClasses = [...new Set(spells.flatMap(spell => {
    if (Array.isArray(spell.classes)) return spell.classes;
    else if (typeof spell.classes === 'string') return [spell.classes];
    return [];
  }))].filter(Boolean);

  // Цвета для уровней заклинаний
  const levelColors: Record<number, string> = {
    0: '#808080',   // Grey
    1: '#007bff',   // Blue
    2: '#28a745',   // Green
    3: '#dc3545',   // Red
    4: '#ffc107',  // Yellow
    5: '#17a2b8',   // Cyan
    6: '#fd7e14',   // Orange
    7: '#6f42c1',   // Indigo
    8: '#e83e8c',   // Pink
    9: '#6c757d'    // Dark Grey
  };

  // Цвета для школ магии
  const schoolColors: Record<string, string> = {
    Abjuration: '#4287f5',    // Blue
    Conjuration: '#28a745',   // Green
    Divination: '#ffc107',    // Yellow
    Enchantment: '#e83e8c',   // Pink
    Evocation: '#dc3545',     // Red
    Illusion: '#6f42c1',      // Indigo
    Necromancy: '#000000',    // Black
    Transmutation: '#fd7e14'  // Orange
  };

  // Функция для форматирования классов
  const formatClasses = (classes: string | string[]): string => {
    if (typeof classes === 'string') {
      return classes;
    }
    return classes.join(', ');
  };

  // Функция для получения цвета бейджа в зависимости от уровня
  const getBadgeColor = (level: number): string => {
    return levelColors[level] || '#999';
  };

  // Функция для получения цвета школы магии
  const getSchoolBadgeColor = (school: string): string => {
    return schoolColors[school] || '#999';
  };

  // Функция для загрузки заклинаний по классу
  const loadSpellsForClass = useCallback((className: string) => {
    try {
      const allSpellsData = getAllSpells();
      const classSpells = allSpellsData.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(c => typeof c === 'string' && c.toLowerCase().includes(className.toLowerCase()));
        } else if (typeof spell.classes === 'string') {
          return spell.classes.toLowerCase().includes(className.toLowerCase());
        }
        return false;
      });
      setSpells(classSpells);
      setFilteredSpells(classSpells);
    } catch (error) {
      console.error("Error loading spells for class:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заклинания для класса.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Функция для загрузки заклинаний для персонажа (с учетом уровня)
  const loadSpellsForCharacter = useCallback((className: string, level: number) => {
    try {
      const allSpellsData = getAllSpells();
      const classAndLevelSpells = filterSpellsByClassAndLevel(allSpellsData, className, undefined);
      
      // Преобразуем CharacterSpell в SpellData если необходимо
      const spellDataArray = classAndLevelSpells.map(spell => {
        if ('id' in spell && typeof spell.id !== 'undefined') {
          return spell as SpellData;
        } else {
          return convertCharacterSpellToSpellData(spell as CharacterSpell);
        }
      });
      
      setSpells(spellDataArray);
      setFilteredSpells(spellDataArray);
    } catch (error) {
      console.error("Error loading spells for character:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заклинания для персонажа.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Обработчики для фильтров
  const toggleLevel = (level: number) => {
    setActiveLevel(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev =>
      prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
    );
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
    setFilteredSpells(spells);
  };

  // Обработчики для модального окна
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedSpell(null);
    setIsModalOpen(false);
  };

  // useEffect для фильтрации заклинаний
  useEffect(() => {
    let results = spells;

    if (searchTerm) {
      results = results.filter(spell =>
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.school.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeLevel.length > 0) {
      results = results.filter(spell => activeLevel.includes(spell.level));
    }

    if (activeSchool.length > 0) {
      results = results.filter(spell => activeSchool.includes(spell.school));
    }

    if (activeClass.length > 0) {
      results = results.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(c => activeClass.includes(c));
        } else if (typeof spell.classes === 'string') {
          return activeClass.includes(spell.classes);
        }
        return false;
      });
    }

    setFilteredSpells(results);
  }, [spells, searchTerm, activeLevel, activeSchool, activeClass]);

  const value = {
    spells,
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    selectedSpells, // Добавляем в контекст
    setSelectedSpells, // Добавляем в контекст
    allLevels,
    allSchools,
    allClasses,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    loadSpellsForClass,
    loadSpellsForCharacter,
    selectedSpell,
    isModalOpen,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    isLoading // Добавляем isLoading в контекст
  };

  return (
    <SpellbookContext.Provider value={value}>
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};
