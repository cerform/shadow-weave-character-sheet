// Состояние для персонажей
import { useState, useCallback } from 'react';
import { Character } from '@/types/character';

export const useCharacterState = () => {
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

  const addCharacter = useCallback((newCharacter: Character) => {
    setCharacters(prev => {
      const existingIndex = prev.findIndex(c => c.id === newCharacter.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newCharacter;
        return updated;
      } else {
        return [...prev, newCharacter];
      }
    });
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    
    // Если удаляемый персонаж текущий, очищаем его
    if (character?.id === id) {
      setCharacterState(null);
    }
  }, [character]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    characters,
    setCharacters,
    character,
    setCharacter,
    updateCharacter,
    addCharacter,
    removeCharacter,
    loading,
    setLoading,
    error,
    setError,
    clearError
  };
};