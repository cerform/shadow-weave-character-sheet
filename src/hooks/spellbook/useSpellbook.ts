
import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { spells as allSpells } from '@/data/spells';

export const useSpellbook = () => {
  // Состояния для фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Получаем тему
  const { theme } = useTheme();
  const themeKey = theme as keyof typeof themes || 'default';
  const currentTheme = themes[themeKey] || themes.default;
  
  // Все возможные уровни заклинаний
  const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Все школы магии
  const allSchools = [...new Set(allSpells.map(spell => spell.school))].filter(Boolean).sort();
  
  // Все классы
  const allClasses = [...new Set(
    allSpells.flatMap(spell => 
      typeof spell.classes === 'string' 
        ? [spell.classes] 
        : Array.isArray(spell.classes) 
          ? spell.classes 
          : []
    )
  )].filter(Boolean).sort();
  
  // Фильтруем заклинания
  const filteredSpells = allSpells.filter(spell => {
    // Поиск по имени или описанию
    const matchesSearch = 
      searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (spell.description && 
       (typeof spell.description === 'string' 
        ? spell.description.toLowerCase().includes(searchTerm.toLowerCase())
        : Array.isArray(spell.description) && spell.description.some(d => 
            typeof d === 'string' && d.toLowerCase().includes(searchTerm.toLowerCase())
          )
       )
      );
    
    // Фильтр по уровню
    const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);
    
    // Фильтр по школе
    const matchesSchool = activeSchool.length === 0 || activeSchool.includes(spell.school);
    
    // Фильтр по классу
    const matchesClass = activeClass.length === 0 || 
      (typeof spell.classes === 'string' 
        ? activeClass.includes(spell.classes)
        : Array.isArray(spell.classes) && spell.classes.some(c => activeClass.includes(c))
      );
    
    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });
  
  // Переключение фильтра по уровню
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => 
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };
  
  // Переключение фильтра по школе
  const toggleSchool = (school: string) => {
    setActiveSchool(prev => 
      prev.includes(school)
        ? prev.filter(s => s !== school)
        : [...prev, school]
    );
  };
  
  // Переключение фильтра по классу
  const toggleClass = (cls: string) => {
    setActiveClass(prev => 
      prev.includes(cls)
        ? prev.filter(c => c !== cls)
        : [...prev, cls]
    );
  };
  
  // Очистка всех фильтров
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

    // Если есть настройки в теме, используем их
    if (currentTheme.badge) {
      switch(level) {
        case 0: return currentTheme.badge.cantrip || defaultColors[0];
        case 1: return currentTheme.badge.level1 || defaultColors[1];
        case 2: return currentTheme.badge.level2 || defaultColors[2];
        case 3: return currentTheme.badge.level3 || defaultColors[3];
        case 4: return currentTheme.badge.level4 || defaultColors[4];
        case 5: return currentTheme.badge.level5 || defaultColors[5];
        case 6: return currentTheme.badge.level6 || defaultColors[6];
        case 7: return currentTheme.badge.level7 || defaultColors[7];
        case 8: return currentTheme.badge.level8 || defaultColors[8];
        case 9: return currentTheme.badge.level9 || defaultColors[9];
        default: return defaultColors[0];
      }
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
  
  // Открытие модального окна с деталями заклинания
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  // Закрытие модального окна
  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedSpell(null);
  };
  
  return {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    selectedSpell,
    isModalOpen,
    currentTheme,
    allLevels,
    allSchools,
    allClasses,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    handleOpenSpell,
    handleClose
  };
};
