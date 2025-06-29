
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Character } from '@/types/character';
import * as characterService from '@/services/characterService';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

interface CharacterContextType {
  characters: Character[];
  loading: boolean;
  error: string | null;
  saveCharacter: (character: Character) => Character;
  deleteCharacter: (id: string) => Promise<void>;
  getUserCharacters: () => Promise<void>;
  getCharacterById: (id: string) => Promise<Character | null>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCharacter = useCallback((character: Character): Character => {
    try {
      // Добавляем userId если его нет
      if (!character.userId) {
        character.userId = getCurrentUid();
      }

      const savedCharacter = characterService.saveCharacter(character);
      
      // Обновляем локальный список
      setCharacters(prev => {
        const existing = prev.find(c => c.id === character.id);
        if (existing) {
          return prev.map(c => c.id === character.id ? character : c);
        } else {
          return [...prev, character];
        }
      });

      toast.success('Персонаж сохранен');
      return character;
    } catch (err) {
      console.error('Ошибка сохранения персонажа:', err);
      toast.error('Ошибка при сохранении персонажа');
      throw err;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await characterService.deleteCharacter(id);
      setCharacters(prev => prev.filter(c => c.id !== id));
      toast.success('Персонаж удален');
    } catch (err) {
      console.error('Ошибка удаления персонажа:', err);
      toast.error('Ошибка при удалении персонажа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const uid = getCurrentUid();
      if (uid) {
        const userCharacters = await characterService.getCharactersByUserId(uid);
        setCharacters(userCharacters);
      }
    } catch (err) {
      console.error('Ошибка загрузки персонажей:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCharacterById = useCallback(async (id: string): Promise<Character | null> => {
    try {
      return await characterService.getCharacterById(id);
    } catch (err) {
      console.error('Ошибка загрузки персонажа:', err);
      return null;
    }
  }, []);

  return (
    <CharacterContext.Provider
      value={{
        characters,
        loading,
        error,
        saveCharacter,
        deleteCharacter,
        getUserCharacters,
        getCharacterById,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
