
import { useState, useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { spells as allSpellsData } from '@/data/spells';
import { SpellData } from '@/types/spells';

// Хук для работы с книгой заклинаний
export const useSpellbook = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Все доступные уровни заклинаний
  const allLevels = useMemo(() => {
    const levels = new Set<number>();
    allSpellsData.forEach(spell => levels.add(spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, []);

  // Все доступные школы магии
  const allSchools = useMemo(() => {
    const schools = new Set<string>();
    allSpellsData.forEach(spell => {
      if (spell.school) schools.add(spell.school);
    });
    return Array.from(schools).sort();
  }, []);

  // Все доступные классы персонажей
  const allClasses = useMemo(() => {
    const classes = new Set<string>();
    allSpellsData.forEach(spell => {
      if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      }
    });
    return Array.from(classes).sort();
  }, []);

  // Фильтрация заклинаний
  const filteredSpells = useMemo(() => {
    return allSpellsData.filter(spell => {
      // Фильтр по поисковому запросу
      const matchesSearch = searchTerm === '' || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spell.description && typeof spell.description === 'string' && 
         spell.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Фильтр по уровню заклинания
      const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);

      // Фильтр по школе магии
      const matchesSchool = activeSchool.length === 0 || 
        (spell.school && activeSchool.includes(spell.school));

      // Фильтр по классу персонажа
      const matchesClass = activeClass.length === 0 || 
        (spell.classes && (
          (typeof spell.classes === 'string' && activeClass.includes(spell.classes)) ||
          (Array.isArray(spell.classes) && spell.classes.some(cls => activeClass.includes(cls)))
        ));

      return matchesSearch && matchesLevel && matchesSchool && matchesClass;
    });
  }, [searchTerm, activeLevel, activeSchool, activeClass, allSpellsData]);

  // Обработчики фильтров
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

  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
  };

  // Обработчики модального окна
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedSpell(null);
  };

  // Получение цвета бейджа для уровня заклинания
  const getBadgeColor = (level: number): string => {
    if (level === 0) return currentTheme.cantrip || '#9ca3af';
    
    const levelColors = [
      '',
      currentTheme.level1 || '#3b82f6',
      currentTheme.level2 || '#10b981',
      currentTheme.level3 || '#f59e0b',
      currentTheme.level4 || '#ef4444',
      currentTheme.level5 || '#8b5cf6',
      currentTheme.level6 || '#ec4899',
      currentTheme.level7 || '#6366f1',
      currentTheme.level8 || '#0ea5e9',
      currentTheme.level9 || '#14b8a6'
    ];
    
    return level >= 1 && level <= 9 ? levelColors[level] : '#9ca3af';
  };

  // Получение цвета бейджа для школы магии
  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors: Record<string, string> = {
      'Воплощение': currentTheme.evocation || '#ef4444',
      'Некромантия': currentTheme.necromancy || '#64748b',
      'Очарование': currentTheme.enchantment || '#ec4899',
      'Преобразование': currentTheme.transmutation || '#10b981',
      'Прорицание': currentTheme.divination || '#8b5cf6',
      'Вызов': currentTheme.conjuration || '#f59e0b',
      'Ограждение': currentTheme.abjuration || '#3b82f6',
      'Иллюзия': currentTheme.illusion || '#6366f1'
    };
    
    return schoolColors[school] || '#9ca3af';
  };

  // Форматирование списка классов
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    if (typeof classes === 'string') return classes;
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
    formatClasses
  };
};
