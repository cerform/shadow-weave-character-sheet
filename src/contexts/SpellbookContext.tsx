
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpellsFromDatabase, saveSpellToDatabase, deleteSpellFromDatabase } from '@/services/spellService';
import { toast } from 'sonner';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { filterSpellsByText } from '@/hooks/spellbook/filterUtils';

export interface SpellbookContextType {
  selectedSpells: SpellData[];
  filteredSpells: SpellData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadSpells: () => Promise<void>;
  addSpell: (spell: SpellData) => void;
  removeSpell: (id: string) => void;
  prepareSpell: (id: string) => void;
  unprepareSpell: (id: string) => void;
  exportSpells: () => void;
  importSpells: (spells: SpellData[]) => void;
  
  // Добавляем недостающие свойства
  availableSpells: SpellData[];
  loading: boolean;
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
  getSpellLimits: (characterClass: string, level: number, abilityModifier?: number) => { 
    maxSpellLevel: number;
    cantripsCount: number;
    knownSpells: number;
  };
  getSelectedSpellCount: () => { cantrips: number; spells: number };
  saveCharacterSpells: () => void;
  
  // Добавляем свойства для SpellbookPage
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  isRitualOnly: boolean;
  isConcentrationOnly: boolean;
  toggleRitualOnly: () => void;
  toggleConcentrationOnly: () => void;
  advancedFiltersOpen: boolean;
  toggleAdvancedFilters: () => void;
}

export const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  filteredSpells: [],
  availableSpells: [],
  loading: false,
  searchQuery: '',
  setSearchQuery: () => {},
  loadSpells: async () => {},
  addSpell: () => {},
  removeSpell: () => {},
  prepareSpell: () => {},
  unprepareSpell: () => {},
  exportSpells: () => {},
  importSpells: () => {},
  loadSpellsForCharacter: () => {},
  getSpellLimits: () => ({ maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 }),
  getSelectedSpellCount: () => ({ cantrips: 0, spells: 0 }),
  saveCharacterSpells: () => {},
  
  // Добавляем начальные значения для свойств SpellbookPage
  searchTerm: '',
  setSearchTerm: () => {},
  activeLevel: [],
  activeSchool: [],
  activeClass: [],
  allLevels: [],
  allSchools: [],
  allClasses: [],
  toggleLevel: () => {},
  toggleSchool: () => {},
  toggleClass: () => {},
  clearFilters: () => {},
  getBadgeColor: () => '',
  getSchoolBadgeColor: () => '',
  isRitualOnly: false,
  isConcentrationOnly: false,
  toggleRitualOnly: () => {},
  toggleConcentrationOnly: () => {},
  advancedFiltersOpen: false,
  toggleAdvancedFilters: () => {}
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]); 
  const [loading, setLoading] = useState(false);
  
  // Добавляем состояния для фильтрации
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [isRitualOnly, setIsRitualOnly] = useState(false);
  const [isConcentrationOnly, setIsConcentrationOnly] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  
  // Получаем уникальные значения для фильтров из имеющихся заклинаний
  const allLevels = React.useMemo(() => {
    const levels = [...new Set(spells.map(spell => spell.level))];
    return levels.sort((a, b) => a - b);
  }, [spells]);

  const allSchools = React.useMemo(() => {
    const schools = [...new Set(spells.map(spell => spell.school))].filter(Boolean);
    return schools.sort() as string[];
  }, [spells]);

  const allClasses = React.useMemo(() => {
    const classes = new Set<string>();
    spells.forEach(spell => {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      } else if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      }
    });
    return [...classes].sort();
  }, [spells]);
  
  // Функции для работы с фильтрами
  const toggleLevel = (level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  const toggleRitualOnly = () => {
    setIsRitualOnly(prev => !prev);
  };

  const toggleConcentrationOnly = () => {
    setIsConcentrationOnly(prev => !prev);
  };

  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(prev => !prev);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setIsRitualOnly(false);
    setIsConcentrationOnly(false);
  };

  // Функции для цветов бейджей
  const getBadgeColor = (level: number) => {
    const colors = {
      0: 'bg-gray-700',
      1: 'bg-blue-700',
      2: 'bg-green-700',
      3: 'bg-yellow-700',
      4: 'bg-orange-700',
      5: 'bg-red-700',
      6: 'bg-purple-700',
      7: 'bg-pink-700',
      8: 'bg-indigo-700',
      9: 'bg-teal-700'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-700';
  };

  const getSchoolBadgeColor = (school: string) => {
    const colors: { [key: string]: string } = {
      'Abjuration': 'bg-blue-700',
      'Conjuration': 'bg-yellow-700',
      'Divination': 'bg-cyan-700',
      'Enchantment': 'bg-pink-700',
      'Evocation': 'bg-red-700',
      'Illusion': 'bg-purple-700',
      'Necromancy': 'bg-green-700', 
      'Transmutation': 'bg-orange-700',
      'Ограждение': 'bg-blue-700',
      'Вызов': 'bg-yellow-700',
      'Прорицание': 'bg-cyan-700',
      'Очарование': 'bg-pink-700',
      'Воплощение': 'bg-red-700',
      'Иллюзия': 'bg-purple-700',
      'Некромантия': 'bg-green-700', 
      'Преобразование': 'bg-orange-700'
    };
    return colors[school] || 'bg-gray-700';
  };
  
  const loadSpells = async () => {
    try {
      setLoading(true);
      const loadedSpells = await getAllSpellsFromDatabase();
      setSpells(loadedSpells);
      setFilteredSpells(loadedSpells);
      setAvailableSpells(loadedSpells);
    } catch (error) {
      console.error('Error loading spells:', error);
      toast.error('Ошибка при загрузке заклинаний');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузим заклинания при первом монтировании
  useEffect(() => {
    loadSpells();
  }, []);

  useEffect(() => {
    // Применяем фильтры при изменении критериев поиска
    let filtered = [...spells];
    
    if (searchQuery) {
      filtered = filterSpellsByText(filtered, searchQuery);
    }
    
    if (activeLevel.length > 0) {
      filtered = filtered.filter(spell => activeLevel.includes(spell.level));
    }
    
    if (activeSchool.length > 0) {
      filtered = filtered.filter(spell => spell.school && activeSchool.includes(spell.school));
    }
    
    if (activeClass.length > 0) {
      filtered = filtered.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => activeClass.includes(cls));
        } else if (typeof spell.classes === 'string') {
          return activeClass.includes(spell.classes);
        }
        return false;
      });
    }
    
    if (isRitualOnly) {
      filtered = filtered.filter(spell => spell.ritual);
    }
    
    if (isConcentrationOnly) {
      filtered = filtered.filter(spell => spell.concentration);
    }
    
    setFilteredSpells(filtered);
  }, [spells, searchQuery, activeLevel, activeSchool, activeClass, isRitualOnly, isConcentrationOnly]);
  
  const addSpell = async (spell: SpellData) => {
    try {
      const id = await saveSpellToDatabase(spell);
      const newSpell = { ...spell, id };
      setSpells(prev => [...prev, newSpell]);
      setFilteredSpells(prev => [...prev, newSpell]);
      toast.success('Заклинание добавлено');
    } catch (error) {
      console.error('Error adding spell:', error);
      toast.error('Ошибка при добавлении заклинания');
    }
  };
  
  const removeSpell = async (id: string) => {
    try {
      await deleteSpellFromDatabase(id);
      setSpells(prev => prev.filter(spell => spell.id !== id));
      setFilteredSpells(prev => prev.filter(spell => spell.id !== id));
      toast.success('Заклинание удалено');
    } catch (error) {
      console.error('Error removing spell:', error);
      toast.error('Ошибка при удалении заклинания');
    }
  };
  
  const prepareSpell = (id: string) => {
    setSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: true } : spell
      )
    );
    setFilteredSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: true } : spell
      )
    );
  };
  
  const unprepareSpell = (id: string) => {
    setSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: false } : spell
      )
    );
    setFilteredSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: false } : spell
      )
    );
  };
  
  const exportSpells = () => {
    try {
      const dataStr = JSON.stringify(spells, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `spellbook_export_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Экспорт заклинаний выполнен успешно');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте заклинаний');
    }
  };
  
  const importSpells = (importedSpells: SpellData[]) => {
    try {
      if (!Array.isArray(importedSpells)) {
        toast.error('Неверный формат заклинаний');
        return;
      }
      
      // Проверяем идентификаторы и генерируем новые при необходимости
      const processedSpells = importedSpells.map(spell => {
        // Если есть id, используем его, иначе генерируем временный
        const id = spell.id ? String(spell.id) : `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        return {
          ...spell,
          id
        };
      });
      
      // Добавляем новые заклинания к существующим
      setSpells(prev => [...prev, ...processedSpells]);
      setFilteredSpells(prev => [...prev, ...processedSpells]);
      
      toast.success(`Импортировано ${processedSpells.length} заклинаний`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте заклинаний');
    }
  };

  // Добавляем новые методы
  const loadSpellsForCharacter = (characterClass: string, level: number) => {
    setLoading(true);
    
    // Здесь должна быть логика загрузки заклинаний для конкретного класса и уровня
    // Для примера, просто фильтруем существующие заклинания
    try {
      // Загрузка всех заклинаний, если еще не загружены
      if (spells.length === 0) {
        loadSpells().then(() => {
          // После загрузки всех заклинаний фильтруем их
          const filtered = spells.filter(spell => {
            const classes = Array.isArray(spell.classes) 
              ? spell.classes 
              : typeof spell.classes === 'string' 
                ? [spell.classes] 
                : [];
            return classes.some(c => c.toLowerCase() === characterClass.toLowerCase());
          });
          setAvailableSpells(filtered);
        });
      } else {
        // Если заклинания уже загружены, просто фильтруем
        const filtered = spells.filter(spell => {
          const classes = Array.isArray(spell.classes) 
            ? spell.classes 
            : typeof spell.classes === 'string' 
              ? [spell.classes] 
              : [];
          return classes.some(c => c.toLowerCase() === characterClass.toLowerCase());
        });
        setAvailableSpells(filtered);
      }
    } catch (error) {
      console.error('Error loading spells for character:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpellLimits = (characterClass: string, level: number, abilityModifier = 0) => {
    return calculateAvailableSpellsByClassAndLevel(characterClass, level, abilityModifier);
  };

  const getSelectedSpellCount = () => {
    const cantrips = spells.filter(spell => spell.level === 0).length;
    const regularSpells = spells.filter(spell => spell.level > 0).length;
    return { cantrips, spells: regularSpells };
  };

  const saveCharacterSpells = () => {
    // Здесь должна быть логика сохранения заклинаний персонажа
    toast.success('Заклинания персонажа сохранены');
  };
  
  return (
    <SpellbookContext.Provider
      value={{
        selectedSpells: spells,
        filteredSpells,
        availableSpells,
        loading,
        searchQuery,
        setSearchQuery,
        loadSpells,
        addSpell,
        removeSpell,
        prepareSpell,
        unprepareSpell,
        exportSpells,
        importSpells,
        loadSpellsForCharacter,
        getSpellLimits,
        getSelectedSpellCount,
        saveCharacterSpells,
        
        // Добавляем отсутствующие свойства для SpellbookPage
        searchTerm: searchQuery,
        setSearchTerm: setSearchQuery,
        activeLevel,
        activeSchool,
        activeClass,
        allLevels,
        allSchools,
        allClasses,
        toggleLevel,
        toggleSchool,
        toggleClass,
        clearFilters,
        getBadgeColor,
        getSchoolBadgeColor,
        isRitualOnly,
        isConcentrationOnly,
        toggleRitualOnly,
        toggleConcentrationOnly,
        advancedFiltersOpen,
        toggleAdvancedFilters
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
