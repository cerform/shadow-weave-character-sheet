import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpells, getSpellsByClass } from '@/data/spells';
import { useCharacter } from './CharacterContext';
import { useToast } from '@/hooks/use-toast';

interface SpellbookContextProps {
  availableSpells: SpellData[];
  selectedSpells: SpellData[];
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
  getSpellLimits: () => { cantrips: number; spells: number };
  getSelectedSpellCount: () => number;
  saveCharacterSpells: () => void;
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
}

const SpellbookContext = createContext<SpellbookContextProps>({
  availableSpells: [],
  selectedSpells: [],
  addSpell: () => {},
  removeSpell: () => {},
  getSpellLimits: () => ({ cantrips: 0, spells: 0 }),
  getSelectedSpellCount: () => 0,
  saveCharacterSpells: () => {},
  loadSpellsForCharacter: () => {},
});

export const useSpellbook = () => useContext(SpellbookContext);

interface SpellbookProviderProps {
  children: React.ReactNode;
}

export const SpellbookProvider: React.FC<SpellbookProviderProps> = ({ children }) => {
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();

  // Load spells from data on mount
  useEffect(() => {
    const allSpells = getAllSpells();
    setAvailableSpells(allSpells);
  }, []);

  // Convert CharacterSpell to SpellData
  const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
    return {
      id: spell.id || `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Evocation',
      castingTime: spell.castingTime || '1 action',
      range: spell.range || 'Self',
      components: spell.components || '',
      duration: spell.duration || 'Instantaneous',
      description: spell.description || '',
      classes: spell.classes || [],
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      materials: spell.materials || '',
      prepared: spell.prepared || false
    };
  };

  // Update character spells
  useEffect(() => {
    if (character?.spells) {
      const characterSpells = character.spells
        .filter((spell): spell is CharacterSpell => typeof spell !== 'string')
        .map(convertCharacterSpellToSpellData);
      
      setSelectedSpells(characterSpells);
    }
  }, [character]);

  // Function to add a spell to the selected spells
  const addSpell = (spell: SpellData) => {
    // Create a CharacterSpell from SpellData
    const characterSpell: CharacterSpell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      classes: spell.classes,
      ritual: spell.ritual,
      concentration: spell.concentration,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials,
      prepared: spell.prepared
    };
    
    setSelectedSpells(prevSpells => {
      const updatedSpells = [...prevSpells, characterSpell];
      return updatedSpells;
    });
  };

  // Function to remove a spell from the selected spells
  const removeSpell = (spellId: string) => {
    setSelectedSpells(prevSpells => {
      const updatedSpells = prevSpells.filter(spell => spell.id.toString() !== spellId);
      return updatedSpells;
    });
  };

  // Function to get spell limits based on character class and level
  const getSpellLimits = () => {
    // Placeholder logic - replace with actual calculation
    return { cantrips: 3, spells: 5 };
  };

  // Function to get the number of selected spells
  const getSelectedSpellCount = () => {
    return selectedSpells.length;
  };

  // Function to save selected spells to the character
  const saveCharacterSpells = () => {
    if (!character) return;
    
    // Convert SpellData[] to CharacterSpell[]
    const characterSpells: CharacterSpell[] = selectedSpells.map(spell => ({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      classes: spell.classes,
      prepared: true // Set default value for prepared
    }));
    
    // Update character state with the new spells
    updateCharacter({ spells: characterSpells });
    
    toast({
      title: "Заклинания сохранены",
      description: "Выбранные заклинания сохранены для персонажа",
    });
  };

  // Function to load spells for a character based on class and level
  const loadSpellsForCharacter = useCallback((characterClass: string, level: number) => {
    try {
      // Fetch spells for the given class
      const classSpells = getSpellsByClass(characterClass);
      
      // Filter spells based on level
      const maxSpellLevel = Math.ceil(level / 2);
      const filteredSpells = classSpells.filter(spell => spell.level <= maxSpellLevel);
      
      // Convert to SpellData[]
      const spells: SpellData[] = filteredSpells.map(spell => ({
        id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell.name,
        level: spell.level,
        school: spell.school || 'Универсальная',
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'На себя',
        components: spell.components || '',
        duration: spell.duration || 'Мгновенная',
        description: spell.description || ['Нет описания'],
        classes: spell.classes || [],
        ritual: spell.ritual || false,
        concentration: spell.concentration || false
      }));
      
      // Update available spells in the context
      setAvailableSpells(spells);
    } catch (error) {
      console.error("Error loading spells:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список заклинаний",
        variant: "destructive"
      });
    }
  }, [toast]);

  const value: SpellbookContextProps = {
    availableSpells,
    selectedSpells,
    addSpell,
    removeSpell,
    getSpellLimits,
    getSelectedSpellCount,
    saveCharacterSpells,
    loadSpellsForCharacter,
  };

  return (
    <SpellbookContext.Provider value={value}>
      {children}
    </SpellbookContext.Provider>
  );
};
