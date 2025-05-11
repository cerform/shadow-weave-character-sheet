
import { useState, useCallback, useEffect } from 'react';
import { SpellData, CharacterSpell, SpellFilters } from '@/types/spells';

export interface SpellbookHook {
  spells: SpellData[];
  characterSpells: CharacterSpell[];
  filteredSpells: SpellData[];
  spellFilters: SpellFilters;
  loading: boolean;
  error: Error | null;
  selectedSpells: SpellData[];
  availableSpells: SpellData[];
  setSpellFilters: (filters: Partial<SpellFilters>) => void;
  loadSpells: () => Promise<void>;
  loadSpellsForCharacter: (characterClass: string, characterLevel: number) => Promise<void>;
  addSpell: (spell: SpellData | CharacterSpell) => void;
  removeSpell: (spellId: string) => void;
  prepareSpell: (spellId: string, isPrepared: boolean) => void;
  setSelectedSpells: (spells: SpellData[]) => void;
  clearFilters: () => void;
}

// Default filter values
const defaultFilters: SpellFilters = {
  name: '',
  schools: [],
  levels: [],
  classes: [],
  ritual: null,
  concentration: null
};

// Main hook function
const useSpellbook = (): SpellbookHook => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [characterSpells, setCharacterSpells] = useState<CharacterSpell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [spellFilters, setSpellFilters] = useState<SpellFilters>(defaultFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);

  // Function to load all spells
  const loadSpells = useCallback(async () => {
    setLoading(true);
    try {
      // Mock implementation for now
      const sampleSpells: SpellData[] = [
        {
          id: "1",
          name: "Волшебная стрела",
          level: 1,
          school: "Эвокация",
          castingTime: "1 действие",
          range: "120 футов",
          components: "V, S",
          duration: "Мгновенная",
          description: "Вы создаете три светящиеся стрелы из магической энергии.",
          classes: ["Волшебник", "Чародей"],
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: false,
        },
        {
          id: "2",
          name: "Огненный шар",
          level: 3,
          school: "Эвокация",
          castingTime: "1 действие",
          range: "150 футов",
          components: "V, S, M",
          duration: "Мгновенная",
          description: "Яркая вспышка устремляется из указательного пальца к выбранной точке.",
          classes: ["Волшебник", "Чародей"],
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: true,
          materials: "Крошечный шарик серы и летучей смолы",
        }
      ];
      
      setSpells(sampleSpells);
      setFilteredSpells(sampleSpells);
      setAvailableSpells(sampleSpells);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load spells'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to load spells for a specific character class and level
  const loadSpellsForCharacter = useCallback(async (characterClass: string, characterLevel: number) => {
    setLoading(true);
    try {
      // This would connect to your API in a real implementation
      // For now we'll use the sample spells based on class/level filtering
      await loadSpells();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load spells for character'));
    } finally {
      setLoading(false);
    }
  }, [loadSpells]);

  // Apply filters to spells
  useEffect(() => {
    if (spells.length === 0) return;

    let result = [...spells];

    // Filter by name
    if (spellFilters.name) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(spellFilters.name.toLowerCase())
      );
    }

    // Filter by schools
    if (spellFilters.schools.length > 0) {
      result = result.filter(spell => 
        spellFilters.schools.includes(spell.school)
      );
    }

    // Filter by levels
    if (spellFilters.levels.length > 0) {
      result = result.filter(spell => 
        spellFilters.levels.includes(spell.level)
      );
    }

    // Filter by classes
    if (spellFilters.classes.length > 0) {
      result = result.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => 
            spellFilters.classes.includes(typeof cls === 'string' ? cls : '')
          );
        }
        return spellFilters.classes.includes(spell.classes.toString());
      });
    }

    // Filter by ritual
    if (spellFilters.ritual !== null) {
      result = result.filter(spell => spell.ritual === spellFilters.ritual);
    }

    // Filter by concentration
    if (spellFilters.concentration !== null) {
      result = result.filter(spell => spell.concentration === spellFilters.concentration);
    }

    setFilteredSpells(result);
  }, [spells, spellFilters]);

  // Function to update filters
  const updateSpellFilters = useCallback((filters: Partial<SpellFilters>) => {
    setSpellFilters(prev => ({ ...prev, ...filters }));
  }, []);

  // Function to add a spell to character spells
  const addSpell = useCallback((spell: SpellData | CharacterSpell) => {
    setCharacterSpells(prev => {
      // Avoid duplicates
      if (prev.some(s => s.id === spell.id || s.name === spell.name)) {
        return prev;
      }
      return [...prev, spell as CharacterSpell];
    });
  }, []);

  // Function to remove a spell from character spells
  const removeSpell = useCallback((spellId: string) => {
    setCharacterSpells(prev => prev.filter(spell => String(spell.id) !== spellId));
  }, []);

  // Function to toggle prepared state of a spell
  const prepareSpell = useCallback((spellId: string, isPrepared: boolean) => {
    setCharacterSpells(prev => prev.map(spell => {
      if (String(spell.id) === spellId) {
        return { ...spell, prepared: isPrepared };
      }
      return spell;
    }));
  }, []);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    setSpellFilters(defaultFilters);
  }, []);

  return {
    spells,
    characterSpells,
    filteredSpells,
    spellFilters,
    loading,
    error,
    selectedSpells,
    availableSpells,
    setSpellFilters: updateSpellFilters,
    loadSpells,
    loadSpellsForCharacter,
    addSpell,
    removeSpell,
    prepareSpell,
    setSelectedSpells,
    clearFilters
  };
};

export default useSpellbook;
