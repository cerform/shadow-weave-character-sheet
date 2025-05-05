
import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveCharacter, getAllCharacters, deleteCharacter } from '@/services/characterService';
import { Character, CharacterSpell } from '@/types/character';

export interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  characters: Character[];
  getUserCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  characters: [],
  getUserCharacters: async () => [],
  deleteCharacter: async () => {},
  loading: false,
  error: null
});

export const CharacterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Функция для обновления частичных данных персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };
  
  // Функция для сохранения персонажа
  const saveCurrentCharacter = async () => {
    if (!character) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedCharacter = { 
        ...character, 
        updatedAt: new Date().toISOString(),
        backstory: character.backstory || ''
      };
      
      if (!updatedCharacter.createdAt) {
        updatedCharacter.createdAt = new Date().toISOString();
      }
      
      const savedChar = saveCharacter(updatedCharacter);
      if (savedChar) {
        setCharacter({...updatedCharacter, id: savedChar.id});
      }
      
      // Обновляем список персонажей
      await getUserCharacters();
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      setError('Не удалось сохранить персонажа');
    } finally {
      setLoading(false);
    }
  };
  
  // Получаем список персонажей
  const getUserCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedCharacters = getAllCharacters();
      setCharacters(fetchedCharacters);
      return fetchedCharacters;
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
      setError('Не удалось загрузить персонажей');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      deleteCharacter(id);
      setCharacters(prev => prev.filter(char => char.id !== id));
      
      // Если удаляем текущего персонажа, сбрасываем его
      if (character && character.id === id) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
      setError('Не удалось удалить персонажа');
    } finally {
      setLoading(false);
    }
  };
  
  // При инициализации получаем список персонажей
  useEffect(() => {
    const loadCharacters = async () => {
      await getUserCharacters();
    };
    loadCharacters();
  }, []);
  
  return (
    <CharacterContext.Provider 
      value={{ 
        character, 
        setCharacter,
        updateCharacter, 
        saveCurrentCharacter,
        characters,
        getUserCharacters,
        deleteCharacter: handleDeleteCharacter,
        loading,
        error
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
