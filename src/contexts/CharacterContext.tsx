
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Character } from '@/types/character';
import * as characterService from '@/services/characterService';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

interface CharacterContextType {
  characters: Character[];
  character: Character | null;
  loading: boolean;
  error: string | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCharacter: (character: Character) => Character;
  deleteCharacter: (id: string) => Promise<void>;
  getUserCharacters: () => Promise<void>;
  getCharacterById: (id: string) => Promise<Character | null>;
  refreshCharacters: () => Promise<void>;
  saveCurrentCharacter: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [character, setCharacterState] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCharacter = useCallback((character: Character | null) => {
    setCharacterState(character);
  }, []);

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacterState(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const saveCharacter = useCallback((character: Character): Character => {
    try {
      // Добавляем userId если его нет
      if (!character.userId) {
        character.userId = getCurrentUid();
      }

      const savedCharacter = characterService.saveCharacter(character);
      
      // Обновляем локальный список
      setCharacters(prev => {
        const existingIndex = prev.findIndex(c => c.id === savedCharacter.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedCharacter;
          return updated;
        } else {
          return [...prev, savedCharacter];
        }
      });

      // Обновляем текущего персонажа если это он
      if (character.id === savedCharacter.id) {
        setCharacterState(savedCharacter);
      }

      return savedCharacter;
    } catch (error) {
      console.error('Ошибка сохранения персонажа:', error);
      throw error;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await characterService.deleteCharacter(id);
      
      // Обновляем локальный список
      setCharacters(prev => prev.filter(c => c.id !== id));
      
      // Если удаляемый персонаж текущий, очищаем его
      if (character?.id === id) {
        setCharacterState(null);
      }
      
      toast.success('Персонаж удален');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления персонажа';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [character]);

  const getUserCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getCurrentUid();
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      console.log('CharacterContext: Загрузка персонажей для пользователя:', userId);
      const userCharacters = await characterService.getUserCharacters(userId);
      console.log('CharacterContext: Получено персонажей:', userCharacters.length);
      
      setCharacters(userCharacters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки персонажей';
      console.error('CharacterContext: Ошибка загрузки персонажей:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCharacterById = useCallback(async (id: string): Promise<Character | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const foundCharacter = await characterService.getCharacterById(id);
      
      if (foundCharacter) {
        setCharacterState(foundCharacter);
        return foundCharacter;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки персонажа';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCharacters = useCallback(async () => {
    console.log('CharacterContext: Принудительное обновление списка персонажей');
    await getUserCharacters();
  }, [getUserCharacters]);

  const saveCurrentCharacter = useCallback(async () => {
    if (!character) {
      throw new Error('Нет текущего персонажа для сохранения');
    }
    
    try {
      setLoading(true);
      await characterService.saveCharacterToFirestore(character);
      toast.success('Персонаж сохранен');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения персонажа';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [character]);

  return (
    <CharacterContext.Provider
      value={{
        characters,
        character,
        loading,
        error,
        setCharacter,
        updateCharacter,
        saveCharacter,
        deleteCharacter,
        getUserCharacters,
        getCharacterById,
        refreshCharacters,
        saveCurrentCharacter
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
