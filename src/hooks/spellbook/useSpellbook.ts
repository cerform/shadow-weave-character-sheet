import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from '@/types/spells';
import { spells } from '@/data/spells';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSpellbookContext } from './index';

export const useSpellbook = () => {
  const spellbookContext = useSpellbookContext();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Состояния для фильтрации
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Создаем списки всех уровней, школ и классов
  const allSpells = useMemo(() => spells, []);

  // Функции для фильтрации
  const toggleLevel = useCallback((level: number) => {
    setActiveLevel(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  }, []);

  const toggleSchool = useCallback((school: string) => {
    setActiveSchool(prev => 
      prev.includes(school) 
        ? prev.filter(s => s !== school) 
        : [...prev, school]
    );
  }, []);

  const toggleClass = useCallback((className: string) => {
    setActiveClass(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className) 
        : [...prev, className]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  }, []);

  // Функции для модального окна с деталями заклинания
  const handleOpenSpell = useCallback((spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSpell(null);
  }, []);

  // Функции для отображения
  const getBadgeColor = useCallback((level: number): string => {
    const colors: Record<number, string> = {
      0: "#6b7280", // заговор - серый
      1: "#10b981", // 1 уровень - зеленый
      2: "#3b82f6", // 2 уровень - синий
      3: "#8b5cf6", // 3 уровень - фиолетовый
      4: "#ec4899", // 4 уровень - розовый
      5: "#f59e0b", // 5 уровень - оранжевый
      6: "#ef4444", // 6 уровень - красный
      7: "#6366f1", // 7 уровень - индиго
      8: "#0ea5e9", // 8 уровень - голубой
      9: "#7c3aed"  // 9 уровень - насыщенный фиолетовый
    };
    return colors[level] || colors[0];
  }, []);

  const getSchoolBadgeColor = useCallback((school: string): string => {
    const colors: {[key: string]: string} = {
      "Преобразование": "#10b981",
      "Воплощение": "#ef4444",
      "Очарование": "#8b5cf6",
      "Прорицание": "#f59e0b",
      "Ограждение": "#3b82f6",
      "Иллюзия": "#ec4899",
      "Некромантия": "#6b7280",
      "Вызов": "#0ea5e9",
      "Универсальная": "#6b7280"
    };
    return colors[school] || "#6b7280";
  }, []);

  const formatClasses = useCallback((classes: string[] | string | undefined): string => {
    if (!classes) return "";
    if (typeof classes === "string") return classes;
    return classes.join(", ");
  }, []);

  return {
    ...spellbookContext, // Проксируем контекст заклинаний
    filteredSpells: allSpells.filter(spell => {
      // Фильтрация по всем критериям
      return true; // Для упрощения
    }),
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    currentTheme,
    allLevels: useMemo(() => Array.from(new Set(allSpells.map(spell => spell.level))).sort(), [allSpells]),
    allSchools: useMemo(() => Array.from(new Set(allSpells.map(spell => spell.school))).filter(Boolean), [allSpells]),
    allClasses: useMemo(() => {
      const classesSet = new Set<string>();
      allSpells.forEach(spell => {
        if (typeof spell.classes === 'string') {
          classesSet.add(spell.classes);
        } else if (Array.isArray(spell.classes)) {
          spell.classes.forEach(c => classesSet.add(c));
        }
      });
      return Array.from(classesSet).filter(Boolean);
    }, [allSpells]),
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
    formatClasses,
    isMobile
  };
};
