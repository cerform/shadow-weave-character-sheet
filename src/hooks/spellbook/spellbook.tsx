
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SpellData, SpellFilters } from '@/types/spells';
import { useSpellbook as useSpellbookHook } from './useSpellbook';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';

// Тип контекста книги заклинаний
type SpellbookContextType = ReturnType<typeof useSpellbookHook>;

// Создаем контекст с безопасными дефолтными значениями
const SpellbookContext = createContext<SpellbookContextType | undefined>(undefined);

// Провайдер для книги заклинаний
export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Используем хук для управления состоянием книги заклинаний
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<string[]>([]);
  const [ritualFilter, setRitualFilter] = useState<boolean | null>(null);
  const [concentrationFilter, setConcentrationFilter] = useState<boolean | null>(null);
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
  }, [spells, searchTerm, levelFilter, schoolFilter, classFilter, ritualFilter, concentrationFilter]);

  // Сброс всех фильтров
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setLevelFilter([]);
    setSchoolFilter([]);
    setClassFilter([]);
    setRitualFilter(null);
    setConcentrationFilter(null);
  }, []);

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
    searchTerm,
    levelFilter,
    classFilter,
    schoolFilter,
    ritualFilter,
    concentrationFilter,
    selectedSpell,
    setSearchTerm,
    setLevelFilter,
    setSchoolFilter,
    setClassFilter,
    setRitualFilter,
    setConcentrationFilter,
    selectSpell,
    resetFilters,
    fetchSpells
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
