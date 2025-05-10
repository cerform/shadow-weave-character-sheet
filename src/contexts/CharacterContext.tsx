
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types/character';
import { getCurrentUid } from "@/utils/authHelpers";
import { saveCharacterToFirestore } from "@/services/characterService";

// Create the context
interface CharacterContextProps {
  character: Character | null;
  updateCharacter: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
  initializeNewCharacter: (characterData?: Partial<Character>) => void;
  setCharacter: (character: Character) => void;  // Added missing method
  saveCurrentCharacter: () => Promise<void>;     // Added missing method
  characters?: Character[];                      // Added for compatibility
  loading?: boolean;                             // Added for compatibility
  error?: Error | null;                          // Added for compatibility
  getUserCharacters?: () => Promise<void>;       // Added for compatibility
}

const defaultContext: CharacterContextProps = {
  character: null,
  updateCharacter: () => {},
  resetCharacter: () => {},
  initializeNewCharacter: () => {},
  setCharacter: () => {},             // Added missing method
  saveCurrentCharacter: async () => {} // Added missing method
};

const CharacterContext = createContext<CharacterContextProps>(defaultContext);

// Create a provider component
interface CharacterProviderProps {
  children: React.ReactNode;
}

// Default character state creator
const createDefaultCharacter = (): Character => {
  const defaultCharacter: Character = {
    id: uuidv4(),
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: 'Нейтральный',
    level: 1,
    xp: 0,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    skills: {},
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    tempHp: 0,
    ac: 10,
    armorClass: 10,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    spellcasting: {
      ability: 'intelligence',
      dc: 10,
      attack: 0,
      preparedSpellsLimit: 0, // Added this property
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0,
    },
    proficiencies: {
      languages: ['Common'],
      tools: [],
      weapons: [],
      armor: [],
      skills: [],  // Added skills array for compatibility
    },
    features: [],
    notes: '',
    savingThrowProficiencies: [], // Added for compatibility
    skillProficiencies: [],       // Added for compatibility 
    expertise: [],                // Added for compatibility
    skillBonuses: {},             // Added for compatibility
  };

  return defaultCharacter;
};

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  // State for the current character
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Load character from localStorage or initialize new character
  useEffect(() => {
    const storedCharacter = localStorage.getItem('current-character');
    if (storedCharacter) {
      try {
        setCharacter(JSON.parse(storedCharacter));
      } catch (error) {
        console.error('Failed to parse stored character:', error);
        setCharacter(createDefaultCharacter());
      }
    } else {
      setCharacter(createDefaultCharacter());
    }
  }, []);

  // Save character to localStorage whenever it changes
  useEffect(() => {
    if (character) {
      localStorage.setItem('current-character', JSON.stringify(character));
    }
  }, [character]);

  // Function to update the character
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(current => {
      if (!current) return null;
      return { ...current, ...updates };
    });
  };

  // Function to reset the character to defaults
  const resetCharacter = () => {
    setCharacter(createDefaultCharacter());
  };

  // Function to initialize a new character
  const initializeNewCharacter = (characterData: Partial<Character> = {}) => {
    const newCharacter = {
      ...createDefaultCharacter(),
      ...characterData,
      id: uuidv4(), // Always generate a new ID
    };
    setCharacter(newCharacter);
  };

  // Function to save current character to Firestore
  const saveCurrentCharacter = async () => {
    if (!character) return;
    
    try {
      const userId = getCurrentUid();
      if (!userId) throw new Error("User not authenticated");
      
      const characterToSave = {
        ...character,
        userId,
        updatedAt: new Date().toISOString()
      };
      
      await saveCharacterToFirestore(characterToSave);
      console.log("Character saved to Firestore successfully");
    } catch (err) {
      console.error("Error saving character to Firestore:", err);
      throw err;
    }
  };

  // Function to get user characters from Firestore (placeholder)
  const getUserCharacters = async () => {
    setLoading(true);
    try {
      // This would actually fetch from Firestore in a real implementation
      setCharacters([]);
      setError(null);
    } catch (err) {
      console.error("Error fetching characters:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        updateCharacter,
        resetCharacter,
        initializeNewCharacter,
        setCharacter,             // Added missing method
        saveCurrentCharacter,     // Added missing method
        characters,               // Added for compatibility
        loading,                  // Added for compatibility
        error,                    // Added for compatibility
        getUserCharacters         // Added for compatibility
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

// Create a hook to use the character context
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

// Export the context and provider
export default CharacterContext;
