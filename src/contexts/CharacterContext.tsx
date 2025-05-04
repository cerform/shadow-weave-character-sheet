
import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveCharacter, getUserCharacters, deleteCharacter as deleteCharacterService } from '@/services/characterService';
import { SorceryPoints } from '@/types/character';

// Интерфейс для характеристик
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
  
  // Для совместимости с CharacterSheet
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

// Интерфейс персонажа для хранения в CharacterContext
export interface Character {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string;
  subclass?: string;
  level: number;
  abilities: AbilityScores;
  proficiencies: string[];
  equipment: string[];
  spells: string[];
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  hitDice?: {
    total: number;
    used: number;
    value: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spellSlots?: {
    [level: string]: {
      max: number;
      used: number;
    };
  };
  sorceryPoints?: SorceryPoints;
  createdAt?: string;
  updatedAt?: string;
}

export interface CharacterContextType {
  character: Character | null;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  characters: Character[];
  getUserCharacters: () => void;
  deleteCharacter: (id: string) => Promise<void>;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  characters: [],
  getUserCharacters: () => {},
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
      const updatedCharacter = { ...character, updatedAt: new Date().toISOString() };
      if (!updatedCharacter.createdAt) {
        updatedCharacter.createdAt = new Date().toISOString();
      }
      
      const savedChar = await saveCharacter(updatedCharacter);
      setCharacter(savedChar);
      
      // Обновляем список персонажей, если сохранение прошло успешно
      await fetchUserCharacters();
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
    }
  };
  
  // Получаем список персонажей пользователя
  const fetchUserCharacters = async () => {
    try {
      const characters = await getUserCharacters();
      setCharacters(characters);
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
    }
  };
  
  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacterService(id);
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
    fetchUserCharacters();
  }, []);
  
  return (
    <CharacterContext.Provider 
      value={{ 
        character, 
        updateCharacter, 
        saveCurrentCharacter,
        characters,
        getUserCharacters: fetchUserCharacters,
        deleteCharacter: handleDeleteCharacter
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
