
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character } from '@/types/character';

interface CharacterContextProps {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  isLoading: boolean;
  error: Error | null;
  characters?: Character[]; // Added for Index.tsx
  getUserCharacters?: () => Promise<Character[]>; // Added for Index.tsx
  deleteCharacter?: (characterId: string) => Promise<boolean>; // Added for Index.tsx
}

export const CharacterContext = createContext<CharacterContextProps>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  isLoading: false,
  error: null,
  characters: [],
  getUserCharacters: async () => [],
  deleteCharacter: async () => false
});

export const useCharacter = () => useContext(CharacterContext);

export type { Character };

interface CharacterProviderProps {
  characterId?: string;
  initialCharacter?: Character | null;
  children: React.ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ 
  characterId, 
  initialCharacter = null, 
  children 
}) => {
  const [character, setCharacter] = useState<Character | null>(initialCharacter);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!characterId && initialCharacter) {
      setCharacter(initialCharacter);
      return;
    }
    
    if (characterId) {
      setIsLoading(true);
      
      // Здесь должна быть логика загрузки персонажа по ID
      // Для заглушки просто установим начальное значение
      
      setCharacter(initialCharacter);
      setIsLoading(false);
    }
  }, [characterId, initialCharacter]);
  
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter((prevCharacter) => {
      if (!prevCharacter) return null;
      
      const updatedCharacter = { ...prevCharacter, ...updates };
      
      // Здесь должна быть логика сохранения персонажа в базу данных
      // Для заглушки просто обновляем локальное состояние
      
      return updatedCharacter;
    });
  };
  
  const value = {
    character,
    setCharacter,
    updateCharacter,
    isLoading,
    error
  };
  
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterProvider;
