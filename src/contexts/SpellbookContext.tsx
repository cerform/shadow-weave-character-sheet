
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { convertToSpellData } from '@/utils/spellUtils';
import { useToast } from '@/hooks/use-toast';

interface SpellbookContextProps {
  availableSpells: SpellData[];
  selectedSpells: SpellData[];
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
  importSpells: (spells: CharacterSpell[]) => void;
  saveCharacterSpells: () => void;
  getSpellLimits: (characterClass: string, level: number) => { cantripsCount: number; knownSpells: number; };
  getSelectedSpellCount: (level: number) => number;
  isSpellAdded: (spellId: string) => boolean;
}

const SpellbookContext = createContext<SpellbookContextProps>({
  availableSpells: [],
  selectedSpells: [],
  addSpell: () => {},
  removeSpell: () => {},
  loadSpellsForCharacter: () => {},
  importSpells: () => {},
  saveCharacterSpells: () => {},
  getSpellLimits: () => ({ cantripsCount: 0, knownSpells: 0 }),
  getSelectedSpellCount: () => 0,
  isSpellAdded: () => false
});

export function SpellbookProvider({ children, character, onUpdate }: { 
  children: ReactNode; 
  character?: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}) {
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const { toast } = useToast();

  // Initialize selected spells from character
  useEffect(() => {
    if (character?.spells && Array.isArray(character.spells) && character.spells.length > 0) {
      // Convert each spell to appropriate type and ensure ID exists
      const convertedSpells: SpellData[] = (character.spells || []).map(spell => {
        if (typeof spell === 'string') {
          return {
            id: `spell-${String(spell).toLowerCase().replace(/\s+/g, '-')}`,
            name: String(spell),
            level: 0,
            school: 'Универсальная',
            castingTime: '1 действие',
            range: 'На себя',
            components: '',
            duration: 'Мгновенная',
            description: ''
          };
        }
        
        // Ensure SpellData has required properties
        return {
          id: spell.id || `spell-${String(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
          name: spell.name,
          level: spell.level,
          school: spell.school || 'Универсальная',
          castingTime: spell.castingTime || '1 действие',
          range: spell.range || 'На себя',
          components: spell.components || '',
          duration: spell.duration || 'Мгновенная',
          description: spell.description || '',
          prepared: spell.prepared
        };
      });
      
      setSelectedSpells(convertedSpells);
    }
  }, [character?.spells]);

  // Load all available spells
  const loadAvailableSpells = async () => {
    try {
      const spellsModule = await import('@/data/spells');
      const spells = spellsModule.getAllSpells();
      const convertedSpells = spells.map(spell => convertToSpellData(spell));
      setAvailableSpells(convertedSpells);
    } catch (error) {
      console.error('Error loading spells:', error);
    }
  };

  // Load spells for a specific class and level
  const loadSpellsForCharacter = async (characterClass: string, level: number) => {
    try {
      const spellsModule = await import('@/data/spells');
      const spells = spellsModule.getSpellsByClass(characterClass);
      const convertedSpells = spells.map(spell => convertToSpellData(spell));
      setAvailableSpells(convertedSpells);
    } catch (error) {
      console.error(`Error loading spells for ${characterClass}:`, error);
    }
  };

  // Import spells from external source
  const importSpells = (spells: CharacterSpell[]) => {
    // Convert CharacterSpell[] to SpellData[]
    const convertedSpells: SpellData[] = (spells || []).map(spell => convertToSpellData(spell));
    setSelectedSpells(convertedSpells);
  };

  // Add a spell to selected spells
  const addSpell = (spell: SpellData) => {
    if (isSpellInSelectedSpells(spell.id)) {
      toast({
        title: "Заклинание уже добавлено",
        description: `${spell.name} уже в списке`,
      });
      return;
    }
    
    setSelectedSpells(prev => [...prev, spell]);
  };

  // Remove a spell from selected spells
  const removeSpell = (spellId: string) => {
    setSelectedSpells(prev => prev.filter(spell => String(spell.id) !== String(spellId)));
  };

  // Check if a spell is already selected
  const isSpellInSelectedSpells = (spellId: string): boolean => {
    return selectedSpells.some(spell => String(spell.id) === String(spellId));
  };

  // Get spell limits based on class and level
  const getSpellLimits = (characterClass: string, level: number) => {
    // Default values
    let cantripsCount = 0;
    let knownSpells = 0;

    const classLower = characterClass.toLowerCase();
    
    // Class-specific spell counts
    switch (classLower) {
      case 'волшебник':
      case 'wizard':
        cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
        knownSpells = 6 + (level * 2); // Level 1 starts with 6, +2 per level
        break;
      case 'жрец':
      case 'cleric':
      case 'друид':
      case 'druid':
        cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
        knownSpells = 6; // Level + wisdom modifier handled elsewhere
        break;
      case 'бард':
      case 'bard':
        cantripsCount = level >= 10 ? 4 : 2;
        knownSpells = Math.max(4, level + 3); // Starts at 4, increases with level
        break;
      case 'колдун':
      case 'warlock':
        cantripsCount = level >= 10 ? 4 : 2;
        knownSpells = Math.min(15, level + 1); // Starts at 2, increases with level, max 15
        break;
      case 'чародей':
      case 'sorcerer':
        cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
        knownSpells = level + 1; // Starts at 2, increases with level
        break;
      default:
        cantripsCount = 0;
        knownSpells = 0;
    }

    return { cantripsCount, knownSpells };
  };

  // Get count of selected spells by level
  const getSelectedSpellCount = (level: number): number => {
    return selectedSpells.filter(spell => spell.level === level).length;
  };

  // Save selected spells to character
  const saveCharacterSpells = () => {
    if (!character || !onUpdate) return;
    
    // Convert SpellData[] to CharacterSpell[]
    const spells: CharacterSpell[] = selectedSpells.map(spell => ({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      prepared: spell.prepared || false
    }));
    
    onUpdate({ spells });
    
    toast({
      title: "Заклинания сохранены",
      description: `${spells.length} заклинаний сохранено для персонажа ${character.name}`,
    });
  };

  // Initial load of available spells
  useEffect(() => {
    loadAvailableSpells();
  }, []);

  return (
    <SpellbookContext.Provider value={{
      availableSpells,
      selectedSpells,
      addSpell,
      removeSpell,
      loadSpellsForCharacter,
      importSpells,
      saveCharacterSpells,
      getSpellLimits,
      getSelectedSpellCount,
      isSpellAdded: isSpellInSelectedSpells
    }}>
      {children}
    </SpellbookContext.Provider>
  );
}

// Export the hook for using the context
export const useSpellbook = () => useContext(SpellbookContext);

// Export the context for direct access
export { SpellbookContext };
