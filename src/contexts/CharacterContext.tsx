
import React, { createContext, useState, ReactNode, useContext } from 'react';
import type { Character, CharacterSheet } from '@/types/character';

// Контекст для работы с персонажем
export interface CharacterContextType {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  updateCharacter: (updates: Partial<Character>) => void;
  characters?: Character[];
  getUserCharacters?: () => Promise<Character[]>;
  deleteCharacter?: (id: string) => Promise<void>;
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
  // Для совместимости добавляем пустой массив characters
  const [characters, setCharacters] = useState<Character[]>([]);

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  // Заглушки для функций, которые используются в Home.tsx и Index.tsx
  const getUserCharacters = async () => {
    return characters;
  };

  const deleteCharacter = async (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  return (
    <CharacterContext.Provider 
      value={{ 
        character, 
        setCharacter, 
        updateCharacter,
        characters,
        getUserCharacters,
        deleteCharacter 
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterContext;
