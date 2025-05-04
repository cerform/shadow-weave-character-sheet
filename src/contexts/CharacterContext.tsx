
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CharacterSheet, SpellSlots, SorceryPoints } from '@/types/character';

// Define the Character type that aligns with CharacterSheet
export type Character = CharacterSheet;

// Define your AbilityScores type to match what's in character.d.ts
export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

interface CharacterContextType {
  character: Character | null;
  characters?: Character[];
  updateCharacter: (updates: Partial<Character>) => void;
  setCharacter: (character: Character) => void;
  getUserCharacters?: () => Character[];
  deleteCharacter?: (id: string) => Promise<boolean>;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  updateCharacter: () => {},
  setCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  // Load character from localStorage on initial render
  useEffect(() => {
    const loadCharacter = () => {
      try {
        const savedCharacter = localStorage.getItem('current-character');
        if (savedCharacter) {
          setCharacterState(JSON.parse(savedCharacter));
        }
      } catch (error) {
        console.error('Failed to load character:', error);
      }
    };

    loadCharacter();
  }, []);

  // Save character to localStorage when it changes
  useEffect(() => {
    if (character) {
      localStorage.setItem('current-character', JSON.stringify(character));
    }
  }, [character]);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacterState(prev => {
      if (!prev) return updates as Character;
      return { ...prev, ...updates };
    });
  };

  const setCharacter = (newCharacter: Character) => {
    setCharacterState(newCharacter);
  };

  // Add function to get user characters from localStorage
  const getUserCharacters = (): Character[] => {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (savedCharacters) {
        return JSON.parse(savedCharacters);
      }
      return [];
    } catch (error) {
      console.error('Failed to load characters:', error);
      return [];
    }
  };

  // Add function to delete character
  const deleteCharacter = async (id: string): Promise<boolean> => {
    try {
      const currentChars = getUserCharacters();
      const updatedChars = currentChars.filter(char => char.id !== id);
      localStorage.setItem('dnd-characters', JSON.stringify(updatedChars));
      setCharacters(updatedChars);
      return true;
    } catch (error) {
      console.error('Failed to delete character:', error);
      return false;
    }
  };

  return (
    <CharacterContext.Provider value={{ character, characters, updateCharacter, setCharacter, getUserCharacters, deleteCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
