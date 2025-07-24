
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

  // 🔥 Инициализируем реалтайм подписку при монтировании с fallback
  useEffect(() => {
    if (!auth.currentUser) return;
    
    console.log('CharacterContext: Инициализация реалтайм подписки');
    
    let isSubscribed = true;
    
    const initializeSubscription = async () => {
      try {
        const unsubscribe = subscribeToCharacters((characters) => {
          if (isSubscribed) {
            console.log('CharacterContext: Получены персонажи через подписку:', characters.length);
            state.setCharacters(characters);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('CharacterContext: Ошибка подписки, используем fallback:', error);
        // Fallback: загружаем из localStorage
        const localCharacters = JSON.parse(localStorage.getItem('characters') || '[]')
          .filter((char: any) => char.userId === auth.currentUser?.uid);
        if (isSubscribed) {
          state.setCharacters(localCharacters);
        }
      }
    };

    let unsubscribePromise = initializeSubscription();

    return () => {
      isSubscribed = false;
      console.log('CharacterContext: Очистка реалтайм подписки');
      unsubscribePromise?.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
      // Глобальная отмена подписок не требуется в данной реализации
    };
  }, [auth.currentUser]); // Убираем state из зависимостей

  // Обертки для интеграции с операциями
  const saveCharacter = useCallback(async (character: Character): Promise<Character> => {
    try {
      state.setLoading(true);
      state.clearError();
      
      const savedCharacter = await operations.saveCharacter(character);
      
      // Обновляем локальный список
      state.addCharacter(savedCharacter);
      
      // Обновляем текущего персонажа если это он
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
      
      // Обновляем локальный список
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
      console.log('CharacterContext: Начинаем загрузку персонажей. Устанавливаем loading = true');
      state.setLoading(true);
      state.clearError();
      
      const userCharacters = await operations.getUserCharacters();
      console.log('CharacterContext: Получены персонажи:', userCharacters.length);
      state.setCharacters(userCharacters);
      console.log('CharacterContext: Персонажи установлены в состояние');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки персонажей';
      console.error('CharacterContext: Ошибка загрузки персонажей:', err);
      state.setError(errorMessage);
      state.setCharacters([]); // Устанавливаем пустой массив при ошибке
    } finally {
      console.log('CharacterContext: Завершаем загрузку. Устанавливаем loading = false');
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
    console.log('CharacterContext: Принудительное обновление списка персонажей');
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
        saveCurrentCharacter
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
