import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { Character } from '@/types/character';
import { useCharacterState } from '@/hooks/useCharacterState';
import { useCharacterOperations } from '@/hooks/useCharacterOperations';
import { subscribeToCharacters } from '@/services/characterService';
import { auth } from '@/lib/firebase';

interface CharacterContextType {
  characters: Character[];
  character: Character | null;
  loading: boolean;
  error: string | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCharacter: (character: Character) => Promise<Character>;
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
    console.error('useCharacter: CharacterContext is undefined! Make sure CharacterProvider is wrapping the component');
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useCharacterState();
  const operations = useCharacterOperations();

  // 🔥 Только Firebase: без localStorage fallback
  useEffect(() => {
    if (!auth.currentUser) return;

    console.log('CharacterContext: Инициализация реалтайм подписки');

    let isSubscribed = true;

    const unsubscribe = subscribeToCharacters((characters) => {
      if (isSubscribed) {
        console.log('CharacterContext: Получены персонажи через подписку:', characters.length);
        state.setCharacters(characters);
      }
    });

    return () => {
      isSubscribed = false;
      console.log('CharacterContext: Очистка реалтайм подписки');
      unsubscribe?.();
    };
  }, [auth.currentUser]);

  const saveCharacter = useCallback(async (character: Character): Promise<Character> => {
    try {
      state.setLoading(true);
      state.clearError();

      const savedCharacter = await operations.saveCharacter(character);
      state.addCharacter(savedCharacter);

      if (state.character?.id === savedCharacter.id) {
        state.setCharacter(savedCharacter);
      }

      return savedCharacter;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  }, [state, operations]);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      state.setLoading(true);
      state.clearError();
      await operations.deleteCharacter(id);
      state.removeCharacter(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления персонажа';
      state.setError(errorMessage);
      throw err;
    } finally {
      state.setLoading(false);
    }
  }, [state, operations]);

  const getUserCharacters = useCallback(async () => {
    try {
      state.setLoading(true);
      state.clearError();
      const userCharacters = await operations.getUserCharacters();
      state.setCharacters(userCharacters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки персонажей';
      state.setError(errorMessage);
      state.setCharacters([]);
    } finally {
      state.setLoading(false);
    }
  }, [state, operations]);

  const getCharacterById = useCallback(async (id: string): Promise<Character | null> => {
    try {
      state.setLoading(true);
      state.clearError();
      const foundCharacter = await operations.getCharacterById(id);
      if (foundCharacter) {
        state.setCharacter(foundCharacter);
        return foundCharacter;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки персонажа';
      state.setError(errorMessage);
      throw err;
    } finally {
      state.setLoading(false);
    }
  }, [state, operations]);

  const refreshCharacters = useCallback(async () => {
    await getUserCharacters();
  }, [getUserCharacters]);

  const saveCurrentCharacter = useCallback(async () => {
    if (!state.character) {
      throw new Error('Нет текущего персонажа для сохранения');
    }

    try {
      state.setLoading(true);
      await operations.saveCurrentCharacter(state.character);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения персонажа';
      state.setError(errorMessage);
      throw err;
    } finally {
      state.setLoading(false);
    }
  }, [state, operations]);

  return (
    <CharacterContext.Provider
      value={{
        characters: state.characters,
        character: state.character,
        loading: state.loading,
        error: state.error,
        setCharacter: state.setCharacter,
        updateCharacter: state.updateCharacter,
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
