
import { useState, useEffect } from 'react';
import { SpellData, SpellFilter } from '@/types/spells';
import { getAllSpells, filterSpells } from '@/data/spells/index';
import { 
  convertCharacterSpellsToSpellData, 
  convertToSpellData,
  getAllSpellClasses,
  getAllSpellSchools
} from '@/utils/spellHelpers';

export const useSpellbook = () => {
  const [allSpells, setAllSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка заклинаний
  useEffect(() => {
    const loadSpells = async () => {
      try {
        setIsLoading(true);
        const characterSpells = getAllSpells();
        
        // Конвертируем заклинания в формат SpellData
        const spellsData = convertCharacterSpellsToSpellData(characterSpells);
        
        setAllSpells(spellsData);
        setFilteredSpells(spellsData);
      } catch (error) {
        console.error('Ошибка при загрузке заклинаний:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSpells();
  }, []);

  // Фильтрация заклинаний
  useEffect(() => {
    let results = allSpells;

    if (searchTerm) {
      results = results.filter(spell =>
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof spell.description === 'string' && spell.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [allSpells, searchTerm, activeLevel, activeSchool, activeClass]);

  // Получение всех уникальных уровней заклинаний
  const allLevels = [...new Set(allSpells.map(spell => spell.level))].sort((a, b) => a - b);
  
  // Получение всех уникальных школ магии
  const allSchools = getAllSpellSchools(allSpells);
  
  // Получение всех уникальных классов
  const allClasses = getAllSpellClasses(allSpells);

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
    'Ограждение': '#4287f5',    // Blue
    'Вызов': '#28a745',   // Green
    'Прорицание': '#ffc107',    // Yellow
    'Очарование': '#e83e8c',   // Pink
    'Воплощение': '#dc3545',     // Red
    'Иллюзия': '#6f42c1',      // Indigo
    'Некромантия': '#000000',    // Black
    'Преобразование': '#fd7e14'  // Orange
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
    setFilteredSpells(allSpells);
  };

  // Функция для загрузки заклинаний по классу
  const loadSpellsForClass = (className: string) => {
    try {
      const filteredByClass = allSpells.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
        } else if (typeof spell.classes === 'string') {
          return spell.classes.toLowerCase() === className.toLowerCase();
        }
        return false;
      });
      
      setFilteredSpells(filteredByClass);
      setActiveClass([className]);
    } catch (error) {
      console.error("Ошибка при загрузке заклинаний для класса:", error);
    }
  };

  // Функция для загрузки заклинаний для персонажа (с учетом уровня)
  const loadSpellsForCharacter = (className: string, level: number) => {
    try {
      const filteredByClassAndLevel = allSpells.filter(spell => {
        const classMatch = Array.isArray(spell.classes) 
          ? spell.classes.some(c => c.toLowerCase() === className.toLowerCase())
          : typeof spell.classes === 'string' && spell.classes.toLowerCase() === className.toLowerCase();
        
        const levelMatch = spell.level <= level;
        
        return classMatch && levelMatch;
      });
      
      setFilteredSpells(filteredByClassAndLevel);
      setActiveClass([className]);
    } catch (error) {
      console.error("Ошибка при загрузке заклинаний для персонажа:", error);
    }
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

  return {
    spells: allSpells,
    filteredSpells,
    selectedSpells,
    setSelectedSpells,
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
    loadSpellsForClass,
    loadSpellsForCharacter,
    selectedSpell,
    isModalOpen,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    isLoading
  };
};
