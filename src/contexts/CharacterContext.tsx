
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character } from '@/types/character';

interface CharacterContextType {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
  // Add the missing methods
  saveCurrentCharacter: () => void;
  setCharacter: (character: Character) => void;
  characters: Character[];
  loading: boolean;
  error: string | null;
  getUserCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => void;
  createCharacter: (character: Character) => void;
}

const defaultCharacter: Character = {
  id: '',
  name: '',
  race: '',
  class: '',
  level: 1,
  background: '',
  alignment: '',
  experience: 0,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  hp: 0,
  maxHp: 0,
  temporaryHp: 0,
  hitDice: { total: 0, used: 0, type: 'd8' },
  proficiencyBonus: 2,
  proficiencies: [],
  skills: {},
  savingThrows: {},
  armorClass: 10,
  initiative: 0,
  speed: 30,
  equipment: [],
  features: [],
  description: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  backstory: '',
  spells: [],
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10, 
    wisdom: 10,
    charisma: 10
  }
};

const CharacterContext = createContext<CharacterContextType>({
  character: defaultCharacter,
  updateCharacter: () => {},
  resetCharacter: () => {},
  saveCurrentCharacter: () => {},
  setCharacter: () => {},
  characters: [],
  loading: false,
  error: null,
  getUserCharacters: async () => [],
  deleteCharacter: () => {},
  createCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character>(defaultCharacter);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Попытка загрузить персонажа при первой загрузке
  useEffect(() => {
    try {
      const savedCharacter = localStorage.getItem('dnd-character');
      if (savedCharacter) {
        setCharacterState(JSON.parse(savedCharacter));
      }
    } catch (error) {
      console.error('Failed to load character:', error);
    }
  }, []);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacterState(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('dnd-character', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save character:', error);
      }
      return updated;
    });
  };

  const resetCharacter = () => {
    setCharacterState(defaultCharacter);
    try {
      localStorage.removeItem('dnd-character');
    } catch (error) {
      console.error('Failed to remove character from storage:', error);
    }
  };

  const saveCurrentCharacter = () => {
    // Save character to localStorage or other storage
    try {
      localStorage.setItem('dnd-character', JSON.stringify(character));
      console.log('Character saved successfully');
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const setCharacter = (newCharacter: Character) => {
    setCharacterState(newCharacter);
    try {
      localStorage.setItem('dnd-character', JSON.stringify(newCharacter));
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const getUserCharacters = async (): Promise<Character[]> => {
    setLoading(true);
    setError(null);
    try {
      // Имитация загрузки персонажей
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Пытаемся получить сохраненных персонажей
      const savedCharactersJSON = localStorage.getItem('dnd-characters');
      let savedCharacters: Character[] = [];
      
      if (savedCharactersJSON) {
        savedCharacters = JSON.parse(savedCharactersJSON);
      }
      
      setCharacters(savedCharacters);
      return savedCharacters;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить персонажей';
      setError(errorMessage);
      console.error('Error loading characters:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prevCharacters => {
      const filteredCharacters = prevCharacters.filter(char => char.id !== id);
      try {
        localStorage.setItem('dnd-characters', JSON.stringify(filteredCharacters));
      } catch (error) {
        console.error('Failed to save characters after deletion:', error);
      }
      return filteredCharacters;
    });
  };

  const createCharacter = (newCharacter: Character) => {
    setCharacters(prevCharacters => {
      const updatedCharacters = [...prevCharacters, newCharacter];
      try {
        localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
      } catch (error) {
        console.error('Failed to save characters after creation:', error);
      }
      return updatedCharacters;
    });
  };

  return (
    <CharacterContext.Provider value={{ 
      character, 
      updateCharacter, 
      resetCharacter,
      saveCurrentCharacter,
      setCharacter,
      characters,
      loading,
      error,
      getUserCharacters,
      deleteCharacter,
      createCharacter
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
