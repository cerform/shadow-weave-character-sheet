
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { normalizeCharacter } from '@/utils/characterNormalizer';

export interface CharacterContextType {
  characters: Character[];
  currentCharacter: Character | null;
  loading: boolean;
  error: string | null;
  setCurrentCharacter: (character: Character | null) => void;
  setCharacter: (character: Character) => void;
  createCharacter: (characterData: Partial<Character>) => Character;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  saveCurrentCharacter: () => Promise<Character | null>;
  getUserCharacters: (userId: string) => Promise<Character[]>;
  refreshCharacters: () => Promise<void>;
  character?: Character; // Для обратной совместимости
}

const CharacterContext = createContext<CharacterContextType>({
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,
  setCurrentCharacter: () => {},
  setCharacter: () => {},
  createCharacter: () => createDefaultCharacter(),
  updateCharacter: () => {},
  deleteCharacter: () => {},
  saveCurrentCharacter: async () => null,
  getUserCharacters: async () => [],
  refreshCharacters: async () => {}
});

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    if (currentCharacter?.id === character.id) {
      setCurrentCharacter(character);
    }
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (currentCharacter?.id === id) {
      setCurrentCharacter(null);
    }
  };

  // Добавляем недостающие методы
  const saveCurrentCharacter = async (): Promise<Character | null> => {
    if (!currentCharacter) return null;
    
    // Здесь может быть логика сохранения в БД
    console.log('Сохранение персонажа:', currentCharacter.name);
    
    return currentCharacter;
  };
  
  const getUserCharacters = async (userId: string): Promise<Character[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Имитация запроса к БД
      console.log('Загрузка персонажей для пользователя:', userId);
      
      // В реальной ситуации здесь должен быть запрос к БД
      // Сейчас просто возвращаем локальный кэш
      const userChars = characters.filter(c => c.userId === userId);
      return userChars;
    } catch (err) {
      setError('Ошибка загрузки персонажей');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const refreshCharacters = async (): Promise<void> => {
    // Логика обновления списка персонажей из БД
    console.log('Обновление списка персонажей');
  };

  return (
    <CharacterContext.Provider 
      value={{ 
        characters, 
        currentCharacter, 
        loading,
        error,
        setCurrentCharacter, 
        setCharacter, 
        createCharacter,
        updateCharacter, 
        deleteCharacter,
        saveCurrentCharacter,
        getUserCharacters,
        refreshCharacters,
        character: currentCharacter // Для обратной совместимости
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
