
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
        // Проверяем тип spell.classes перед использованием метода some
        return typeof spell.classes === 'string' ? [spell.classes] : spell.classes;
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
    
    // Фильтр по классу с правильной проверкой типа
    let matchesClass = activeClass.length === 0;
    
    if (!matchesClass && spell.classes) {
      if (typeof spell.classes === 'string') {
        matchesClass = activeClass.includes(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        matchesClass = spell.classes.some(cls => activeClass.includes(cls));
      }
    }
    
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
  
  // Получение цвета для бейджа уровня заклинания
  const getBadgeColor = (level: number): string => {
    const defaultColors = {
      0: "#6b7280", // Заговор
      1: "#10b981", // 1 уровень
      2: "#3b82f6", // 2 уровень
      3: "#8b5cf6", // 3 уровень
      4: "#ec4899", // 4 уровень
      5: "#f59e0b", // 5 уровень
      6: "#ef4444", // 6 уровень
      7: "#6366f1", // 7 уровень
      8: "#0ea5e9", // 8 уровень
      9: "#7c3aed"  // 9 уровень
    };

    // Проверяем spellLevels в теме
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    
    // Если нет специальных настроек, используем значения по умолчанию
    return defaultColors[level as keyof typeof defaultColors] || defaultColors[0];
  };
  
  // Получение цвета для бейджа школы магии
  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors: Record<string, string> = {
      "Ограждение": "#10b981",
      "Воплощение": "#ef4444",
      "Вызов": "#8b5cf6",
      "Прорицание": "#3b82f6",
      "Очарование": "#f59e0b",
      "Иллюзия": "#6366f1",
      "Некромантия": "#6b7280",
      "Преобразование": "#ec4899"
    };
    
    return schoolColors[school] || "#6b7280";
  };
  
  // Форматирование списка классов
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "";
    if (typeof classes === "string") return classes;
    return classes.join(", ");
  };
  
  // Управление модальным окном с детальной информацией
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  const handleClose = () => {
    setIsModalOpen(false);
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
