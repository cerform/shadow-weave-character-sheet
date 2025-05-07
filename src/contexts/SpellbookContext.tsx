
import React, { createContext, useState, ReactNode } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export interface SpellbookContextType {
  selectedSpells: CharacterSpell[];
  availableSpells: SpellData[];
  filteredSpells?: SpellData[];
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  activeLevel?: number[];
  activeSchool?: string[];
  activeClass?: string[];
  allLevels?: number[];
  allSchools?: string[];
  allClasses?: string[];
  selectedSpell?: SpellData | null;
  isModalOpen?: boolean;
  toggleLevel?: (level: number) => void;
  toggleSchool?: (school: string) => void;
  toggleClass?: (className: string) => void;
  clearFilters?: () => void;
  handleOpenSpell?: (spell: SpellData) => void;
  handleClose?: () => void;
  getBadgeColor?: (level: number) => string;
  getSchoolBadgeColor?: (school: string) => string;
  formatClasses?: (classes: string[] | string | undefined) => string;
  addSpell: (spell: SpellData | CharacterSpell) => void;
  removeSpell: (spellId: string) => void;
  getSpellLimits: (characterClass: string, level: number) => { maxKnown: number; maxPrepared: number };
  getSelectedSpellCount: () => number;
  saveCharacterSpells: (character?: Character) => void;
  loadSpellsForCharacter: (character: Character | string, level?: number) => void;
}

export const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  availableSpells: [],
  addSpell: () => {},
  removeSpell: () => {},
  getSpellLimits: () => ({ maxKnown: 0, maxPrepared: 0 }),
  getSelectedSpellCount: () => 0,
  saveCharacterSpells: () => {},
  loadSpellsForCharacter: () => {},
});

interface SpellbookProviderProps {
  children: ReactNode;
}

export const SpellbookProvider: React.FC<SpellbookProviderProps> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Расчет всех возможных значений для фильтров
  const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const allSchools = [
    'Воплощение', 'Некромантия', 'Преобразование', 'Прорицание',
    'Призыв', 'Очарование', 'Иллюзия', 'Ограждение', 'Универсальная'
  ];
  const allClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник',
    'Колдун', 'Чародей', 'Паладин', 'Следопыт'
  ];

  // Методы для управления фильтрами
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev => 
      prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
    );
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };

  // Методы для модального окна
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Методы для отображения
  const getBadgeColor = (level: number): string => {
    const colors = [
      'bg-gray-200', 'bg-red-200', 'bg-orange-200', 'bg-amber-200',
      'bg-yellow-200', 'bg-green-200', 'bg-emerald-200', 'bg-teal-200',
      'bg-sky-200', 'bg-indigo-200'
    ];
    return level >= 0 && level <= 9 ? colors[level] : 'bg-purple-200';
  };

  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors: Record<string, string> = {
      'Воплощение': 'bg-red-200',
      'Некромантия': 'bg-green-200',
      'Преобразование': 'bg-blue-200',
      'Прорицание': 'bg-purple-200',
      'Призыв': 'bg-yellow-200',
      'Очарование': 'bg-pink-200',
      'Иллюзия': 'bg-indigo-200',
      'Ограждение': 'bg-orange-200',
      'Универсальная': 'bg-gray-200'
    };
    return schoolColors[school] || 'bg-gray-200';
  };

  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    
    return classes;
  };

  const addSpell = (spell: SpellData | CharacterSpell) => {
    const characterSpell: CharacterSpell = {
      id: spell.id?.toString(),
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      prepared: true
    };
    
    setSelectedSpells([...selectedSpells, characterSpell]);
  };

  const removeSpell = (spellId: string) => {
    setSelectedSpells(selectedSpells.filter(spell => 
      spell.id !== spellId && spell.name !== spellId
    ));
  };

  const getSpellLimits = (characterClass: string, level: number) => {
    // Примерные значения, можно настроить под D&D правила
    return { maxKnown: level * 2, maxPrepared: level + 2 };
  };

  const getSelectedSpellCount = () => {
    return selectedSpells.length;
  };

  const saveCharacterSpells = (character?: Character) => {
    // В реальности здесь должно быть сохранение в базу данных или локальное хранилище
    console.log("Сохранение заклинаний для персонажа:", character?.name || "текущий персонаж");
    // Функция может работать без параметра для обратной совместимости
  };

  const loadSpellsForCharacter = (character: Character | string, level?: number) => {
    const characterName = typeof character === 'string' ? character : character.name;
    console.log(`Загрузка заклинаний для ${characterName}${level ? `, уровень ${level}` : ''}`);
    
    // Преобразовать тип character к Character если это строка
    if (typeof character === 'object' && character.spells && character.spells.length > 0) {
      setSelectedSpells(character.spells);
    } else {
      setSelectedSpells([]);
    }
  };

  const value = {
    selectedSpells,
    availableSpells,
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    allLevels,
    allSchools,
    allClasses,
    selectedSpell,
    isModalOpen,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    addSpell,
    removeSpell,
    getSpellLimits,
    getSelectedSpellCount,
    saveCharacterSpells,
    loadSpellsForCharacter
  };

  return (
    <SpellbookContext.Provider value={value}>
      {children}
    </SpellbookContext.Provider>
  );
};

// Убираем импорт, который вызывал циклическую зависимость
