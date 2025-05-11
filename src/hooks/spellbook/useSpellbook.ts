
import { useState, useEffect, useMemo } from 'react';
import { SpellData } from '@/types/spells';
import { getAllSpells } from '@/data/spells';

export interface UseSpellbookReturn {
  filteredSpells: SpellData[];
  selectedSpell: SpellData | null;
  isModalOpen: boolean;
  searchTerm: string;
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  setSearchTerm: (term: string) => void;
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  handleOpenSpell: (spell: SpellData) => void;
  handleClose: () => void;
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  formatClasses: (classes: string[] | string) => string;
}

export const useSpellbook = (): UseSpellbookReturn => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Фильтры
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  
  // Загрузка заклинаний
  useEffect(() => {
    try {
      const allSpells = getAllSpells();
      setSpells(allSpells);
    } catch (error) {
      console.error('Error loading spells:', error);
      setSpells([]);
    }
  }, []);
  
  // Получение всех доступных уровней заклинаний
  const allLevels: number[] = useMemo(() => {
    const levels = spells.map(spell => spell.level);
    return [...new Set(levels)].sort((a, b) => a - b);
  }, [spells]);
  
  // Получение всех доступных школ магии
  const allSchools: string[] = useMemo(() => {
    const schools = spells.map(spell => spell.school);
    return [...new Set(schools)].sort();
  }, [spells]);
  
  // Получение всех доступных классов
  const allClasses: string[] = useMemo(() => {
    const classes: string[] = [];
    
    spells.forEach(spell => {
      if (typeof spell.classes === 'string') {
        classes.push(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => {
          if (typeof cls === 'string') classes.push(cls);
        });
      }
    });
    
    return [...new Set(classes)].sort();
  }, [spells]);
  
  // Фильтрация заклинаний
  const filteredSpells = useMemo(() => {
    return spells.filter(spell => {
      // Фильтр по поисковому запросу
      const matchesSearch = searchTerm 
        ? spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spell.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof spell.description === 'string' 
            ? spell.description.toLowerCase().includes(searchTerm.toLowerCase())
            : Array.isArray(spell.description) && spell.description.some(desc => 
                desc.toLowerCase().includes(searchTerm.toLowerCase())
              ))
        : true;
      
      // Фильтр по уровню
      const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);
      
      // Фильтр по школе
      const matchesSchool = activeSchool.length === 0 || activeSchool.includes(spell.school);
      
      // Фильтр по классу
      let matchesClass = activeClass.length === 0;
      
      if (!matchesClass && spell.classes) {
        if (typeof spell.classes === 'string') {
          matchesClass = activeClass.includes(spell.classes);
        } else if (Array.isArray(spell.classes)) {
          matchesClass = spell.classes.some(cls => activeClass.includes(cls as string));
        }
      }
      
      return matchesSearch && matchesLevel && matchesSchool && matchesClass;
    });
  }, [spells, searchTerm, activeLevel, activeSchool, activeClass]);
  
  // Переключение фильтра уровня
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };
  
  // Переключение фильтра школы
  const toggleSchool = (school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  };
  
  // Переключение фильтра класса
  const toggleClass = (className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };
  
  // Сброс всех фильтров
  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };
  
  // Открытие модального окна с заклинанием
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  // Закрытие модального окна
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  // Получение цвета бейджа в зависимости от уровня заклинания
  const getBadgeColor = (level: number): string => {
    const colors = [
      '#60a5fa',  // 0 (голубой) - заговоры
      '#7dd3fc',  // 1 (светло-голубой)
      '#a78bfa',  // 2 (фиолетовый)
      '#c084fc',  // 3 (пурпурный)
      '#f472b6',  // 4 (розовый)
      '#f43f5e',  // 5 (красный)
      '#fb923c',  // 6 (оранжевый)
      '#fbbf24',  // 7 (желтый)
      '#4ade80',  // 8 (зеленый)
      '#10b981',  // 9 (изумрудный)
    ];
    
    return level >= 0 && level < colors.length ? colors[level] : '#64748b';
  };
  
  // Получение цвета бейджа в зависимости от школы заклинания
  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors: Record<string, string> = {
      'Воплощение': '#f43f5e',
      'Evocation': '#f43f5e',
      'Некромантия': '#64748b',
      'Necromancy': '#64748b',
      'Ограждение': '#a78bfa',
      'Abjuration': '#a78bfa',
      'Преобразование': '#fbbf24',
      'Transmutation': '#fbbf24',
      'Прорицание': '#60a5fa',
      'Divination': '#60a5fa',
      'Очарование': '#f472b6',
      'Enchantment': '#f472b6',
      'Иллюзия': '#c084fc',
      'Illusion': '#c084fc',
      'Вызов': '#4ade80',
      'Conjuration': '#4ade80',
      'Универсальная': '#94a3b8',
      'Universal': '#94a3b8',
    };
    
    return schoolColors[school] || '#94a3b8';
  };
  
  // Форматирование классов для отображения
  const formatClasses = (classes: string[] | string): string => {
    if (typeof classes === 'string') {
      return classes;
    }
    
    return classes.join(', ');
  };
  
  return {
    filteredSpells,
    selectedSpell,
    isModalOpen,
    searchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    allLevels,
    allSchools,
    allClasses,
    setSearchTerm,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
  };
};
