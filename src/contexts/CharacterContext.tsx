
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Character, CharacterSheet } from '@/types/character';
import { extractSpellNames } from '@/utils/spellUtils';

interface CharacterContextProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  saveCharacter: () => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => void;
  isLoading: boolean;
}

const CharacterContext = createContext<CharacterContextProps>({
  character: null,
  setCharacter: () => {},
  saveCharacter: async () => {},
  updateCharacter: () => {},
  isLoading: true
});

interface CharacterProviderProps {
  children: ReactNode;
  initialCharacter?: Character | null;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children, initialCharacter = null }) => {
  const [character, setCharacter] = useState<Character | null>(initialCharacter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // При монтировании компонента загружаем персонажа из localStorage
    const loadCharacter = () => {
      try {
        const savedCharacter = localStorage.getItem('character');
        if (savedCharacter) {
          const parsedCharacter = JSON.parse(savedCharacter) as CharacterSheet;
          // Убедимся, что у нас есть все необходимые свойства для типа Character
          setCharacter({
            ...parsedCharacter,
            features: parsedCharacter.features || []
          } as Character);
        }
      } catch (error) {
        console.error('Ошибка загрузки персонажа из localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, []);

  const saveCharacter = async (): Promise<void> => {
    try {
      if (character) {
        // Сохраняем персонажа в localStorage
        localStorage.setItem('character', JSON.stringify(character));
      }
    } catch (error) {
      console.error('Ошибка сохранения персонажа:', error);
      throw new Error('Не удалось сохранить персонажа');
    }
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prevCharacter => {
      if (!prevCharacter) return null;
      
      // Обрабатываем специальный случай со списком заклинаний
      if (updates.spells) {
        // Если spells содержит объекты заклинаний, извлекаем только их имена
        if (updates.spells.length > 0 && typeof updates.spells[0] !== 'string') {
          updates = {
            ...updates,
            spells: extractSpellNames(updates.spells)
          };
        }
      }
      
      const updated = {
        ...prevCharacter,
        ...updates
      };
      
      // Автоматически сохраняем при обновлении
      localStorage.setItem('character', JSON.stringify(updated));
      
      return updated;
    });
  };

  return (
    <CharacterContext.Provider value={{ 
      character, 
      setCharacter, 
      saveCharacter, 
      updateCharacter,
      isLoading
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);

export default CharacterContext;
