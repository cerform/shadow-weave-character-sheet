
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Character, CharacterSpell, CharacterProficiencies, CharacterSheet } from '@/types/character';
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
  const [characters, setCharacters] = useState<Character[]>([]);
  
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
      console.error('Ошибка при сохранении персонажа в localStorage:', error);
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
                  await characterService.saveCharacter(foundCharacter as CharacterSheet);
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
        
        // Также загружаем список персонажей
        const loadedCharacters = await getUserCharacters();
        setCharacters(loadedCharacters);
      } catch (error) {
        console.error("Ошибка при загрузке персонажа:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [loadCharacterFromLocalStorage]);
  
  // Обновленный метод setCharacter
  const updateCharacter = (newCharacter: Partial<Character>) => {
    if (!character) return;
    
    // Нормализуем заклинания в обновлениях, если они есть
    let normalizedUpdates = newCharacter;
    if (newCharacter.spells) {
      normalizedUpdates = {
        ...newCharacter,
        spells: newCharacter.spells.map((spell: string | CharacterSpell) => {
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
      const characterSheetData = updatedCharacter as CharacterSheet;
      
      characterService.saveCharacter(characterSheetData)
        .catch(error => {
          console.error('Ошибка при сохранении персонажа в Firestore:', error);
        });
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
        await characterService.saveCharacter(normalizedCharacter as CharacterSheet);
      } catch (error) {
        console.error('Ошибка при сохранении персонажа в Firestore:', error);
      }
    }
    
    // Обновляем список персонажей
    const updatedCharacters = await getUserCharacters();
    setCharacters(updatedCharacters);
    
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
      
      // Обновляем список персонажей
      const updatedCharacters = await getUserCharacters();
      setCharacters(updatedCharacters);
      
      // Очищаем контекст, если удален текущий персонаж
      if (character && character.id === characterId) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
    }
  };
  
  // Функция для получения персонажей пользователя
  const getUserCharacters = async () => {
    try {
      if (isOfflineMode()) {
        // В оффлайн режиме загружаем из localStorage
        const savedCharacters = localStorage.getItem('dnd-characters');
        return savedCharacters ? JSON.parse(savedCharacters) : [];
      } else {
        // Иначе пытаемся загрузить из Firestore
        return await characterService.getCharacters();
      }
    } catch (error) {
      console.error("Ошибка при получении персонажей:", error);
      
      // В случае ошибки возвращаем локальные персонажи
      const savedCharacters = localStorage.getItem('dnd-characters');
      return savedCharacters ? JSON.parse(savedCharacters) : [];
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
        saveCharacterToLocalStorage(normalizedCharacter);
      } else {
        setCharacter(null);
      }
    },
    loading,
    updateCharacter,
    createNewCharacter,
    deleteCharacter,
    characters,
    getUserCharacters
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
