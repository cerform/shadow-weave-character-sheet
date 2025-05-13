
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpellData } from '@/types/spells';
import { getAllSpells } from '@/data/spells';
import { useToast } from './use-toast';

interface SpellbookContextType {
  spells: SpellData[];
  filteredSpells: SpellData[];
  availableSpells: SpellData[]; // Добавляем отсутствующее свойство
  selectedSpell: SpellData | null;
  searchTerm: string;
  levelFilter: number[];
  classFilter: string[];
  schoolFilter: string[];
  ritualFilter: boolean | null;
  concentrationFilter: boolean | null;
  setSearchTerm: (term: string) => void;
  setLevelFilter: (levels: number[]) => void;
  setClassFilter: (classes: string[]) => void;
  setSchoolFilter: (schools: string[]) => void;
  setRitualFilter: (ritual: boolean | null) => void;
  setConcentrationFilter: (concentration: boolean | null) => void;
  selectSpell: (spell: SpellData | null) => void;
  resetFilters: () => void;
  loadSpellsForCharacter: (className: string, level: number) => void; // Добавляем отсутствующую функцию
}

const SpellbookContext = createContext<SpellbookContextType>({
  spells: [],
  filteredSpells: [],
  availableSpells: [], // Добавляем отсутствующее свойство
  selectedSpell: null,
  searchTerm: '',
  levelFilter: [],
  classFilter: [],
  schoolFilter: [],
  ritualFilter: null,
  concentrationFilter: null,
  setSearchTerm: () => {},
  setLevelFilter: () => {},
  setClassFilter: () => {},
  setSchoolFilter: () => {},
  setRitualFilter: () => {},
  setConcentrationFilter: () => {},
  selectSpell: () => {},
  resetFilters: () => {},
  loadSpellsForCharacter: () => {}, // Добавляем отсутствующую функцию
});

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]); // Добавляем отсутствующее состояние
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<string[]>([]);
  const [ritualFilter, setRitualFilter] = useState<boolean | null>(null);
  const [concentrationFilter, setConcentrationFilter] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Initialize spells
  React.useEffect(() => {
    try {
      const allSpells = getAllSpells();
      setSpells(allSpells);
      setFilteredSpells(allSpells);
      setAvailableSpells(allSpells); // Инициализируем доступные заклинания
      console.log("Loaded spells:", allSpells.length);
    } catch (error) {
      console.error("Error loading spells:", error);
      toast({
        title: "Ошибка загрузки заклинаний",
        description: "Не удалось загрузить базу заклинаний",
        variant: "destructive"
      });
    }
  }, []);

  // Добавляем функцию для загрузки заклинаний для конкретного класса и уровня
  const loadSpellsForCharacter = (className: string, level: number) => {
    try {
      const allSpells = getAllSpells();
      
      // Получаем максимальный уровень заклинаний для данного уровня персонажа
      const maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      
      // Фильтруем заклинания по классу и уровню
      const classSpells = allSpells.filter(spell => {
        // Проверяем, подходит ли заклинание для этого класса
        const classMatch = Array.isArray(spell.classes) 
          ? spell.classes.some(c => c.toLowerCase() === className.toLowerCase())
          : String(spell.classes).toLowerCase() === className.toLowerCase();
        
        // Проверяем, доступен ли уровень заклинания
        const levelMatch = spell.level <= maxSpellLevel;
        
        return classMatch && levelMatch;
      });
      
      setAvailableSpells(classSpells);
      console.log(`Loaded ${classSpells.length} spells for ${className} (level ${level})`);
    } catch (error) {
      console.error("Error loading spells for character:", error);
      toast({
        title: "Ошибка загрузки заклинаний",
        description: `Не удалось загрузить заклинания для класса ${className}`,
        variant: "destructive"
      });
    }
  };

  // Apply filters when any filter changes
  React.useEffect(() => {
    let result = [...spells];

    // Search term filter
    if (searchTerm) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (typeof spell.description === 'string' ? 
          spell.description.toLowerCase().includes(searchTerm.toLowerCase()) : 
          Array.isArray(spell.description) && 
          spell.description.some(desc => desc.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Level filter
    if (levelFilter.length > 0) {
      result = result.filter(spell => levelFilter.includes(spell.level));
    }

    // Class filter
    if (classFilter.length > 0) {
      result = result.filter(spell => {
        if (!spell.classes) return false;
        
        const spellClasses = Array.isArray(spell.classes) 
          ? spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '')
          : [String(spell.classes).toLowerCase()];
          
        return classFilter.some(cls => 
          spellClasses.includes(cls.toLowerCase())
        );
      });
    }

    // School filter
    if (schoolFilter.length > 0) {
      result = result.filter(spell => 
        spell.school && schoolFilter.includes(spell.school)
      );
    }

    // Ritual filter
    if (ritualFilter !== null) {
      result = result.filter(spell => spell.ritual === ritualFilter);
    }

    // Concentration filter
    if (concentrationFilter !== null) {
      result = result.filter(spell => spell.concentration === concentrationFilter);
    }

    setFilteredSpells(result);
  }, [searchTerm, levelFilter, classFilter, schoolFilter, ritualFilter, concentrationFilter, spells]);

  const selectSpell = (spell: SpellData | null) => {
    setSelectedSpell(spell);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setLevelFilter([]);
    setClassFilter([]);
    setSchoolFilter([]);
    setRitualFilter(null);
    setConcentrationFilter(null);
  };

  return (
    <SpellbookContext.Provider
      value={{
        spells,
        filteredSpells,
        availableSpells, // Добавляем отсутствующее свойство
        selectedSpell,
        searchTerm,
        levelFilter,
        classFilter,
        schoolFilter,
        ritualFilter,
        concentrationFilter,
        setSearchTerm,
        setLevelFilter,
        setClassFilter,
        setSchoolFilter,
        setRitualFilter,
        setConcentrationFilter,
        selectSpell,
        resetFilters,
        loadSpellsForCharacter // Добавляем отсутствующую функцию
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
