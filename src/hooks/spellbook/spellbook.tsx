
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SpellData, SpellFilters } from '@/types/spells';
import { convertCharacterSpellToSpellData } from '@/types/spells'; 
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';

// Тип контекста книги заклинаний
type SpellbookContextType = {
  spells: SpellData[];
  filteredSpells: SpellData[];
  loading: boolean;
  error: string | null;
  filters: SpellFilters;
  searchTerm: string;
  levelFilter: number[];
  classFilter: string[];
  schoolFilter: string[];
  ritualFilter: boolean | null;
  concentrationFilter: boolean | null;
  availableSpells: SpellData[];
  selectedSpell: SpellData | null;
  selectSpell: (spell: SpellData | null) => void;
  updateFilters: (newFilters: Partial<SpellFilters>) => void;
  resetFilters: () => void;
  fetchSpells: () => Promise<void>;
  getSpellById: (id: string | number) => SpellData | undefined;
  loadSpellsForCharacter: (characterClass: string, characterLevel: number) => void;
  setSearchTerm: (term: string) => void;
  setLevelFilter: (levels: number[]) => void;
  setClassFilter: (classes: string[]) => void;
  setSchoolFilter: (schools: string[]) => void;
  setRitualFilter: (ritual: boolean | null) => void;
  setConcentrationFilter: (concentration: boolean | null) => void;
};

// Создаем контекст с безопасными дефолтными значениями
const SpellbookContext = createContext<SpellbookContextType | undefined>(undefined);

// Провайдер для книги заклинаний
export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Используем хук для управления состоянием книги заклинаний
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<string[]>([]);
  const [ritualFilter, setRitualFilter] = useState<boolean | null>(null);
  const [concentrationFilter, setConcentrationFilter] = useState<boolean | null>(null);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const { toast } = useToast();

  // Filters object to match the SpellFilters type
  const filters: SpellFilters = {
    name: searchTerm,
    schools: schoolFilter,
    levels: levelFilter,
    classes: classFilter,
    ritual: ritualFilter,
    concentration: concentrationFilter
  };

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<SpellFilters>) => {
    if (newFilters.name !== undefined) setSearchTerm(newFilters.name);
    if (newFilters.levels !== undefined) setLevelFilter(newFilters.levels);
    if (newFilters.classes !== undefined) setClassFilter(newFilters.classes);
    if (newFilters.schools !== undefined) setSchoolFilter(newFilters.schools);
    if (newFilters.ritual !== undefined) setRitualFilter(newFilters.ritual);
    if (newFilters.concentration !== undefined) setConcentrationFilter(newFilters.concentration);
  }, []);

  // Reset filters function
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setLevelFilter([]);
    setClassFilter([]);
    setSchoolFilter([]);
    setRitualFilter(null);
    setConcentrationFilter(null);
  }, []);

  // Загрузка заклинаний
  const fetchSpells = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allSpells = getAllSpells();
      setSpells(allSpells);
      setFilteredSpells(allSpells);
      setAvailableSpells(allSpells);
      console.log("Загружено заклинаний:", allSpells.length);
    } catch (err) {
      console.error("Ошибка загрузки заклинаний:", err);
      setError("Не удалось загрузить заклинания");
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заклинания",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Загружаем заклинания при монтировании компонента
  useEffect(() => {
    fetchSpells();
  }, [fetchSpells]);

  // Получение заклинания по идентификатору
  const getSpellById = useCallback((id: string | number): SpellData | undefined => {
    const idStr = id.toString();
    return spells.find(spell => spell.id.toString() === idStr);
  }, [spells]);

  // Загрузка заклинаний для конкретного класса и уровня
  const loadSpellsForCharacter = useCallback((characterClass: string, characterLevel: number) => {
    console.log(`Loading spells for ${characterClass} (level ${characterLevel})`);
    
    try {
      // Фильтруем по классу
      const filteredByClass = spells.filter(spell => {
        const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
        return spellClasses.some(c => 
          typeof c === 'string' && c.toLowerCase() === characterClass.toLowerCase()
        );
      });
      
      // Фильтруем по уровню (максимальный уровень заклинаний для персонажа)
      const maxLevel = Math.min(9, Math.ceil(characterLevel / 2));
      const filteredByLevel = filteredByClass.filter(spell => spell.level <= maxLevel);
      
      setAvailableSpells(filteredByLevel);
      console.log(`Found ${filteredByLevel.length} spells for ${characterClass} (max level ${maxLevel})`);
    } catch (error) {
      console.error("Error loading spells for character:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить заклинания для класса ${characterClass}`,
        variant: "destructive"
      });
    }
  }, [spells, toast]);

  // Применение фильтров при их изменении
  useEffect(() => {
    let result = [...spells];

    // Поиск по названию
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(spell => {
        const nameMatch = spell.name.toLowerCase().includes(searchLower);
        
        // Проверяем описание
        let descMatch = false;
        if (typeof spell.description === 'string') {
          descMatch = spell.description.toLowerCase().includes(searchLower);
        } else if (Array.isArray(spell.description)) {
          descMatch = spell.description.some(desc => 
            typeof desc === 'string' && desc.toLowerCase().includes(searchLower)
          );
        }
        
        return nameMatch || descMatch;
      });
    }

    // Фильтр по уровню заклинаний
    if (levelFilter.length > 0) {
      result = result.filter(spell => levelFilter.includes(spell.level));
    }

    // Фильтр по школе магии
    if (schoolFilter.length > 0) {
      result = result.filter(spell => {
        return spell.school && schoolFilter.includes(spell.school);
      });
    }

    // Фильтр по классу персонажей
    if (classFilter.length > 0) {
      result = result.filter(spell => {
        if (typeof spell.classes === 'string') {
          return classFilter.includes(spell.classes);
        }
        
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => 
            typeof cls === 'string' && classFilter.includes(cls)
          );
        }
        
        return false;
      });
    }

    // Фильтр по ритуальности
    if (ritualFilter !== null) {
      result = result.filter(spell => spell.ritual === ritualFilter);
    }

    // Фильтр по концентрации
    if (concentrationFilter !== null) {
      result = result.filter(spell => spell.concentration === concentrationFilter);
    }

    setFilteredSpells(result);
  }, [spells, searchTerm, levelFilter, classFilter, schoolFilter, ritualFilter, concentrationFilter]);

  // Выбор заклинания для детального просмотра
  const selectSpell = useCallback((spell: SpellData | null) => {
    setSelectedSpell(spell);
  }, []);

  // Значение для провайдера контекста
  const contextValue: SpellbookContextType = {
    spells,
    filteredSpells,
    loading,
    error,
    filters,
    searchTerm,
    levelFilter,
    classFilter,
    schoolFilter,
    ritualFilter,
    concentrationFilter,
    availableSpells,
    selectedSpell,
    selectSpell,
    updateFilters,
    resetFilters,
    fetchSpells,
    getSpellById,
    loadSpellsForCharacter,
    setSearchTerm,
    setLevelFilter,
    setClassFilter,
    setSchoolFilter,
    setRitualFilter,
    setConcentrationFilter
  };

  return (
    <SpellbookContext.Provider value={contextValue}>
      {children}
    </SpellbookContext.Provider>
  );
};

// Хук для использования контекста книги заклинаний
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};
