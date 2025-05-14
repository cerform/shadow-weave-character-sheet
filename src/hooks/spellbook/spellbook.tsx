
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
  availableSpells: SpellData[];
  updateFilters: (newFilters: Partial<SpellFilters>) => void;
  resetFilters: () => void;
  fetchSpells: () => Promise<void>;
  getSpellById: (id: string | number) => SpellData | undefined;
  loadSpellsForCharacter: (characterClass: string, characterLevel: number) => void;
  selectedSpell: SpellData | null;
  selectSpell: (spell: SpellData | null) => void;
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
  const [filters, setFilters] = useState<SpellFilters>({
    name: '',
    schools: [],
    levels: [],
    classes: [],
    ritual: null,
    concentration: null
  });
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const { toast } = useToast();

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

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<SpellFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setFilters({
      name: '',
      schools: [],
      levels: [],
      classes: [],
      ritual: null,
      concentration: null
    });
  }, []);

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
    if (filters.name) {
      const searchLower = filters.name.toLowerCase();
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
    if (filters.levels.length > 0) {
      result = result.filter(spell => filters.levels.includes(spell.level));
    }

    // Фильтр по школе магии
    if (filters.schools.length > 0) {
      result = result.filter(spell => {
        return spell.school && filters.schools.includes(spell.school);
      });
    }

    // Фильтр по классу персонажей
    if (filters.classes.length > 0) {
      result = result.filter(spell => {
        if (typeof spell.classes === 'string') {
          return filters.classes.includes(spell.classes);
        }
        
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => 
            typeof cls === 'string' && filters.classes.includes(cls)
          );
        }
        
        return false;
      });
    }

    // Фильтр по ритуальности
    if (filters.ritual !== null) {
      result = result.filter(spell => spell.ritual === filters.ritual);
    }

    // Фильтр по концентрации
    if (filters.concentration !== null) {
      result = result.filter(spell => spell.concentration === filters.concentration);
    }

    setFilteredSpells(result);
  }, [spells, filters]);

  // Выбор заклинания для детального просмотра
  const selectSpell = useCallback((spell: SpellData | null) => {
    setSelectedSpell(spell);
  }, []);

  // Значение для провайдера контекста
  const contextValue = {
    spells,
    filteredSpells,
    loading,
    error,
    filters,
    availableSpells,
    updateFilters,
    resetFilters,
    fetchSpells,
    getSpellById,
    loadSpellsForCharacter,
    selectedSpell,
    selectSpell
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
