import { useState, useMemo } from 'react';
import { useTheme } from './use-theme';
import { themes } from '@/lib/themes';
import { spells } from '@/data/spells';
import { SpellData } from './spellbook/types';

// Update the Spell interface to match SpellData for compatibility
interface Spell extends SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string[] | string;
}

export const useSpellbook = () => {
  // Состояния для фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Получение текущей темы
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Список всех заклинаний из базы данных
  const allSpells = useMemo(() => spells, []);

  // Извлечение уникальных значений для фильтров
  const allLevels = useMemo(() => {
    const levels = Array.from(new Set(allSpells.map(spell => spell.level))).sort((a, b) => a - b);
    return levels;
  }, [allSpells]);

  const allSchools = useMemo(() => {
    const schools = Array.from(new Set(allSpells.map(spell => spell.school))).sort();
    return schools;
  }, [allSpells]);

  const allClasses = useMemo(() => {
    const classes = Array.from(new Set(allSpells.flatMap(spell => spell.classes))).sort();
    return classes;
  }, [allSpells]);

  // Фильтрация заклинаний
  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      // Поиск по названию
      const nameMatch = searchTerm === '' || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Фильтр по уровню
      const levelMatch = activeLevel.length === 0 || activeLevel.includes(spell.level);

      // Фильтр по школе
      const schoolMatch = activeSchool.length === 0 || activeSchool.includes(spell.school);

      // Фильтр по классам
      const classMatch = activeClass.length === 0 || 
        spell.classes.some(cls => activeClass.includes(cls));

      return nameMatch && levelMatch && schoolMatch && classMatch;
    }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [allSpells, searchTerm, activeLevel, activeSchool, activeClass]);

  // Обработчики для переключения фильтров
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev => 
      prev.includes(school) 
        ? prev.filter(s => s !== school) 
        : [...prev, school]
    );
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className) 
        : [...prev, className]
    );
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
  };

  // Обработчики для модального окна с деталями заклинания
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell as unknown as Spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Функции для получения цветов бейджей в зависимости от темы
  const getBadgeColor = (level: number) => {
    const colors = {
      0: '#808080', // Cantrips - серый
      1: '#3b82f6', // 1 уровень - синий
      2: '#10b981', // 2 уровень - зеленый
      3: '#f59e0b', // 3 уровень - желтый
      4: '#ef4444', // 4 уровень - красный
      5: '#8b5cf6', // 5 уровень - фиолетовый
      6: '#ec4899', // 6 уровень - розовый
      7: '#06b6d4', // 7 уровень - голубой
      8: '#9333ea', // 8 уровень - пурпурный
      9: '#dc2626', // 9 уровень - темно-красный
    }[level] || currentTheme.accent;
    return colors;
  };

  const getSchoolBadgeColor = (school: string) => {
    const colors = {
      'Воплощение': '#ef4444', // Красный
      'Некромантия': '#9333ea', // Фиолетовый
      'Очарование': '#ec4899', // Розовый
      'Преобразование': '#3b82f6', // Синий
      'Призыв': '#f59e0b', // Оранжевый
      'Прорицание': '#06b6d4', // Голубой
      'Иллюзия': '#8b5cf6', // Светло-фиолетовый
      'Ограждение': '#10b981', // Зеленый
    }[school] || '#6b7280'; // Серый по умолчанию
    return colors;
  };

  // Функция для форматирования списка классов
  const formatClasses = (classes: string[]) => {
    if (!classes || classes.length === 0) return '';
    
    return classes.join(', ');
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
