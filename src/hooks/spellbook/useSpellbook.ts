
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from '@/types/spells';
import { spells } from '@/data/spells';
import { SpellFilters } from './types';

export const useSpellbook = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Состояния для фильтрации
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Текущие фильтры для использования в компонентах
  const [filters, setFilters] = useState<SpellFilters>({
    searchTerm: '',
    level: null,
    school: null,
    class: null,
    ritual: false,
    concentration: false
  });

  // Создаем списки всех уровней, школ и классов
  const allSpells = useMemo(() => spells || [], []);  // Гарантируем, что здесь будет массив

  const allLevels = useMemo(() => {
    if (!allSpells || allSpells.length === 0) return [];
    const levels = new Set(allSpells.map(spell => spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [allSpells]);

  const allSchools = useMemo(() => {
    if (!allSpells || allSpells.length === 0) return [];
    const schools = new Set(allSpells.map(spell => spell.school || 'Универсальная'));
    return Array.from(schools).filter(Boolean).sort();
  }, [allSpells]);

  const allClasses = useMemo(() => {
    if (!allSpells || allSpells.length === 0) return [];
    const classes = new Set<string>();
    allSpells.forEach(spell => {
      if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      }
    });
    return Array.from(classes).filter(Boolean).sort();
  }, [allSpells]);

  // Отфильтрованные заклинания
  const filteredSpells = useMemo(() => {
    if (!allSpells || allSpells.length === 0) return [];
    
    return allSpells.filter(spell => {
      // Фильтр по поисковому запросу
      if (filters.searchTerm && !spell.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Фильтр по уровню
      if (filters.level !== null && spell.level !== filters.level) {
        return false;
      }

      // Фильтр по школе
      if (filters.school !== null && spell.school !== filters.school) {
        return false;
      }

      // Фильтр по классу
      if (filters.class !== null) {
        if (typeof spell.classes === 'string') {
          if (spell.classes !== filters.class) {
            return false;
          }
        } else if (Array.isArray(spell.classes)) {
          if (!spell.classes.includes(filters.class)) {
            return false;
          }
        } else {
          return false;
        }
      }

      // Фильтр по ритуалу
      if (filters.ritual && !spell.ritual) {
        return false;
      }

      // Фильтр по концентрации
      if (filters.concentration && !spell.concentration) {
        return false;
      }

      return true;
    });
  }, [allSpells, filters]);

  // Функция загрузки заклинаний
  const loadSpells = useCallback(() => {
    setIsLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    // Если бы здесь был реальный API-запрос:
    // fetchSpells().then(data => {
    //   setIsLoading(false);
    // }).catch(error => {
    //   console.error('Error loading spells:', error);
    //   setIsLoading(false);
    // });
  }, []);

  // Инициализируем загрузку заклинаний при первом рендере
  useEffect(() => {
    loadSpells();
  }, [loadSpells]);

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
    handleOpenSpell: (spell: SpellData) => {
      setSelectedSpell(spell);
      setIsModalOpen(true);
    },
    handleClose: () => {
      setIsModalOpen(false);
      setSelectedSpell(null);
    },
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    
    // Добавляем необходимые свойства для SpellBookViewer
    spells: filteredSpells,
    loadSpells,
    isLoading,
    filters,
    setFilters
  };
};
