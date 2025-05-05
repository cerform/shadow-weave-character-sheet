import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/services/firebase';
import characterService from '@/services/characterService';
import { isOfflineMode } from '@/utils/authHelpers';

interface CharacterContextProps {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  loading: boolean;
  updateCharacter: (updates: Partial<Character>) => void;
  createNewCharacter?: (initialData: Omit<Character, 'id'>) => Promise<Character>;
  deleteCharacter?: (characterId: string) => Promise<void>;
  characters: Character[]; // Add this property
  getUserCharacters: () => Promise<Character[]>; // Add this method
}

// Создаем контекст персонажа с значениями по умолчанию
const defaultCharacterContext: CharacterContextProps = {
  character: null,
  setCharacter: () => {},
  loading: false,
  updateCharacter: () => {},
  characters: [], // Default empty array
  getUserCharacters: async () => [] // Default implementation
};

export const CharacterContext = createContext<CharacterContextProps>(defaultCharacterContext);

// Hook для использования контекста персонажа
export const useCharacter = () => useContext(CharacterContext);

// Создаем провайдер контекста персонажа
export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Нормализация заклинаний из строк в объекты CharacterSpell
  const normalizeCharacterSpells = (characterData: any): Character => {
    if (characterData && Array.isArray(characterData.spells)) {
      // Преобразуем строки в объекты CharacterSpell если нужно
      const normalizedSpells = characterData.spells.map((spell: string | CharacterSpell) => {
        if (typeof spell === 'string') {
          return {
            name: spell,
            level: 0,  // Значение по умолчанию, будет заменено позже
            school: 'Неизвестная',
            prepared: false
          } as CharacterSpell;
        }
        return {
          ...spell,
          prepared: spell.prepared ?? false
        };
      });
      
      return {
        ...characterData,
        spells: normalizedSpells
      };
    }
    
    return characterData;
  };

  // Функция для сохранения персонажа в localStorage
  const saveCharacterToLocalStorage = (character: Character) => {
    try {
      // Получаем существующих персонажей из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Проверяем, существует ли уже персонаж с таким ID
      const existingIndex = characters.findIndex((c: Character) => c.id === character.id);
      
      if (existingIndex !== -1) {
        // Если персонаж существует, заменяем его
        characters[existingIndex] = character;
      } else {
        // Если персонаж не существует, добавляем его в массив
        characters.push(character);
      }
      
      // Сохраняем обновленный массив персонажей в localStorage
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      localStorage.setItem('last-selected-character', character.id);
    } catch (error) {
      console.error('Ошибка при с��хранении персонажа в localStorage:', error);
    }
  };

  // Функция для загрузки персонажа из localStorage
  const loadCharacterFromLocalStorage = useCallback((characterId: string) => {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (savedCharacters) {
        const characters = JSON.parse(savedCharacters);
        const foundCharacter = characters.find((c: Character) => c.id === characterId);
        return foundCharacter || null;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при загрузке персонажа из localStorage:', error);
      return null;
    }
  }, []);

  // Загрузка персонажа при инициализации
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        setLoading(true);
        
        // Проверяем авторизацию
        const currentUser = auth.currentUser;
        
        // Пробуем загрузить персонажа через сервис
        let foundCharacter = null;
        
        // Получаем ID последнего просмотренного персонажа
        const lastSelectedCharacterId = localStorage.getItem('last-selected-character');
        
        if (lastSelectedCharacterId) {
          try {
            foundCharacter = await characterService.getCharacterById(lastSelectedCharacterId);
          } catch (error) {
            console.error("Ошибка при загрузке персонажа из Firestore:", error);
          }
          
          // Если персонаж не найден через сервис или в оффлайн-режиме, проверяем localStorage
          if (!foundCharacter || isOfflineMode()) {
            const localCharacter = loadCharacterFromLocalStorage(lastSelectedCharacterId);
            if (localCharacter) {
              foundCharacter = localCharacter;
              
              // Если пользователь авторизован и не в оффлайн-режиме, синхронизируем с Firestore
              if (currentUser && !isOfflineMode()) {
                try {
                  foundCharacter.userId = currentUser.uid;
                  await characterService.saveCharacter(foundCharacter);
                } catch (syncError) {
                  console.error("Ошибка синхронизации с Firestore:", syncError);
                }
              }
            }
          }
        }
        
        if (foundCharacter) {
          // Нормализуем и устанавливаем персонажа
          const normalizedCharacter = normalizeCharacterSpells(foundCharacter);
          setCharacter(normalizedCharacter);
        }
      } catch (error) {
        console.error("Ошибка при загрузке персонажа:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [loadCharacterFromLocalStorage]);
  
  // Обновленный метод setCharacter
  const updateCharacter = (newCharacter: Character | null) => {
    if (newCharacter) {
      // Нормализуем заклинания перед установкой
      const normalizedCharacter = normalizeCharacterSpells(newCharacter);
      setCharacter(normalizedCharacter);
    } else {
      setCharacter(null);
    }
  };
  
  // Функция для создания нового персонажа
  const createNewCharacter = async (initialData: Omit<Character, 'id'>): Promise<Character> => {
    const newCharacter: Character = {
      id: uuidv4(),
      ...initialData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Нормализуем заклинания при создании
    const normalizedCharacter = normalizeCharacterSpells(newCharacter);
    
    // Сохраняем персонажа в localStorage
    saveCharacterToLocalStorage(normalizedCharacter);
    
    // Если пользователь авторизован, также сохраняем в Firestore
    if (!isOfflineMode() && normalizedCharacter.userId) {
      try {
        await characterService.saveCharacter(normalizedCharacter as unknown as CharacterSheet);
      } catch (error) {
        console.error('Ошибка при сохранении персонажа в Firestore:', error);
      }
    }
    
    return normalizedCharacter;
  };
  
  // Функция для удаления персонажа
  const deleteCharacter = async (characterId: string) => {
    try {
      // Удаляем персонажа из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (savedCharacters) {
        let characters = JSON.parse(savedCharacters);
        characters = characters.filter((c: Character) => c.id !== characterId);
        localStorage.setItem('dnd-characters', JSON.stringify(characters));
      }
      
      // Удаляем ID последнего просмотренного персонажа, если он совпадает с удаленным
      const lastSelectedCharacterId = localStorage.getItem('last-selected-character');
      if (lastSelectedCharacterId === characterId) {
        localStorage.removeItem('last-selected-character');
      }
      
      // Если онлайн и есть userId, также удаляем из Firestore
      if (!isOfflineMode()) {
        await characterService.deleteCharacter(characterId);
      }
      
      // Очищаем контекст, если удален текущий персонаж
      if (character && character.id === characterId) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
    }
  };
  
  // Значения для контекста
  const contextValue = {
    character,
    setCharacter: (newCharacter: Character | null) => {
      if (newCharacter) {
        // Нормализуем заклинания перед установкой
        const normalizedCharacter = normalizeCharacterSpells(newCharacter);
        setCharacter(normalizedCharacter);
      } else {
        setCharacter(null);
      }
    },
    loading,
    updateCharacter: (updates: Partial<Character>) => {
      if (!character) return;
      
      // Нормализуем заклинания в обновлениях, если они есть
      let normalizedUpdates = updates;
      if (updates.spells) {
        normalizedUpdates = {
          ...updates,
          spells: updates.spells.map((spell: string | CharacterSpell) => {
            if (typeof spell === 'string') {
              return {
                name: spell,
                level: 0,
                school: 'Неизвестная',
                prepared: false
              } as CharacterSpell;
            }
            return {
              ...spell,
              prepared: spell.prepared ?? false
            };
          })
        };
      }
      
      // Обновляем и нормализуем весь объект
      const updatedCharacter = normalizeCharacterSpells({
        ...character,
        ...normalizedUpdates,
        updatedAt: new Date().toISOString()
      });
      
      // Устанавливаем обновленный объект
      setCharacter(updatedCharacter);
      
      // Сохраняем в localStorage
      saveCharacterToLocalStorage(updatedCharacter);
      
      // Если онлайн и есть userId, также сохраняем в Firestore
      if (!isOfflineMode() && updatedCharacter.userId) {
        // Преобразуем для совместимости с CharacterSheet
        const characterSheetData = {
          ...updatedCharacter,
          proficiencies: {
            languages: updatedCharacter.languages || [],
            weapons: [],
            armor: [],
            tools: []
          }
        } as unknown as CharacterSheet;
        
        characterService.saveCharacter(characterSheetData)
          .catch(error => {
            console.error('Ошибка при сохранении персонажа в Firestore:', error);
          });
      }
    },
    createNewCharacter,
    deleteCharacter,
    characters: [], // Add placeholder array
    getUserCharacters: async () => { // Add method implementation
      try {
        return await characterService.getUserCharacters();
      } catch (error) {
        console.error("Error fetching user characters:", error);
        return [];
      }
    }
  };

  // Предоставляем контекст всем дочерним элементам
  return (
    <CharacterContext.Provider value={contextValue}>
      {children}
    </CharacterContext.Provider>
  );
};

// For type exports, we need to use export type due to isolatedModules
export type { Character, CharacterSpell };
