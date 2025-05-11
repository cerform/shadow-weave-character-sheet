
import { useState } from 'react';
import { Character } from '@/types/character';
import { useCharacterCreation } from './useCharacterCreation';

/**
 * Хук для работы с персонажем в компонентах, которые требуют Character вместо Partial<Character>
 */
export const useCharacter = (initialCharacter?: Partial<Character>) => {
  const { convertToCharacter } = useCharacterCreation();
  const [character, setCharacter] = useState<Character>(
    convertToCharacter(initialCharacter || {})
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
