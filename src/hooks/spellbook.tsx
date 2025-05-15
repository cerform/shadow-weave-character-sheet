
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpellData, SpellFilters } from '@/types/spells';
import { getAllSpells } from '@/data/spells';
import { useToast } from './use-toast';

interface SpellbookContextType {
  spells: SpellData[];
  filteredSpells: SpellData[];
  availableSpells: SpellData[]; 
  selectedSpell: SpellData | null;
  searchTerm: string;
  levelFilter: number[];
  classFilter: string[];
  schoolFilter: string[];
  ritualFilter: boolean | null;
  concentrationFilter: boolean | null;
  loading: boolean;
  filters: SpellFilters;
  updateFilters: (newFilters: Partial<SpellFilters>) => void;
  setSearchTerm: (term: string) => void;
  setLevelFilter: (levels: number[]) => void;
  setClassFilter: (classes: string[]) => void;
  setSchoolFilter: (schools: string[]) => void;
  setRitualFilter: (ritual: boolean | null) => void;
  setConcentrationFilter: (concentration: boolean | null) => void;
  selectSpell: (spell: SpellData | null) => void;
  resetFilters: () => void;
  loadSpellsForCharacter: (className: string, level: number) => void;
}

const defaultFilters: SpellFilters = {
  name: '',
  schools: [],
  levels: [],
  classes: [],
  ritual: null,
  concentration: null
};

const SpellbookContext = createContext<SpellbookContextType>({
  spells: [],
  filteredSpells: [],
  availableSpells: [],
  selectedSpell: null,
  searchTerm: '',
  levelFilter: [],
  classFilter: [],
  schoolFilter: [],
  ritualFilter: null,
  concentrationFilter: null,
  loading: false,
  filters: defaultFilters,
  updateFilters: () => {},
  setSearchTerm: () => {},
  setLevelFilter: () => {},
  setClassFilter: () => {},
  setSchoolFilter: () => {},
  setRitualFilter: () => {},
  setConcentrationFilter: () => {},
  selectSpell: () => {},
  resetFilters: () => {},
  loadSpellsForCharacter: () => {},
});

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SpellFilters>(defaultFilters);
  const { toast } = useToast();
  
  // Separate state variables for each filter for easier access
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<string[]>([]);
  const [ritualFilter, setRitualFilter] = useState<boolean | null>(null);
  const [concentrationFilter, setConcentrationFilter] = useState<boolean | null>(null);

  // Initialize spells
  useEffect(() => {
    loadSpells();
  }, []);

  // Filter spells when filters change
  useEffect(() => {
    filterSpells();
  }, [filters, spells]);

  // Load all spells
  const loadSpells = async () => {
    setLoading(true);
    try {
      const allSpells = getAllSpells();
      setSpells(allSpells);
      setFilteredSpells(allSpells);
      setAvailableSpells(allSpells);
      console.log("Loaded spells:", allSpells.length);
    } catch (error) {
      console.error("Error loading spells:", error);
      toast({
        title: "Ошибка загрузки заклинаний",
        description: "Не удалось загрузить базу заклинаний",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter spells based on current filters
  const filterSpells = () => {
    if (spells.length === 0) return;

    let result = [...spells];

    // Filter by name
    if (filters.name) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by schools
    if (filters.schools.length > 0) {
      result = result.filter(spell => 
        filters.schools.includes(spell.school)
      );
    }

    // Filter by levels
    if (filters.levels.length > 0) {
      result = result.filter(spell => 
        filters.levels.includes(spell.level)
      );
    }

    // Filter by classes
    if (filters.classes.length > 0) {
      result = result.filter(spell => {
        if (typeof spell.classes === 'string') {
          return filters.classes.includes(spell.classes);
        }
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => filters.classes.includes(cls));
        }
        return false;
      });
    }

    // Filter by ritual
    if (filters.ritual !== null) {
      result = result.filter(spell => spell.ritual === filters.ritual);
    }

    // Filter by concentration
    if (filters.concentration !== null) {
      result = result.filter(spell => spell.concentration === filters.concentration);
    }

    setFilteredSpells(result);
  };

  // Update filters
  const updateFilters = (newFilters: Partial<SpellFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Sync with individual filter states
      if (newFilters.name !== undefined) setSearchTerm(newFilters.name);
      if (newFilters.levels !== undefined) setLevelFilter(newFilters.levels);
      if (newFilters.classes !== undefined) setClassFilter(newFilters.classes);
      if (newFilters.schools !== undefined) setSchoolFilter(newFilters.schools);
      if (newFilters.ritual !== undefined) setRitualFilter(newFilters.ritual);
      if (newFilters.concentration !== undefined) setConcentrationFilter(newFilters.concentration);
      
      return updated;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setLevelFilter([]);
    setClassFilter([]);
    setSchoolFilter([]);
    setRitualFilter(null);
    setConcentrationFilter(null);
  };

  // Load spells for a specific character class and level
  const loadSpellsForCharacter = (className: string, level: number) => {
    setLoading(true);
    try {
      // Reset filters first
      resetFilters();
      
      // Then set new filters based on character class
      if (className) {
        updateFilters({ classes: [className] });
      }
      
      console.log(`Loading spells for class: ${className} (level ${level})`);
    } catch (error) {
      console.error("Error loading spells for character:", error);
      toast({
        title: "Ошибка загрузки заклинаний",
        description: `Не удалось загрузить заклинания для класса ${className}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpellbookContext.Provider
      value={{
        spells,
        filteredSpells,
        availableSpells,
        selectedSpell,
        searchTerm,
        levelFilter,
        classFilter,
        schoolFilter,
        ritualFilter,
        concentrationFilter,
        loading,
        filters,
        updateFilters,
        setSearchTerm: (term: string) => {
          setSearchTerm(term);
          updateFilters({ name: term });
        },
        setLevelFilter: (levels: number[]) => {
          setLevelFilter(levels);
          updateFilters({ levels });
        },
        setClassFilter: (classes: string[]) => {
          setClassFilter(classes);
          updateFilters({ classes });
        },
        setSchoolFilter: (schools: string[]) => {
          setSchoolFilter(schools);
          updateFilters({ schools });
        },
        setRitualFilter: (ritual: boolean | null) => {
          setRitualFilter(ritual);
          updateFilters({ ritual });
        },
        setConcentrationFilter: (concentration: boolean | null) => {
          setConcentrationFilter(concentration);
          updateFilters({ concentration });
        },
        selectSpell: (spell: SpellData | null) => setSelectedSpell(spell),
        resetFilters,
        loadSpellsForCharacter,
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
