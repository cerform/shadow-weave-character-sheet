
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Character } from '@/types/character';
import { generateRandomId } from '@/utils/idGenerator';
import { createDefaultCharacter } from '@/utils/characterUtils';

// Тип для контекста персонажа
interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  selectedCharacterId: string | null;
  setSelectedCharacterId: (id: string | null) => void;
  saveCharacter: (character: Character) => Character | null;
  loadCharacter: (id: string) => Character | null;
  getCharacterById: (id: string) => Promise<Character | null>; // Добавляем этот метод
  deleteCharacter: (id: string) => void;
  characters: Character[];
  updateCharacter: (updates: Partial<Character>) => void;
  loading: boolean; // Добавляем состояние загрузки
  error: Error | string | null; // Добавляем состояние ошибки
  getUserCharacters: () => Promise<Character[]>; // Добавляем метод для получения персонажей пользователя
  refreshCharacters: () => Promise<void>; // Добавляем метод обновления списка персонажей
  saveCurrentCharacter: () => Promise<string | null>; // Добавляем метод сохранения текущего персонажа
}

// Создаем контекст с дефолтным значением
const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  selectedCharacterId: null,
  setSelectedCharacterId: () => {},
  saveCharacter: () => null,
  loadCharacter: () => null,
  getCharacterById: () => Promise.resolve(null),
  deleteCharacter: () => {},
  characters: [],
  updateCharacter: () => {},
  loading: false,
  error: null,
  getUserCharacters: () => Promise.resolve([]),
  refreshCharacters: () => Promise.resolve(),
  saveCurrentCharacter: () => Promise.resolve(null),
});

// Хук для использования контекста персонажа
export const useCharacter = () => useContext(CharacterContext);

// Провайдер контекста персонажа
interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);

  // Загрузка списка персонажей из localStorage при монтировании
  useEffect(() => {
    refreshCharacters();
  }, []);

  // Метод для обновления списка персонажей
  const refreshCharacters = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем все ключи из localStorage
      const keys = Object.keys(localStorage);
      
      // Фильтруем только те, которые начинаются с 'character_'
      const characterKeys = keys.filter(key => key.startsWith('character_'));
      
      // Загружаем всех персонажей
      const loadedCharacters: Character[] = [];
      
      for (const key of characterKeys) {
        const savedCharacter = localStorage.getItem(key);
        if (savedCharacter) {
          try {
            loadedCharacters.push(JSON.parse(savedCharacter) as Character);
          } catch (e) {
            console.error(`Ошибка при обработке персонажа из ${key}:`, e);
          }
        }
      }
      
      setCharacters(loadedCharacters);
      
      // Загружаем последнего активного персонажа
      const lastSelectedId = localStorage.getItem('last-selected-character');
      if (lastSelectedId) {
        setSelectedCharacterId(lastSelectedId);
        const lastCharacter = loadedCharacters.find(c => c.id === lastSelectedId);
        if (lastCharacter) {
          setCharacter(lastCharacter);
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке персонажей:", error);
      setError(error instanceof Error ? error : String(error));
    } finally {
      setLoading(false);
    }
  };

  // Метод для получения персонажей пользователя
  const getUserCharacters = async (): Promise<Character[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // В локальной версии просто возвращаем все персонажи
      await refreshCharacters();
      return characters;
    } catch (error) {
      console.error("Ошибка при загрузке персонажей пользователя:", error);
      setError(error instanceof Error ? error : String(error));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Метод для получения персонажа по ID
  const getCharacterById = async (id: string): Promise<Character | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const savedCharacter = localStorage.getItem(`character_${id}`);
      if (savedCharacter) {
        return JSON.parse(savedCharacter) as Character;
      }
      return null;
    } catch (error) {
      console.error(`Ошибка при загрузке персонажа с ID ${id}:`, error);
      setError(error instanceof Error ? error : String(error));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Сохранение персонажа в localStorage
  const saveCharacter = (characterToSave: Character): Character | null => {
    try {
      // Если у персонажа нет ID, создаем его
      if (!characterToSave.id) {
        characterToSave.id = generateRandomId();
      }
      
      // Сохраняем персонажа в localStorage
      localStorage.setItem(`character_${characterToSave.id}`, JSON.stringify(characterToSave));
      
      // Обновляем список персонажей
      setCharacters(prev => {
        const existingIndex = prev.findIndex(c => c.id === characterToSave.id);
        if (existingIndex >= 0) {
          return prev.map(c => c.id === characterToSave.id ? characterToSave : c);
        } else {
          return [...prev, characterToSave];
        }
      });
      
      // Если это активный персонаж, обновляем его
      if (character && character.id === characterToSave.id) {
        setCharacter(characterToSave);
      }
      
      // Запоминаем ID последнего активного персонажа
      localStorage.setItem('last-selected-character', characterToSave.id);
      setSelectedCharacterId(characterToSave.id);
      
      return characterToSave;
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      setError(error instanceof Error ? error : String(error));
      return null;
    }
  };

  // Метод для сохранения текущего персонажа
  const saveCurrentCharacter = async (): Promise<string | null> => {
    if (!character) return null;
    
    try {
      const savedCharacter = saveCharacter(character);
      return savedCharacter?.id || null;
    } catch (error) {
      console.error("Ошибка при сохранении текущего персонажа:", error);
      setError(error instanceof Error ? error : String(error));
      return null;
    }
  };

  // Загрузка персонажа из localStorage
  const loadCharacter = (id: string): Character | null => {
    try {
      const savedCharacter = localStorage.getItem(`character_${id}`);
      if (savedCharacter) {
        const parsedCharacter = JSON.parse(savedCharacter) as Character;
        setCharacter(parsedCharacter);
        setSelectedCharacterId(id);
        localStorage.setItem('last-selected-character', id);
        return parsedCharacter;
      }
      return null;
    } catch (error) {
      console.error(`Ошибка при загрузке персонажа с ID ${id}:`, error);
      setError(error instanceof Error ? error : String(error));
      return null;
    }
  };

  // Удаление персонажа из localStorage
  const deleteCharacter = (id: string): void => {
    try {
      localStorage.removeItem(`character_${id}`);
      
      // Обновляем список персонажей
      setCharacters(prev => prev.filter(c => c.id !== id));
      
      // Если удаляемый персонаж активен, сбрасываем активного персонажа
      if (selectedCharacterId === id) {
        setSelectedCharacterId(null);
        setCharacter(null);
        localStorage.removeItem('last-selected-character');
      }
    } catch (error) {
      console.error(`Ошибка при удалении персонажа с ID ${id}:`, error);
      setError(error instanceof Error ? error : String(error));
    }
  };

  // Обновление персонажа
  const updateCharacter = (updates: Partial<Character>): void => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    setCharacter(updatedCharacter);
    saveCharacter(updatedCharacter);
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        setCharacter,
        selectedCharacterId,
        setSelectedCharacterId,
        saveCharacter,
        loadCharacter,
        getCharacterById,
        deleteCharacter,
        characters,
        updateCharacter,
        loading,
        error,
        getUserCharacters,
        refreshCharacters,
        saveCurrentCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
