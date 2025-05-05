
import React, { createContext, useState, useEffect, useContext } from 'react';
import characterService from '@/services/characterService';
import { Character, CharacterSheet, CharacterSpell } from '@/types/character';
import { normalizeSpells } from '@/utils/spellUtils';

export interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  characters: Character[];
  getUserCharacters: () => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  characters: [],
  getUserCharacters: async () => [],
  deleteCharacter: async () => {},
});

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
        // Гарантируем наличие обязательных полей для CharacterSheet
        backstory: character.backstory || ''
      };
      
      if (!updatedCharacter.createdAt) {
        updatedCharacter.createdAt = new Date().toISOString();
      }
      
      // Преобразуем к требуемому типу перед сохранением
      const characterToSave = {
        ...updatedCharacter,
        // Убеждаемся, что spells - это массив строк для CharacterSheet
        spells: Array.isArray(updatedCharacter.spells) 
          ? updatedCharacter.spells.map(spell => 
              typeof spell === 'string' ? spell : spell.name
            )
          : updatedCharacter.spells
      } as unknown as CharacterSheet;
      
      const savedChar = await characterService.saveCharacter(characterToSave);
      if (savedChar) {
        setCharacter({...updatedCharacter, id: savedChar.id});
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
      const fetchedCharacters = await characterService.getCharactersByUserId();
      // Приводим CharacterSheet к типу Character
      const characterArray: Character[] = fetchedCharacters.map((char: CharacterSheet) => ({
        ...(char as unknown as Character)
      }));
      
      setCharacters(characterArray);
      return characterArray;
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
