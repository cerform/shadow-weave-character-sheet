
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { normalizeCharacter } from '@/utils/characterNormalizer';

export interface CharacterContextType {
  characters: Character[];
  currentCharacter: Character | null;
  setCurrentCharacter: (character: Character | null) => void;
  setCharacter: (character: Character) => void;
  createCharacter: (characterData: Partial<Character>) => Character;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
}

const CharacterContext = createContext<CharacterContextType>({
  characters: [],
  currentCharacter: null,
  setCurrentCharacter: () => {},
  setCharacter: () => {},
  createCharacter: () => createDefaultCharacter(),
  updateCharacter: () => {},
  deleteCharacter: () => {}
});

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);

  const setCharacter = (character: Character) => {
    // Проверка, существует ли персонаж уже в списке
    const existingIndex = characters.findIndex(c => c.id === character.id);
    if (existingIndex !== -1) {
      // Обновление существующего персонажа
      const updatedCharacters = [...characters];
      updatedCharacters[existingIndex] = character;
      setCharacters(updatedCharacters);
    } else {
      // Добавление нового персонажа
      setCharacters([...characters, character]);
    }
  };

  const createCharacter = (characterData: Partial<Character>): Character => {
    const newCharacter = {
      ...createDefaultCharacter(),
      ...characterData,
      id: Date.now().toString()
    };
    const normalized = normalizeCharacter(newCharacter);
    setCharacters([...characters, normalized]);
    return normalized;
  };

  const updateCharacter = (character: Character) => {
    setCharacters(characters.map(c => c.id === character.id ? character : c));
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (currentCharacter?.id === id) {
      setCurrentCharacter(null);
    }
  };

  return (
    <CharacterContext.Provider 
      value={{ 
        characters, 
        currentCharacter, 
        setCurrentCharacter, 
        setCharacter, 
        createCharacter,
        updateCharacter, 
        deleteCharacter 
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
