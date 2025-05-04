
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CharacterSheet } from '@/types/character';

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
  updateCharacter: (updates: Partial<Character>) => void;
  setCharacter: (character: Character) => void;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  updateCharacter: () => {},
  setCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character | null>(null);

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

  return (
    <CharacterContext.Provider value={{ character, updateCharacter, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
