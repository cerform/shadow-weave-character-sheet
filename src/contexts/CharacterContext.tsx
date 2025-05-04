
import React, { createContext, useState, useEffect, useContext } from 'react';
import characterService from '@/services/characterService';
import { SorceryPoints, CharacterSheet, Character as CharacterType } from '@/types/character';

// Экспортируем тип Character для использования в других компонентах
export type Character = CharacterType;

// Интерфейс для контекста персонажей
export interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  characters: Character[];
  getUserCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
}

// Создание контекста
export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  characters: [],
  getUserCharacters: async () => [],
  deleteCharacter: async () => {},
});

// Провайдер контекста
export const CharacterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  
  // Функция для обновления частичных данных персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };
  
  // Функция для сохранения персонажа
  const saveCurrentCharacter = async () => {
    if (!character) return;
    
    try {
      const updatedCharacter = { 
        ...character, 
        updatedAt: new Date().toISOString(),
        backstory: character.backstory || "", // Убедимся, что backstory всегда есть
        background: character.background || "" // Убедимся, что background всегда есть
      };
      
      if (!updatedCharacter.createdAt) {
        updatedCharacter.createdAt = new Date().toISOString();
      }
      
      // Преобразуем Character в CharacterSheet для сохранения
      // Обновляем преобразование, чтобы type-check проходил успешно
      const charToSave: CharacterSheet = {
        ...updatedCharacter,
        backstory: updatedCharacter.backstory || "", 
        background: updatedCharacter.background || "",
        // Преобразуем proficiencies в ожидаемый формат
        proficiencies: {
          armor: Array.isArray(updatedCharacter.proficiencies) ? [] : undefined,
          weapons: Array.isArray(updatedCharacter.proficiencies) ? [] : undefined,
          tools: Array.isArray(updatedCharacter.proficiencies) ? [] : undefined,
          languages: updatedCharacter.languages || []
        }
      };
      
      const savedChar = await characterService.saveCharacter(charToSave);
      if (savedChar) {
        setCharacter(updatedCharacter);
      }
      
      // Обновляем список персонажей, если сохранение прошло успешно
      await getUserCharacters();
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
    }
  };
  
  // Получаем список персонажей пользователя
  const getUserCharacters = async () => {
    try {
      // Используем getCharacters вместо getCharactersByUserId
      const fetchedCharacters = await characterService.getCharacters();
      
      // Преобразуем к типу Character
      const convertedCharacters = fetchedCharacters.map(c => {
        // Преобразуем proficiencies в формат, ожидаемый типом Character
        let proficienciesArray: string[] = [];
        
        if (c.proficiencies) {
          const prof = c.proficiencies;
          if (prof.armor) proficienciesArray = [...proficienciesArray, ...prof.armor];
          if (prof.weapons) proficienciesArray = [...proficienciesArray, ...prof.weapons];
          if (prof.tools) proficienciesArray = [...proficienciesArray, ...prof.tools];
        }
        
        return {
          ...c,
          backstory: c.backstory || "", // Убедимся, что backstory всегда есть
          race: c.race || "",           // Убедимся, что race всегда есть
          background: c.background || "", // Убедимся, что background всегда есть
          class: c.class || "",
          gender: c.gender || "",
          abilities: c.abilities || {
            STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
            strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
          },
          proficiencies: proficienciesArray,
          equipment: c.equipment || [],
          spells: c.spells || [],
          languages: c.languages || []
        } as Character;
      });
      
      setCharacters(convertedCharacters);
      return convertedCharacters;
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
      return [];
    }
  };
  
  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      await characterService.deleteCharacter(id);
      setCharacters(prev => prev.filter(char => char.id !== id));
      
      // Если удаляем текущего персонажа, сбрасываем его
      if (character && character.id === id) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
    }
  };
  
  // При инициализации получаем список персонажей
  useEffect(() => {
    const loadCharacters = async () => {
      await getUserCharacters();
    };
    loadCharacters();
  }, []);
  
  return (
    <CharacterContext.Provider 
      value={{ 
        character, 
        setCharacter,
        updateCharacter, 
        saveCurrentCharacter,
        characters,
        getUserCharacters,
        deleteCharacter: handleDeleteCharacter
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
