import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getSpellsByClass, getSpellsByLevel, spells } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export const useSpellbook = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Получаем все уникальные уровни из списка заклинаний
  const allLevels = Array.from(new Set(spells.map(spell => spell.level))).sort((a, b) => a - b);
  
  // Получаем все уникальные школы из списка заклинаний
  const allSchools = Array.from(new Set(spells.map(spell => spell.school || ''))).filter(Boolean);
  
  // Получаем все уникальные классы из списка заклинаний
  const allClasses = Array.from(
    new Set(
      spells.flatMap(spell => {
        if (!spell.classes) return [];
        return Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      })
    )
  ).filter(Boolean);
  
  // Фильтрация заклинаний
  const filteredSpells = spells.filter(spell => {
    // Фильтр по поиску
    const matchesSearch = searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по уровню
    const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);
    
    // Фильтр по школе
    const matchesSchool = activeSchool.length === 0 || 
      (spell.school && activeSchool.includes(spell.school));
    
    // Фильтр по классу
    const matchesClass = activeClass.length === 0 || 
      (spell.classes && Array.isArray(spell.classes) 
        ? spell.classes.some(cls => activeClass.includes(cls))
        : activeClass.includes(spell.classes || ''));
    
    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });
  
  // Функции для управления фильтрами
  const toggleLevel = (level: number) => {
    setActiveLevel(
      activeLevel.includes(level)
        ? activeLevel.filter(l => l !== level)
        : [...activeLevel, level]
    );
  };
  
  const toggleSchool = (school: string) => {
    setActiveSchool(
      activeSchool.includes(school)
        ? activeSchool.filter(s => s !== school)
        : [...activeSchool, school]
    );
  };
  
  const toggleClass = (cls: string) => {
    setActiveClass(
      activeClass.includes(cls)
        ? activeClass.filter(c => c !== cls)
        : [...activeClass, cls]
    );
  };
  
  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };
  
  // Управление модальным окном с детальной информацией
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  // Функция для получения цвета бейджа для уровня заклинания
  const getBadgeColor = (level: number): string => {
    switch(level) {
      case 0: return '#6b7280'; // gray-500
      case 1: return '#10b981'; // emerald-500
      case 2: return '#3b82f6'; // blue-500
      case 3: return '#8b5cf6'; // violet-500
      case 4: return '#ec4899'; // pink-500
      case 5: return '#f59e0b'; // amber-500
      case 6: return '#ef4444'; // red-500
      case 7: return '#6366f1'; // indigo-500
      case 8: return '#7c3aed'; // purple-600
      case 9: return '#1e40af'; // blue-800
      default: return '#6b7280'; // gray-500
    }
  };
  
  // Функция для получения цвета бейджа для школы магии
  const getSchoolBadgeColor = (school?: string): string => {
    if (!school) return '#6b7280'; // gray-500
    
    switch(school.toLowerCase()) {
      case 'вызов': return '#10b981'; // emerald-500
      case 'воплощение': return '#ef4444'; // red-500
      case 'иллюзия': return '#8b5cf6'; // violet-500
      case 'некромантия': return '#1e293b'; // slate-800
      case 'ограждение': return '#3b82f6'; // blue-500
      case 'очарование': return '#ec4899'; // pink-500
      case 'преобразование': return '#f59e0b'; // amber-500
      case 'прорицание': return '#6366f1'; // indigo-500
      default: return '#6b7280'; // gray-500
    }
  };
  
  // Функция для форматирования списка классов
  const formatClasses = (classes: string[] | string): string => {
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    return classes || '';
  };
  
  return {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    currentTheme,
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
    formatClasses
  };
};
