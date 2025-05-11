
import { useState } from 'react';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';

/**
 * Хук для работы с персонажем в компонентах, которые требуют Character вместо Partial<Character>
 */
export const useCharacter = (initialCharacter?: Partial<Character>) => {
  const [character, setCharacter] = useState<Character>(
    initialCharacter ? { ...createDefaultCharacter(), ...initialCharacter } : createDefaultCharacter()
  );

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    character,
    updateCharacter
  };
};

export default useCharacter;

