
import React, { createContext, useState, useEffect, useContext } from 'react';
import characterService from '@/services/characterService';
import { SorceryPoints, CharacterSheet, CharacterSpell } from '@/types/character';

// Экспортируем тип Character для использования в других компонентах
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
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  proficiencies: string[];
  equipment: string[];
  spells: CharacterSpell[] | string[];
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  backstory: string;
  appearance?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
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

// Функция для проверки, является ли объект CharacterSpell
const isCharacterSpell = (obj: any): obj is CharacterSpell => {
  return obj && typeof obj === 'object' && 'name' in obj && 'level' in obj;
};

// Функция для преобразования смешанного массива в массив строк
const convertSpellsToStrings = (spells: (CharacterSpell | string)[]): string[] => {
  return spells.map(spell => typeof spell === 'string' ? spell : spell.name);
};

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
      const charToSave: CharacterSheet = {
        ...updatedCharacter,
        backstory: updatedCharacter.backstory || "", 
        background: updatedCharacter.background || "",
        // Конвертируем spells в массив CharacterSpell
        spells: Array.isArray(updatedCharacter.spells) 
          ? updatedCharacter.spells.map(spell => 
              typeof spell === 'string' ? { name: spell, level: 0, description: '', school: '' } : spell
            ) 
          : [],
        // Преобразуем proficiencies в ожидаемый формат
        proficiencies: {
          armor: [],
          weapons: [],
          tools: [],
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
          proficiencies: [], // Исправлено
          equipment: c.equipment || [],
          // Обрабатываем заклинания правильно
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
