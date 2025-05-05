
import { useState, useEffect } from 'react';
import { getAllSpells } from '@/data/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData, UseSpellbookReturn } from './types';
import { CharacterSpell } from '@/types/character';

// Преобразование CharacterSpell в SpellData
const mapCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id?.toString() || Math.random().toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Неизвестная', // Добавляем дефолтное значение
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "Касание",
    components: spell.components || "В, С",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "",
    classes: spell.classes || [],
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higherLevels: spell.higherLevels
  };
};

// Функция для использования в SpellBookViewer
export const useSpellbook = (): UseSpellbookReturn => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Загрузка данных заклинаний при инициализации
  useEffect(() => {
    const loadSpells = async () => {
      try {
        const allSpells = getAllSpells();
        // Преобразуем CharacterSpell[] в SpellData[]
        const spellData = allSpells.map((spell: CharacterSpell) => 
          mapCharacterSpellToSpellData(spell)
        );
        setSpells(spellData);
      } catch (error) {
        console.error('Ошибка загрузки заклинаний:', error);
      }
    };
    
    loadSpells();
  }, []);
  
  // Получение отфильтрованных заклинаний
  const filteredSpells = spells.filter(spell => {
    const matchesSearch = searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (spell.description && typeof spell.description === 'string' && 
        spell.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);
    const matchesSchool = activeSchool.length === 0 || (spell.school && activeSchool.includes(spell.school));
    
    const matchesClass = activeClass.length === 0 || 
      (spell.classes && (
        (typeof spell.classes === 'string' && activeClass.includes(spell.classes)) || 
        (Array.isArray(spell.classes) && spell.classes.some(c => activeClass.includes(c)))
      ));
    
    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });
  
  // Открытие модального окна с деталями заклинания
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  // Закрытие модального окна
  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSpell(null), 300);
  };
  
  // Переключение фильтра по уровню
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => 
      prev.includes(level) ? prev.filter(lvl => lvl !== level) : [...prev, level]
    );
  };
  
  // Переключение фильтра по школе
  const toggleSchool = (school: string) => {
    setActiveSchool(prev => 
      prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
    );
  };
  
  // Переключение фильтра по классу
  const toggleClass = (className: string) => {
    setActiveClass(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };
  
  // Сброс всех фильтров
  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
  };
  
  // Получение цвета для бейджа уровня заклинания
  const getBadgeColor = (level: number): string => {
    switch(level) {
      case 0: return "bg-slate-600";
      case 1: return "bg-blue-600";
      case 2: return "bg-green-600";
      case 3: return "bg-yellow-600";
      case 4: return "bg-orange-600";
      case 5: return "bg-red-600";
      case 6: return "bg-purple-600";
      case 7: return "bg-pink-600";
      case 8: return "bg-indigo-600";
      case 9: return "bg-black text-white";
      default: return "bg-gray-600";
    }
  };
  
  // Получение цвета для бейджа школы магии
  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors: {[key: string]: string} = {
      "Воплощение": "bg-red-600",
      "Некромантия": "bg-gray-800",
      "Очарование": "bg-pink-600",
      "Преобразование": "bg-blue-600",
      "Прорицание": "bg-indigo-600",
      "Вызов": "bg-amber-600",
      "Ограждение": "bg-green-600",
      "Иллюзия": "bg-purple-600",
      "Неизвестная": "bg-slate-600"
    };
    
    return schoolColors[school] || "bg-slate-600";
  };
  
  // Форматирование списка классов заклинания
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    if (Array.isArray(classes)) return classes.join(', ');
    return classes;
  };
  
  // Получение всех уровней заклинаний
  const allLevels = Array.from(new Set(spells.map(spell => spell.level))).sort();
  
  // Получение всех школ магии
  const allSchools = Array.from(new Set(spells.map(spell => spell.school))).sort();
  
  // Получение всех классов заклинаний
  const allClasses = Array.from(
    new Set(
      spells.flatMap(spell => {
        if (!spell.classes) return [];
        if (Array.isArray(spell.classes)) return spell.classes;
        return [spell.classes];
      })
    )
  ).sort();
  
  // Импорт заклинаний из текста
  const importSpellsFromText = (text: string, existingSpells: CharacterSpell[]): CharacterSpell[] => {
    // Реализация функции импорта заклинаний
    return existingSpells; // Пока заглушка
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
    importSpellsFromText
  };
};
