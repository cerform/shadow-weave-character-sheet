
import React, { createContext, useContext, useState } from 'react';
import { Character } from '@/types/character';

interface CharacterContextType {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
  // Add the missing methods
  saveCurrentCharacter: () => void;
  setCharacter: (character: Character) => void;
}

const defaultCharacter: Character = {
  id: '',
  name: '',
  race: '',
  class: '',
  level: 1,
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10, 
    wisdom: 10,
    charisma: 10
  },
  spells: []
};

const CharacterContext = createContext<CharacterContextType>({
  character: defaultCharacter,
  updateCharacter: () => {},
  resetCharacter: () => {},
  saveCurrentCharacter: () => {},
  setCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character>(defaultCharacter);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacterState(prev => ({ ...prev, ...updates }));
  };

  const resetCharacter = () => {
    setCharacterState(defaultCharacter);
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
  };

  return (
    <CharacterContext.Provider value={{ 
      character, 
      updateCharacter, 
      resetCharacter,
      saveCurrentCharacter,
      setCharacter
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
