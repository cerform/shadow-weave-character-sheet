
import React, { createContext, useContext, useState } from 'react';
import { Character } from '@/types/character';

interface CharacterContextType {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
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
  resetCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(defaultCharacter);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  const resetCharacter = () => {
    setCharacter(defaultCharacter);
  };

  return (
    <CharacterContext.Provider value={{ character, updateCharacter, resetCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
