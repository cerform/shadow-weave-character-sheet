
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

  const saveCurrentCharacter = useCallback(async () => {
    if (!character) {
      toast.error('Нет персонажа для сохранения');
      return;
    }
    
    try {
      setLoading(true);
      saveCharacter(character);
      toast.success('Текущий персонаж сохранен');
    } catch (err) {
      console.error('Ошибка сохранения текущего персонажа:', err);
      toast.error('Ошибка при сохранении персонажа');
    } finally {
      setLoading(false);
    }
  }, [character, saveCharacter]);

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

  const refreshCharacters = useCallback(async () => {
    await getUserCharacters();
  }, [getUserCharacters]);

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
        saveCurrentCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
