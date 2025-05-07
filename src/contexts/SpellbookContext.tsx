
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { SpellData, SpellFilter } from '@/types/spells';
import { CharacterSpell, Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';
import { filterSpells } from '@/utils/spellHelpers';
import { filterSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import { convertCharacterSpellToSpellData } from '@/types/spells';

export interface SpellbookContextProps {
  spells: SpellData[];
  filteredSpells: SpellData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  selectedSpells: SpellData[];
  setSelectedSpells: React.Dispatch<React.SetStateAction<SpellData[]>>;
  loadSpellsForClass: (className: string) => SpellData[];
  filterSpellsByLevel: (level: number) => SpellData[];
  toggleFilter: (type: 'level' | 'school' | 'class', value: any) => void;
  isFilterActive: (type: 'level' | 'school' | 'class', value: any) => boolean;
  resetFilters: () => void;
  loading: boolean;
  searchSpells: (term: string) => void;
}

const SpellbookContext = createContext<SpellbookContextProps | null>(null);

export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { theme } = useTheme();
  const { toast } = useToast();

  // Get all levels
  const allLevels = Array.from(new Set(spells.map(s => s.level))).sort();
  
  // Get all schools
  const allSchools = Array.from(new Set(spells.map(s => s.school))).sort();
  
  // Get all classes
  const allClasses = Array.from(
    new Set(
      spells.flatMap(s => {
        if (Array.isArray(s.classes)) return s.classes;
        return [s.classes];
      })
    )
  ).sort();

  // Load all spells when component mounts
  useEffect(() => {
    try {
      const allSpellsData = getAllSpells();
      setSpells(allSpellsData);
      setFilteredSpells(allSpellsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load spells:", error);
      toast({
        title: "Ошибка загрузки заклинаний",
        description: "Не удалось загрузить список заклинаний.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Filter spells based on search and active filters
  useEffect(() => {
    let filtered = [...spells];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.description.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply level filter
    if (activeLevel.length > 0) {
      filtered = filtered.filter(spell => activeLevel.includes(spell.level));
    }
    
    // Apply school filter
    if (activeSchool.length > 0) {
      filtered = filtered.filter(spell => activeSchool.includes(spell.school));
    }
    
    // Apply class filter
    if (activeClass.length > 0) {
      filtered = filtered.filter(spell => {
        const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
        return spellClasses.some(c => activeClass.includes(c));
      });
    }
    
    setFilteredSpells(filtered);
  }, [spells, searchTerm, activeLevel, activeSchool, activeClass]);

  // Load spells for a specific class
  const loadSpellsForClass = useCallback((className: string): SpellData[] => {
    if (!className) return [];
    
    const classSpells = spells.filter(spell => {
      const classes = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      return classes.some(c => c?.toLowerCase() === className?.toLowerCase());
    });
    
    return classSpells;
  }, [spells]);

  // Filter spells by level
  const filterSpellsByLevel = useCallback((level: number): SpellData[] => {
    return spells.filter(spell => spell.level === level);
  }, [spells]);

  // Search spells by term
  const searchSpells = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Toggle filters
  const toggleFilter = useCallback((type: 'level' | 'school' | 'class', value: any) => {
    switch (type) {
      case 'level':
        setActiveLevel(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'school':
        setActiveSchool(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'class':
        setActiveClass(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
    }
  }, []);

  // Check if a filter is active
  const isFilterActive = useCallback((type: 'level' | 'school' | 'class', value: any): boolean => {
    switch (type) {
      case 'level':
        return activeLevel.includes(value);
      case 'school':
        return activeSchool.includes(value);
      case 'class':
        return activeClass.includes(value);
      default:
        return false;
    }
  }, [activeLevel, activeSchool, activeClass]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  }, []);

  return (
    <SpellbookContext.Provider
      value={{
        spells,
        filteredSpells,
        searchTerm,
        setSearchTerm,
        activeLevel,
        activeSchool,
        activeClass,
        allLevels,
        allSchools,
        allClasses,
        selectedSpells,
        setSelectedSpells,
        loadSpellsForClass,
        filterSpellsByLevel,
        toggleFilter,
        isFilterActive,
        resetFilters,
        loading,
        searchSpells
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};
