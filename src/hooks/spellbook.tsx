
import { useState, useMemo } from 'react';
import { useTheme } from './use-theme';
import { themes } from '@/lib/themes';
import { spells, getAllSpells } from '@/data/spells';
import { SpellData } from './spellbook/types';
import { CharacterSpell } from '@/types/character';
import { convertToSpellData } from './spellbook/types';

export const useSpellbook = () => {
  // Состояния для фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Получение текущей темы
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Преобразуем все заклинания, убедившись, что prepared есть в каждом
  const allSpells = useMemo(() => {
    return getAllSpells().map(spell => ({
      ...spell,
      prepared: spell.prepared || false // Добавляем prepared, если его нет
    }));
  }, []);

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
    const classesSet = new Set<string>();
    
    allSpells.forEach(spell => {
      if (!spell.classes) return;
      
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(c => classesSet.add(c));
      } else if (typeof spell.classes === 'string') {
        // Разделяем строку с классами по запятым и добавляем в Set
        spell.classes.split(',').map(c => c.trim()).forEach(c => classesSet.add(c));
      }
    });
    
    return Array.from(classesSet).sort();
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
      const schoolMatch = activeSchool.length === 0 || activeSchool.includes(spell.school || '');

      // Фильтр по классам
      const classMatch = activeClass.length === 0 || 
        (Array.isArray(spell.classes) && spell.classes.some(cls => activeClass.includes(cls))) ||
        (typeof spell.classes === 'string' && activeClass.some(cls => spell.classes?.includes(cls)));

      return nameMatch && levelMatch && schoolMatch && classMatch;
    }).sort((a, b) => (a.level || 0) - (b.level || 0) || a.name.localeCompare(b.name));
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
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Функции адаптеры для совместимости со SpellBookViewer
  const adaptToSpellData = (spell: CharacterSpell): SpellData => {
    return {
      ...spell
    };
  };

  const adaptToCharacterSpell = (spellData: SpellData): CharacterSpell => {
    return {
      ...spellData,
      prepared: spellData.prepared ?? false,
      // Make sure all required CharacterSpell fields are present
      castingTime: spellData.castingTime || '1 действие',
      range: spellData.range || 'На себя',
      components: spellData.components || '',
      duration: spellData.duration || 'Мгновенная',
      description: spellData.description || 'Нет описания'
    } as CharacterSpell; // Используем `as CharacterSpell` для приведения типа
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
  const formatClasses = (classes: string[] | string | undefined) => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes;
  };

  // Функция для конвертации CharacterSpell в SpellData (совместимость)
  const convertCharacterSpellsToSpellData = (characterSpells: CharacterSpell[]): SpellData[] => {
    return characterSpells.map(spell => convertToSpellData(spell));
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
    convertCharacterSpellsToSpellData,
    adaptToSpellData,
    adaptToCharacterSpell
  };
};

// Обратите внимание, что src/hooks/spellbook.tsx становится слишком длинным (222 строки).
// Рассмотрите возможность разбить его на более мелкие компоненты и хуки.
