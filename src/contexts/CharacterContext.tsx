import React, { createContext, useState, useEffect, useContext } from 'react';
import characterService from '@/services/characterService';
import { SorceryPoints, CharacterSheet } from '@/types/character';
import { normalizeSpells, extractSpellNames } from '@/utils/spellUtils';

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
  backstory?: string; // Добавляем поле, которое требуется в CharacterSheet
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
  skillProficiencies?: {[skillName: string]: boolean};
  savingThrowProficiencies?: {[ability: string]: boolean};
  image?: string;
}

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
      
      // Convert character object to CharacterSheet type for saving
      const characterSheet = {
        ...updatedCharacter,
        // Ensure spells are saved as an array of strings for compatibility
        spells: Array.isArray(updatedCharacter.spells) 
          ? extractSpellNames(updatedCharacter.spells)
          : [],
        // Ensure we have the correct abilities format
        abilities: {
          STR: updatedCharacter.abilities.STR,
          DEX: updatedCharacter.abilities.DEX,
          CON: updatedCharacter.abilities.CON,
          INT: updatedCharacter.abilities.INT,
          WIS: updatedCharacter.abilities.WIS,
          CHA: updatedCharacter.abilities.CHA,
          strength: updatedCharacter.abilities.strength || updatedCharacter.abilities.STR,
          dexterity: updatedCharacter.abilities.dexterity || updatedCharacter.abilities.DEX,
          constitution: updatedCharacter.abilities.constitution || updatedCharacter.abilities.CON,
          intelligence: updatedCharacter.abilities.intelligence || updatedCharacter.abilities.INT,
          wisdom: updatedCharacter.abilities.wisdom || updatedCharacter.abilities.WIS,
          charisma: updatedCharacter.abilities.charisma || updatedCharacter.abilities.CHA
        }
      } as unknown as CharacterSheet;
      
      const savedChar = await characterService.saveCharacter(characterSheet);
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
