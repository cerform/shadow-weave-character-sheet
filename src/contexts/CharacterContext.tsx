
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Character } from '@/types/character';

// Контекст для работы с персонажем
interface CharacterContextType {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  updateCharacter: (updates: Partial<Character>) => void;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
});

// Hook для использования контекста персонажа
export const useCharacter = () => useContext(CharacterContext);

// Provider для контекста персонажа
interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter, updateCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterContext;
